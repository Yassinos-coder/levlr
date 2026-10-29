import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PasswordChangeInput } from '@/features/settings/types/settings';

const MIN_PASSWORD_LENGTH = 8;

interface PasswordFormProps {
  pending: boolean;
  onSubmit: (password: string) => Promise<void>;
}

export function PasswordForm({ pending, onSubmit }: PasswordFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<PasswordChangeInput>();

  const submit = async ({ password }: PasswordChangeInput) => {
    try {
      await onSubmit(password);
      reset();
    } catch {
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="settings-password">New password</Label>
        <Input
          id="settings-password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          {...register('password', { required: true, minLength: MIN_PASSWORD_LENGTH })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="settings-confirm-password">Confirm new password</Label>
        <Input
          id="settings-confirm-password"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword', {
            required: true,
            validate: (value) => value === getValues('password') || 'Passwords do not match',
          })}
        />
        {errors.confirmPassword?.message && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="submit" disabled={pending}>
        Update password
      </Button>
    </form>
  );
}
