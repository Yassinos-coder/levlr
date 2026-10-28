import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Valkey from 'iovalkey';
import type { CacheStatus } from '@/cache/interfaces';

const CONNECT_TIMEOUT_MS = 2000;
const COMMAND_TIMEOUT_MS = 500;
const MAX_RETRY_DELAY_MS = 5000;

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly client: Valkey | null;

  constructor(config: ConfigService) {
    const url = config.get<string>('valkeyUrl');
    this.client = url ? this.createClient(url) : null;
  }

  get status(): CacheStatus {
    if (!this.client) return 'disabled';
    return this.client.status === 'ready' ? 'up' : 'down';
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    try {
      const raw = await this.client.get(key);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch (error) {
      this.logFailure('get', key, error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
      this.logFailure('set', key, error);
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (!this.client || keys.length === 0) return;
    try {
      await this.client.del(...keys);
    } catch (error) {
      this.logFailure('del', keys.join(','), error);
    }
  }

  async wrap<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await loader();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  async onModuleDestroy() {
    if (!this.client) return;
    try {
      await this.client.quit();
    } catch {
      this.client.disconnect();
    }
  }

  private createClient(url: string): Valkey {
    const client = new Valkey(url, {
      connectTimeout: CONNECT_TIMEOUT_MS,
      commandTimeout: COMMAND_TIMEOUT_MS,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (attempt) => Math.min(attempt * 200, MAX_RETRY_DELAY_MS),
    });
    client.on('error', (error) => this.logger.warn(`Valkey error: ${error.message}`));
    return client;
  }

  private logFailure(operation: string, key: string, error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.warn(`Cache ${operation} failed for ${key}: ${message}`);
  }
}
