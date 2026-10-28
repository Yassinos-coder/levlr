import {
  CTRADER_HOSTS,
  CTRADER_PAYLOAD_TYPE,
  HEARTBEAT_INTERVAL_MS,
  REQUEST_TIMEOUT_MS,
} from './constants/ctrader.constants';
import { CTraderError } from './ctrader-error';
import type { CTraderEnvironment, CTraderEventListener, CTraderMessage } from './interfaces';

interface PendingRequest {
  resolve: (message: CTraderMessage) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export class CTraderConnection {
  private socket: WebSocket | null = null;
  private heartbeat: ReturnType<typeof setInterval> | null = null;
  private readonly pending = new Map<string, PendingRequest>();
  private readonly listeners = new Set<CTraderEventListener>();
  private readonly closeListeners = new Set<() => void>();
  private nextId = 0;

  connect(environment: CTraderEnvironment): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(CTRADER_HOSTS[environment]);
      this.socket = socket;

      socket.onopen = () => {
        this.startHeartbeat();
        resolve();
      };
      socket.onerror = () => reject(new CTraderError('cTrader connection failed'));
      socket.onmessage = (event) => this.handleMessage(String(event.data));
      socket.onclose = () => this.handleClose();
    });
  }

  request<TResponse = Record<string, unknown>>(
    payloadType: number,
    payload: Record<string, unknown>,
  ): Promise<CTraderMessage<TResponse>> {
    const socket = this.socket;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new CTraderError('cTrader connection is not open'));
    }

    const clientMsgId = `req_${++this.nextId}`;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(clientMsgId);
        reject(new CTraderError(`cTrader request ${payloadType} timed out`));
      }, REQUEST_TIMEOUT_MS);

      this.pending.set(clientMsgId, {
        resolve: resolve as (message: CTraderMessage) => void,
        reject,
        timer,
      });
      socket.send(JSON.stringify({ clientMsgId, payloadType, payload }));
    });
  }

  onEvent(listener: CTraderEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onClose(listener: () => void): () => void {
    this.closeListeners.add(listener);
    return () => this.closeListeners.delete(listener);
  }

  close() {
    this.socket?.close();
  }

  private handleMessage(raw: string) {
    const message = JSON.parse(raw) as CTraderMessage;
    const pending = message.clientMsgId ? this.pending.get(message.clientMsgId) : undefined;

    if (!pending || !message.clientMsgId) {
      this.listeners.forEach((listener) => listener(message));
      return;
    }

    clearTimeout(pending.timer);
    this.pending.delete(message.clientMsgId);

    if (CTraderConnection.isError(message)) {
      const payload = message.payload as { errorCode?: string; description?: string };
      pending.reject(new CTraderError(payload.description ?? 'cTrader request rejected', payload.errorCode));
      return;
    }
    pending.resolve(message);
  }

  private handleClose() {
    if (this.heartbeat) clearInterval(this.heartbeat);
    this.heartbeat = null;
    this.pending.forEach((request) => {
      clearTimeout(request.timer);
      request.reject(new CTraderError('cTrader connection closed'));
    });
    this.pending.clear();
    this.closeListeners.forEach((listener) => listener());
  }

  private startHeartbeat() {
    this.heartbeat = setInterval(() => {
      this.socket?.send(JSON.stringify({ payloadType: CTRADER_PAYLOAD_TYPE.HEARTBEAT_EVENT, payload: {} }));
    }, HEARTBEAT_INTERVAL_MS);
  }

  private static isError(message: CTraderMessage): boolean {
    return (
      message.payloadType === CTRADER_PAYLOAD_TYPE.ERROR_RES ||
      message.payloadType === CTRADER_PAYLOAD_TYPE.OA_ERROR_RES ||
      message.payloadType === CTRADER_PAYLOAD_TYPE.ORDER_ERROR_EVENT
    );
  }
}
