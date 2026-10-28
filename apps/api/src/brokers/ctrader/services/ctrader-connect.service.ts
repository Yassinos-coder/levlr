import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CTraderDiscovery, CTraderOAuthUtils } from '@levlr/broker-ctrader';
import type { CTraderAppConfig, CTraderRawAccount, CTraderTokens } from '@levlr/broker-ctrader';
import { BrokerConnectionRepository } from '@/brokers/ctrader/repositories/broker-connection.repository';
import type { StoredBrokerTokens } from '@/brokers/ctrader/interfaces';
import { CTraderStateValidator } from '@/brokers/ctrader/validators/ctrader-state.validator';
import { CTraderCallbackDto } from '@/brokers/ctrader/dto/ctrader-callback.dto';
import { SecretCipherUtils } from '@/common/utils/secret-cipher.utils';

const BROKER_ID = 'ctrader';

@Injectable()
export class CTraderConnectService {
  private readonly logger = new Logger(CTraderConnectService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly connections: BrokerConnectionRepository,
  ) {}

  buildConnectUrl(userId: string): string {
    const state = CTraderStateValidator.sign(userId, this.encryptionKey);
    return CTraderOAuthUtils.buildAuthorizationUrl(this.appConfig, state);
  }

  async handleCallback(query: CTraderCallbackDto): Promise<string> {
    if (query.error) return this.webRedirect('error', query.error);

    try {
      const { userId } = CTraderStateValidator.verify(query.state, this.encryptionKey);
      if (!query.code) return this.webRedirect('error', 'missing_code');

      const tokens = await CTraderOAuthUtils.exchangeCode(this.appConfig, query.code);
      const accounts = await CTraderDiscovery.listAccounts(this.appConfig, tokens.accessToken);
      await Promise.all(accounts.map((account) => this.saveAccount(userId, account, tokens)));
      return this.webRedirect('connected');
    } catch (error) {
      this.logger.warn(`cTrader callback failed: ${error instanceof Error ? error.message : String(error)}`);
      return this.webRedirect('error', 'connection_failed');
    }
  }

  private saveAccount(userId: string, account: CTraderRawAccount, tokens: CTraderTokens) {
    const stored: StoredBrokerTokens = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: Date.now() + tokens.expiresIn * 1000,
    };
    return this.connections.upsert({
      userId,
      broker: BROKER_ID,
      environment: account.isLive ? 'live' : 'demo',
      externalAccountId: String(account.ctidTraderAccountId),
      accountLabel: account.traderLogin ? String(account.traderLogin) : String(account.ctidTraderAccountId),
      secretRef: SecretCipherUtils.encrypt(JSON.stringify(stored), this.encryptionKey),
    });
  }

  private webRedirect(status: 'connected' | 'error', reason?: string): string {
    const origin = this.config.get<string>('corsOrigin') ?? '';
    const params = new URLSearchParams({ broker: BROKER_ID, status });
    if (reason) params.set('reason', reason);
    return `${origin}/?${params.toString()}`;
  }

  private get encryptionKey(): string {
    const key = this.config.get<string>('encryptionKey');
    if (!key) throw new InternalServerErrorException('ENCRYPTION_KEY is not configured');
    return key;
  }

  private get appConfig(): CTraderAppConfig {
    const { clientId, clientSecret, redirectUri } = this.config.get('ctrader') as CTraderAppConfig;
    if (!clientId || !clientSecret) throw new InternalServerErrorException('Spotware credentials are not configured');
    return { clientId, clientSecret, redirectUri };
  }
}
