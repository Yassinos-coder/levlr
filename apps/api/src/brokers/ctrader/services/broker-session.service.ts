import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CTraderAdapter, CTraderOAuthUtils } from '@levlr/broker-ctrader';
import type { CTraderAppConfig } from '@levlr/broker-ctrader';
import type { BrokerConnectionSecretRow, BrokerSession, StoredBrokerTokens } from '@/brokers/ctrader/interfaces';
import { BrokerConnectionRepository } from '@/brokers/ctrader/repositories/broker-connection.repository';
import { SecretCipherUtils } from '@/common/utils/secret-cipher.utils';

const TOKEN_EXPIRY_MARGIN_MS = 60_000;

@Injectable()
export class BrokerSessionService {
  constructor(
    private readonly config: ConfigService,
    private readonly connections: BrokerConnectionRepository,
  ) {}

  async open(userId: string, connectionId: string): Promise<BrokerSession> {
    const connection = await this.connections.findSecretById(userId, connectionId);
    if (!connection) throw new BadRequestException('Broker connection not found');

    const tokens = await this.freshTokens(connection);
    const adapter = new CTraderAdapter(this.appConfig);
    await adapter.connect({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accountId: connection.externalAccountId,
      environment: connection.environment === 'live' ? 'live' : 'demo',
    });
    return { adapter, environment: connection.environment === 'live' ? 'live' : 'demo' };
  }

  private async freshTokens(connection: BrokerConnectionSecretRow): Promise<StoredBrokerTokens> {
    const stored = JSON.parse(SecretCipherUtils.decrypt(connection.secretRef, this.encryptionKey)) as StoredBrokerTokens;
    if (stored.expiresAt - TOKEN_EXPIRY_MARGIN_MS > Date.now()) return stored;

    const refreshed = await CTraderOAuthUtils.refresh(this.appConfig, stored.refreshToken);
    const next: StoredBrokerTokens = {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      expiresAt: Date.now() + refreshed.expiresIn * 1000,
    };
    await this.connections.updateSecret(connection.id, SecretCipherUtils.encrypt(JSON.stringify(next), this.encryptionKey));
    return next;
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
