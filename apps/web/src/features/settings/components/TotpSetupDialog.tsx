import { AppDialog } from '@/components/shared/AppDialog';
import { PanelState } from '@/components/shared/PanelState';
import { TotpCodeInput } from '@/features/settings/components/TotpCodeInput';
import type { TotpEnrollment } from '@/features/settings/types/settings';

interface TotpSetupDialogProps {
  open: boolean;
  enrollment: TotpEnrollment | undefined;
  loading: boolean;
  verifying: boolean;
  onVerify: (code: string) => void;
  onOpenChange: (open: boolean) => void;
}

export function TotpSetupDialog({ open, enrollment, loading, verifying, onVerify, onOpenChange }: TotpSetupDialogProps) {
  return (
    <AppDialog
      open={open}
      title="Set up two-factor authentication"
      description="Scan the QR code with an authenticator app such as 1Password, Authy or Google Authenticator, then enter the 6-digit code."
      onOpenChange={onOpenChange}
    >
      {loading || !enrollment ? (
        <PanelState loading title="Preparing setup" className="py-8" />
      ) : (
        <div className="space-y-4">
          <img src={enrollment.qrCode} alt="Two-factor QR code" className="mx-auto size-44 rounded-lg bg-white p-2" />
          <div className="space-y-1 text-center">
            <p className="text-xs text-muted-foreground">Can't scan? Enter this key manually:</p>
            <p className="break-all font-mono text-xs select-all">{enrollment.secret}</p>
          </div>
          <TotpCodeInput pending={verifying} submitLabel="Verify" onSubmit={onVerify} />
        </div>
      )}
    </AppDialog>
  );
}
