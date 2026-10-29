import type { OrderProposalPayload, ProposalKind, ProposalPayload, ProposalRow, ProposalStatus, ProposalSummary } from '@/ai/interfaces';

export class ProposalMapper {
  static toSummary(row: ProposalRow): ProposalSummary {
    const kind = row.kind as ProposalKind;
    const payload = row.payload as ProposalPayload;
    return {
      id: row.id,
      kind,
      status: row.status as ProposalStatus,
      environment: row.connection.environment,
      payload,
      needsSize: kind === 'order' && ProposalMapper.lacksSize(payload as OrderProposalPayload),
      expiresAt: row.expiresAt.toISOString(),
    };
  }

  private static lacksSize(payload: OrderProposalPayload): boolean {
    return payload.riskPct === undefined && payload.lots === undefined;
  }
}
