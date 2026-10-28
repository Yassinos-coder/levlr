import { GOOD_LATENCY_MS, WARN_LATENCY_MS } from '@/features/status/constants/status';
import type { LatencyLevel } from '@/features/status/types/status';

export class LatencyUtils {
  static level(ms: number | null): LatencyLevel {
    if (ms === null) return 'offline';
    if (ms <= GOOD_LATENCY_MS) return 'good';
    if (ms <= WARN_LATENCY_MS) return 'warn';
    return 'bad';
  }
}
