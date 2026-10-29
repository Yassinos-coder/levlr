import { useState } from 'react';
import { AppDialog } from '@/components/shared/AppDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SaveLayoutDialogProps {
  open: boolean;
  pending: boolean;
  onSave: (name: string) => void;
  onOpenChange: (open: boolean) => void;
}

export function SaveLayoutDialog({ open, pending, onSave, onOpenChange }: SaveLayoutDialogProps) {
  const [name, setName] = useState('');
  const trimmed = name.trim();

  const handleOpenChange = (next: boolean) => {
    if (!next) setName('');
    onOpenChange(next);
  };

  return (
    <AppDialog
      open={open}
      title="Save layout"
      description="Give this arrangement of panels a name so you can come back to it."
      onOpenChange={handleOpenChange}
      footer={
        <Button disabled={!trimmed || pending} onClick={() => onSave(trimmed)}>
          Save layout
        </Button>
      }
    >
      <Input
        autoFocus
        maxLength={40}
        placeholder="e.g. Scalping"
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && trimmed && !pending && onSave(trimmed)}
      />
    </AppDialog>
  );
}
