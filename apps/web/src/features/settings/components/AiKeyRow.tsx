import { KeyRound, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AI_PROVIDER_OPTIONS } from '@/features/settings/constants/aiProviders';
import type { AiProviderKey } from '@/features/settings/types/settings';

interface AiKeyRowProps {
  item: AiProviderKey;
  onRemove: (item: AiProviderKey) => void;
}

export function AiKeyRow({ item, onRemove }: AiKeyRowProps) {
  const label = AI_PROVIDER_OPTIONS.find((option) => option.id === item.provider)?.label ?? item.provider;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
      <div className="flex items-center gap-3">
        <KeyRound className="size-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="font-mono text-xs text-muted-foreground">••••••••{item.keyHint}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon-sm" aria-label={`Remove ${label} key`} onClick={() => onRemove(item)}>
        <Trash2 />
      </Button>
    </div>
  );
}
