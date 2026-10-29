import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TOTP_CODE_LENGTH } from '@/features/settings/constants/aiProviders';

interface TotpCodeInputProps {
  pending: boolean;
  submitLabel: string;
  onSubmit: (code: string) => void;
}

export function TotpCodeInput({ pending, submitLabel, onSubmit }: TotpCodeInputProps) {
  const [code, setCode] = useState('');
  const ready = code.length === TOTP_CODE_LENGTH;

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (ready) onSubmit(code);
      }}
    >
      <Input
        autoFocus
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="123456"
        maxLength={TOTP_CODE_LENGTH}
        className="font-mono tracking-widest"
        value={code}
        onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
      />
      <Button type="submit" disabled={!ready || pending}>
        {submitLabel}
      </Button>
    </form>
  );
}
