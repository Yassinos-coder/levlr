import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EmailChangeInput } from '@/features/settings/types/settings';

interface EmailFormProps {
  currentEmail: string;
  pending: boolean;
  onSubmit: (email: string) => void;
}

export function EmailForm({ currentEmail, pending, onSubmit }: EmailFormProps) {
  const { register, handleSubmit, watch } = useForm<EmailChangeInput>({ defaultValues: { email: currentEmail } });
  const unchanged = watch('email')?.trim() === currentEmail;

  return (
    <form onSubmit={handleSubmit(({ email }) => onSubmit(email.trim()))} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="settings-email">Email address</Label>
        <Input id="settings-email" type="email" required autoComplete="email" {...register('email')} />
        <p className="text-xs text-muted-foreground">We will send a confirmation link to the new address.</p>
      </div>
      <Button type="submit" disabled={pending || unchanged}>
        Update email
      </Button>
    </form>
  );
}
