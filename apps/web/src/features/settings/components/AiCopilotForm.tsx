import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CHAT_PROVIDER_OPTIONS } from '@/features/ai/constants/ai';
import type { AiSettings, ChatProvider } from '@/features/ai/types/ai';

interface AiCopilotFormProps {
  settings: AiSettings;
  hasKey: (provider: ChatProvider) => boolean;
  pending: boolean;
  onSubmit: (settings: AiSettings) => void;
}

export function AiCopilotForm({ settings, hasKey, pending, onSubmit }: AiCopilotFormProps) {
  const { control, register, handleSubmit, setValue, watch } = useForm<AiSettings>({ values: settings });
  const provider = watch('provider');
  const enabled = watch('enabled');
  const planTrades = watch('allowPlanTrades');
  const manageTrades = watch('allowManageTrades');

  const handleProviderChange = (next: ChatProvider) => {
    const previous = CHAT_PROVIDER_OPTIONS.find((option) => option.id === provider);
    const target = CHAT_PROVIDER_OPTIONS.find((option) => option.id === next);
    setValue('provider', next);
    if (target && watch('model') === previous?.defaultModel) setValue('model', target.defaultModel);
  };

  const submit = (values: AiSettings) => onSubmit({ ...values, methodologyPrompt: values.methodologyPrompt?.trim() || null });

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <Controller
        control={control}
        name="enabled"
        render={({ field }) => (
          <CheckRow
            id="ai-enabled"
            checked={field.value}
            onChange={field.onChange}
            title="Enable AI copilot"
            description="Shows the AI panel's chat. Off by default."
          />
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="copilot-provider">Provider</Label>
          <Select value={provider} onValueChange={(value) => handleProviderChange(value as ChatProvider)}>
            <SelectTrigger id="copilot-provider" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHAT_PROVIDER_OPTIONS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="copilot-model">Model</Label>
          <Input id="copilot-model" autoComplete="off" {...register('model', { required: true })} />
        </div>
      </div>
      {enabled && !hasKey(provider) && (
        <p className="text-xs text-warn">You have not added a key for this provider yet. Add one above.</p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="copilot-methodology">How you trade (optional)</Label>
        <Textarea
          id="copilot-methodology"
          rows={4}
          maxLength={4000}
          placeholder="e.g. I trade London and New York session reversals off higher-timeframe levels and never risk more than 0.5% per trade."
          {...register('methodologyPrompt')}
        />
        <p className="text-xs text-muted-foreground">The AI uses this when judging your setups.</p>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">What the AI is allowed to do</legend>
        <CheckRow id="perm-read" checked disabled title="Read your chart and account" description="Candles, your drawn levels, open positions and orders. Always on." />
        <Controller
          control={control}
          name="allowPlanTrades"
          render={({ field }) => (
            <CheckRow
              id="perm-plan"
              checked={field.value}
              onChange={field.onChange}
              title="Plan trades"
              description="The AI can propose a limit or stop order. Nothing is sent until you press Yes on the card."
            />
          )}
        />
        <Controller
          control={control}
          name="allowManageTrades"
          render={({ field }) => (
            <CheckRow
              id="perm-manage"
              checked={field.value}
              onChange={field.onChange}
              title="Manage open trades"
              description="The AI can propose closing a position or moving its stop loss and take profit. Each still needs your Yes."
            />
          )}
        />
        {(planTrades || manageTrades) && (
          <p className="text-xs text-muted-foreground">
            Every trade action needs your explicit confirmation, is checked against your risk limit, and currently only runs on demo
            accounts.
          </p>
        )}
      </fieldset>

      <Button type="submit" disabled={pending}>
        Save AI settings
      </Button>
    </form>
  );
}

interface CheckRowProps {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

function CheckRow({ id, title, description, checked, disabled, onChange }: CheckRowProps) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox id={id} checked={checked} disabled={disabled} onCheckedChange={(value) => onChange?.(value === true)} className="mt-0.5" />
      <div className="space-y-0.5">
        <Label htmlFor={id}>{title}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
