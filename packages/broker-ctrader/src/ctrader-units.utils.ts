import { VOLUME_UNITS_PER_CENT } from '@/constants/ctrader.constants';

export class CTraderUnitsUtils {
  static unitsToProtocolVolume(units: number): number {
    return Math.round(units * VOLUME_UNITS_PER_CENT);
  }

  static protocolVolumeToUnits(volume: number): number {
    return volume / VOLUME_UNITS_PER_CENT;
  }

  static lotsToUnits(lots: number, lotSizeInCents: number): number {
    return (lots * lotSizeInCents) / VOLUME_UNITS_PER_CENT;
  }

  static unitsToLots(units: number, lotSizeInCents: number): number {
    return (units * VOLUME_UNITS_PER_CENT) / lotSizeInCents;
  }
}
