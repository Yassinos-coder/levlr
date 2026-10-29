import { BadRequestException } from '@nestjs/common';
import type { AccountInfo, SymbolSpec } from '@levlr/broker-core';
import { PositionSizingUtils } from '@levlr/risk';
import type { ResolvedSize, SizingInput } from '@/ai/interfaces';

interface ResolveSizeInput {
  entry: number;
  sl: number;
  sizing: SizingInput;
  spec: SymbolSpec | undefined;
  account: AccountInfo;
  maxRiskPct: number;
}

export class ProposalSizingUtils {
  static resolve({ entry, sl, sizing, spec, account, maxRiskPct }: ResolveSizeInput): ResolvedSize {
    if (!spec) throw new BadRequestException('This symbol is not available on your broker account');
    if (!spec.quoteCurrency || spec.quoteCurrency !== account.currency) {
      throw new BadRequestException('Sizing is only supported for symbols quoted in your account currency');
    }
    if (sizing.lots === undefined && sizing.riskPct === undefined) {
      throw new BadRequestException('Choose a position size: lots or risk %');
    }

    const pipValuePerLot = spec.pipSize * spec.contractSize;
    const slPips = Math.abs(entry - sl) / spec.pipSize;
    const size =
      sizing.lots !== undefined
        ? ProposalSizingUtils.fromLots(sizing.lots, slPips, pipValuePerLot, account.balance, spec)
        : ProposalSizingUtils.fromRisk(sizing.riskPct ?? 0, entry, sl, pipValuePerLot, account.balance, spec);

    if (size.riskPct > maxRiskPct) {
      throw new BadRequestException(`This trade risks ${size.riskPct.toFixed(2)}%, above your limit of ${maxRiskPct}%`);
    }
    return size;
  }

  private static fromLots(lots: number, slPips: number, pipValuePerLot: number, balance: number, spec: SymbolSpec): ResolvedSize {
    if (lots < spec.minVolume || lots > spec.maxVolume) {
      throw new BadRequestException(`Lots must be between ${spec.minVolume} and ${spec.maxVolume}`);
    }
    const riskAmount = lots * slPips * pipValuePerLot;
    return { lots, riskAmount, riskPct: (riskAmount / balance) * 100 };
  }

  private static fromRisk(
    riskPct: number,
    entry: number,
    sl: number,
    pipValuePerLot: number,
    balance: number,
    spec: SymbolSpec,
  ): ResolvedSize {
    const result = PositionSizingUtils.calculate({
      balance,
      riskPct,
      entry,
      sl,
      pipSize: spec.pipSize,
      pipValuePerLot,
      minVolume: spec.minVolume,
      maxVolume: spec.maxVolume,
      stepVolume: spec.stepVolume,
    });
    if (result.minLotExceedsRisk) {
      throw new BadRequestException(`The minimum lot size (${spec.minVolume}) risks more than ${riskPct}% on this stop`);
    }
    return { lots: result.lots, riskAmount: result.riskAmount, riskPct };
  }
}
