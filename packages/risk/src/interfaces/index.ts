export interface PositionSizeInput {
  balance: number;
  riskPct: number;
  entry: number;
  sl: number;
  pipSize: number;
  pipValuePerLot: number;
  minVolume: number;
  maxVolume: number;
  stepVolume: number;
}

export interface PositionSizeResult {
  lots: number;
  riskAmount: number;
  slPips: number;
  minLotExceedsRisk: boolean;
}
