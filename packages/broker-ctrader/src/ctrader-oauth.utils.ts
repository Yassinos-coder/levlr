import { CTRADER_AUTH_URL, CTRADER_TOKEN_URL } from './constants/ctrader.constants';
import { CTraderError } from './ctrader-error';
import type { CTraderAppConfig, CTraderTokenResponse, CTraderTokens } from './interfaces';

export class CTraderOAuthUtils {
  static buildAuthorizationUrl(config: CTraderAppConfig, state: string): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: 'trading',
      product: 'web',
      state,
    });
    return `${CTRADER_AUTH_URL}?${params.toString()}`;
  }

  static async exchangeCode(config: CTraderAppConfig, code: string): Promise<CTraderTokens> {
    return CTraderOAuthUtils.requestTokens({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    });
  }

  static async refresh(config: CTraderAppConfig, refreshToken: string): Promise<CTraderTokens> {
    return CTraderOAuthUtils.requestTokens({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    });
  }

  private static async requestTokens(query: Record<string, string>): Promise<CTraderTokens> {
    const response = await fetch(`${CTRADER_TOKEN_URL}?${new URLSearchParams(query).toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new CTraderError(`Token request failed with status ${response.status}`);

    const body = (await response.json()) as CTraderTokenResponse;
    if (body.errorCode) throw new CTraderError(body.description ?? 'Token request rejected', body.errorCode);
    if (!body.accessToken || !body.refreshToken) throw new CTraderError('Token response missing tokens');

    return { accessToken: body.accessToken, refreshToken: body.refreshToken, expiresIn: body.expiresIn ?? 0 };
  }
}
