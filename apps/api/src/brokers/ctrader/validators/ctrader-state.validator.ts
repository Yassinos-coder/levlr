import { BadRequestException } from '@nestjs/common';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type { CTraderOAuthState } from '@/brokers/ctrader/interfaces';

const STATE_TTL_MS = 10 * 60 * 1000;

export class CTraderStateValidator {
  static sign(userId: string, secret: string): string {
    const state: CTraderOAuthState = { userId, nonce: randomUUID(), issuedAt: Date.now() };
    const body = Buffer.from(JSON.stringify(state)).toString('base64url');
    return `${body}.${CTraderStateValidator.signature(body, secret)}`;
  }

  static verify(token: string | undefined, secret: string): CTraderOAuthState {
    if (!token) throw new BadRequestException('Missing state');

    const [body, signature] = token.split('.');
    if (!body || !signature) throw new BadRequestException('Malformed state');

    const expected = Buffer.from(CTraderStateValidator.signature(body, secret));
    const received = Buffer.from(signature);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      throw new BadRequestException('Invalid state signature');
    }

    const state = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as CTraderOAuthState;
    if (Date.now() - state.issuedAt > STATE_TTL_MS) throw new BadRequestException('State expired');
    return state;
  }

  private static signature(body: string, secret: string): string {
    return createHmac('sha256', secret).update(body).digest('base64url');
  }
}
