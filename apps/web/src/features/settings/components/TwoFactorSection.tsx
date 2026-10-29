import { ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { TotpFactor } from '@/features/settings/types/settings';

interface TwoFactorSectionProps {
  factors: TotpFactor[];
  busy: boolean;
  onEnable: () => void;
  onDisable: (factor: TotpFactor) => void;
}

export function TwoFactorSection({ factors, busy, onEnable, onDisable }: TwoFactorSectionProps) {
  const [factor] = factors;
  const enabled = factor !== undefined;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground">
          <ShieldCheck className="size-5" />
        </div>
        <div className="space-y-0.5">
          <p className="flex items-center gap-2 text-sm font-medium">
            Authenticator app
            <Badge variant={enabled ? 'default' : 'secondary'}>{enabled ? 'Enabled' : 'Off'}</Badge>
          </p>
          <p className="text-xs text-muted-foreground">Require a 6-digit code from your phone each time you sign in.</p>
        </div>
      </div>
      {enabled ? (
        <Button variant="outline" disabled={busy} onClick={() => onDisable(factor)}>
          Disable
        </Button>
      ) : (
        <Button disabled={busy} onClick={onEnable}>
          Enable
        </Button>
      )}
    </div>
  );
}
