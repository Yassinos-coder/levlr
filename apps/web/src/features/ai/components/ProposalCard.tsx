import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type {
  ClosePositionPayload,
  ModifyPositionPayload,
  OrderProposalPayload,
  ProposalSummary,
  SizingChoice,
} from '@/features/ai/types/ai';

type SizeMode = 'riskPct' | 'lots';

interface ProposalCardProps {
  proposal: ProposalSummary;
  pending: boolean;
  onConfirm: (sizing: SizingChoice) => void;
  onReject: () => void;
}

const RESOLVED_LABEL: Record<string, string> = {
  confirmed: 'Confirmed and sent',
  rejected: 'Dismissed',
  expired: 'Expired',
  failed: 'Failed',
};

export function ProposalCard({ proposal, pending, onConfirm, onReject }: ProposalCardProps) {
  const [mode, setMode] = useState<SizeMode>('riskPct');
  const [value, setValue] = useState('0.5');
  const expired = new Date(proposal.expiresAt).getTime() < Date.now();
  const open = proposal.status === 'pending' && !expired;
  const amount = Number(value);
  const sizeValid = !proposal.needsSize || (Number.isFinite(amount) && amount > 0);

  const handleConfirm = () => {
    if (!proposal.needsSize) return onConfirm({});
    onConfirm(mode === 'riskPct' ? { riskPct: amount } : { lots: amount });
  };

  return (
    <div className="space-y-3 rounded-xl border bg-card/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{ProposalCard.title(proposal)}</p>
        <Badge variant="outline" className="uppercase">
          {proposal.environment}
        </Badge>
      </div>

      <ProposalDetails proposal={proposal} />
      <p className="text-xs text-muted-foreground">{proposal.payload.rationale}</p>

      {open && proposal.needsSize && (
        <div className="space-y-2">
          <Label className="text-xs">How big should this trade be?</Label>
          <div className="flex gap-2">
            <ToggleGroup type="single" size="sm" value={mode} onValueChange={(next) => next && setMode(next as SizeMode)}>
              <ToggleGroupItem value="riskPct" className="px-2 text-xs">
                Risk %
              </ToggleGroupItem>
              <ToggleGroupItem value="lots" className="px-2 text-xs">
                Lots
              </ToggleGroupItem>
            </ToggleGroup>
            <Input
              inputMode="decimal"
              className="h-8 font-mono"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              aria-label={mode === 'riskPct' ? 'Risk percent' : 'Lots'}
            />
          </div>
        </div>
      )}

      {open ? (
        <div className="flex gap-2">
          <Button size="sm" disabled={pending || !sizeValid} onClick={handleConfirm}>
            Yes, do it
          </Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={onReject}>
            No
          </Button>
        </div>
      ) : (
        <p className="text-xs font-medium text-muted-foreground">
          {RESOLVED_LABEL[expired && proposal.status === 'pending' ? 'expired' : proposal.status] ?? proposal.status}
        </p>
      )}
    </div>
  );
}

ProposalCard.title = (proposal: ProposalSummary): string => {
  if (proposal.kind === 'close') return 'Close position';
  if (proposal.kind === 'modify') return 'Adjust stop loss / take profit';
  const order = proposal.payload as OrderProposalPayload;
  return `${order.side.toUpperCase()} ${order.type.toUpperCase()} ${order.symbol}`;
};

function ProposalDetails({ proposal }: { proposal: ProposalSummary }) {
  const rows = ProposalDetails.rows(proposal);

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-2">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-mono">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

ProposalDetails.rows = (proposal: ProposalSummary): [string, string][] => {
  if (proposal.kind === 'order') {
    const order = proposal.payload as OrderProposalPayload;
    return [
      ['Entry', String(order.entry)],
      ['Stop loss', String(order.sl)],
      ['Take profit', order.tp === undefined ? '—' : String(order.tp)],
      ['Size', order.riskPct !== undefined ? `${order.riskPct}% risk` : order.lots !== undefined ? `${order.lots} lots` : 'You choose'],
    ];
  }
  if (proposal.kind === 'close') {
    const close = proposal.payload as ClosePositionPayload;
    return [
      ['Position', close.positionId],
      ['Volume', close.volume === undefined ? 'All' : `${close.volume} lots`],
    ];
  }
  const modify = proposal.payload as ModifyPositionPayload;
  return [
    ['Position', modify.positionId],
    ['New stop loss', modify.sl === undefined ? '—' : String(modify.sl)],
    ['New take profit', modify.tp === undefined ? '—' : String(modify.tp)],
  ];
};
