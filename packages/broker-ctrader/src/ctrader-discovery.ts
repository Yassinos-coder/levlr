import { CTRADER_PAYLOAD_TYPE } from './constants/ctrader.constants';
import { CTraderConnection } from './ctrader-connection';
import { CTraderClient } from './ctrader-client';
import type { CTraderAppConfig, CTraderRawAccount } from './interfaces';

export class CTraderDiscovery {
  static async listAccounts(app: CTraderAppConfig, accessToken: string): Promise<CTraderRawAccount[]> {
    const connection = new CTraderConnection();
    try {
      await connection.connect('demo');
      await CTraderClient.authenticateApplication(connection, app);
      const response = await connection.request(CTRADER_PAYLOAD_TYPE.GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ, { accessToken });
      const payload = response.payload as { ctidTraderAccount?: CTraderRawAccount[] };
      return payload.ctidTraderAccount ?? [];
    } finally {
      connection.close();
    }
  }
}
