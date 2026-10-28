import type { PositionSizeInput, PositionSizeResult } from '@/interfaces';

export class PositionSizingUtils {
  static calculate(input: PositionSizeInput): PositionSizeResult {
    const slPips = Math.abs(input.entry - input.sl) / input.pipSize;
    if (slPips <= 0) throw new RangeError('Stop loss must differ from entry');

    const riskAmount = input.balance * (input.riskPct / 100);
    const rawLots = riskAmount / (slPips * input.pipValuePerLot);
    const steppedLots = Math.floor(rawLots / input.stepVolume + 1e-9) * input.stepVolume;
    const lots = Math.min(Math.max(steppedLots, 0), input.maxVolume);
    const minLotExceedsRisk = lots < input.minVolume;

    return {
      lots: minLotExceedsRisk ? input.minVolume : PositionSizingUtils.round(lots, input.stepVolume),
      riskAmount,
      slPips,
      minLotExceedsRisk,
    };
  }

  private static round(value: number, step: number): number {
    const decimals = Math.max(0, Math.ceil(-Math.log10(step)));
    return Number(value.toFixed(decimals));
  }
}
