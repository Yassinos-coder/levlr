import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AI_PROVIDER_OPTIONS, DEFAULT_AI_PROVIDER } from '@/features/settings/constants/aiProviders';
import type { AiProviderId } from '@/features/settings/types/settings';

interface AiKeyFormProps {
  pending: boolean;
  onSubmit: (provider: AiProviderId, apiKey: string) => Promise<void>;
}

export function AiKeyForm({ pending, onSubmit }: AiKeyFormProps) {
  const [provider, setProvider] = useState<AiProviderId>(DEFAULT_AI_PROVIDER.id);
  const [apiKey, setApiKey] = useState('');
  const option = AI_PROVIDER_OPTIONS.find((item) => item.id === provider) ?? DEFAULT_AI_PROVIDER;

  const submit = async () => {
    try {
      await onSubmit(provider, apiKey.trim());
      setApiKey('');
    } catch {
      return;
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="ai-provider">Provider</Label>
        <Select value={provider} onValueChange={(value) => setProvider(value as AiProviderId)}>
          <SelectTrigger id="ai-provider" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AI_PROVIDER_OPTIONS.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ai-key">API key</Label>
        <Input
          id="ai-key"
          type="password"
          autoComplete="off"
          placeholder={option.keyPlaceholder}
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Stored encrypted on our server and never shown again. Saving a key for a provider replaces the previous one.
        </p>
      </div>
      <Button type="submit" disabled={pending || apiKey.trim().length < 8}>
        Save key
      </Button>
    </form>
  );
}
