import { BadRequestException } from '@nestjs/common';
import type { OrderProposalPayload } from '@/ai/interfaces';

export class ProposalValidator {
  static assertOrder(payload: OrderProposalPayload, lastPrice: number) {
    const { side, type, entry, sl, tp } = payload;
    const values = [entry, sl, tp ?? entry];
    if (!values.every((value) => Number.isFinite(value) && value > 0)) {
      throw new BadRequestException('Entry, stop loss and take profit must be positive prices');
    }

    const isBuy = side === 'buy';
    if (isBuy ? sl >= entry : sl <= entry) {
      throw new BadRequestException(`A ${side} needs its stop loss ${isBuy ? 'below' : 'above'} the entry`);
    }
    if (tp !== undefined && (isBuy ? tp <= entry : tp >= entry)) {
      throw new BadRequestException(`A ${side} needs its take profit ${isBuy ? 'above' : 'below'} the entry`);
    }

    const entryBelowPrice = entry < lastPrice;
    const limitExpectsBelow = isBuy;
    const expectsBelow = type === 'limit' ? limitExpectsBelow : !limitExpectsBelow;
    if (entryBelowPrice !== expectsBelow) {
      throw new BadRequestException(
        `A ${side} ${type} must have its entry ${expectsBelow ? 'below' : 'above'} the current price (${lastPrice})`,
      );
    }
  }

  static assertSizing(riskPct: number | undefined, lots: number | undefined) {
    if (riskPct !== undefined && !(riskPct > 0)) throw new BadRequestException('Risk % must be above zero');
    if (lots !== undefined && !(lots > 0)) throw new BadRequestException('Lots must be above zero');
  }
}
