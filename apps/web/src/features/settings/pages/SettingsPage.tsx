import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUpdateAiSettingsMutation } from '@/features/ai/hooks/useAiMutations';
import { useAiSettingsQuery } from '@/features/ai/hooks/useAiQueries';
import { AiCopilotForm } from '@/features/settings/components/AiCopilotForm';
import { AiKeyForm } from '@/features/settings/components/AiKeyForm';
import { AiKeyRow } from '@/features/settings/components/AiKeyRow';
import { EmailForm } from '@/features/settings/components/EmailForm';
import { PasswordForm } from '@/features/settings/components/PasswordForm';
import { TotpSetupDialog } from '@/features/settings/components/TotpSetupDialog';
import { TwoFactorSection } from '@/features/settings/components/TwoFactorSection';
import {
  useEnrollTotpMutation,
  useRemoveAiKeyMutation,
  useSaveAiKeyMutation,
  useUnenrollTotpMutation,
  useUpdateEmailMutation,
  useUpdatePasswordMutation,
  useVerifyTotpMutation,
} from '@/features/settings/hooks/useSettingsMutations';
import { useAiKeysQuery, useTotpFactorsQuery } from '@/features/settings/hooks/useSettingsQueries';
import type { AiProviderKey, TotpFactor } from '@/features/settings/types/settings';
import { navigate } from '@/hooks/useHashRoute';

interface SettingsPageProps {
  userId: string;
  email: string;
}

export function SettingsPage({ userId, email }: SettingsPageProps) {
  const [setupOpen, setSetupOpen] = useState(false);
  const [factorToDisable, setFactorToDisable] = useState<TotpFactor | null>(null);
  const [keyToRemove, setKeyToRemove] = useState<AiProviderKey | null>(null);

  const updateEmail = useUpdateEmailMutation();
  const updatePassword = useUpdatePasswordMutation();
  const factors = useTotpFactorsQuery(userId);
  const enroll = useEnrollTotpMutation();
  const verify = useVerifyTotpMutation(userId);
  const unenroll = useUnenrollTotpMutation(userId);
  const aiKeys = useAiKeysQuery(userId);
  const saveKey = useSaveAiKeyMutation(userId);
  const removeKey = useRemoveAiKeyMutation(userId);
  const aiSettings = useAiSettingsQuery(userId);
  const updateAiSettings = useUpdateAiSettingsMutation(userId);

  const handleEnable = () => {
    setSetupOpen(true);
    enroll.mutate();
  };

  const handleVerify = (code: string) => {
    if (!enroll.data) return;
    verify.mutate({ factorId: enroll.data.factorId, code }, { onSuccess: () => setSetupOpen(false) });
  };

  const handleDisable = () => {
    if (factorToDisable) unenroll.mutate(factorToDisable.id);
    setFactorToDisable(null);
  };

  const handleRemoveKey = () => {
    if (keyToRemove) removeKey.mutate(keyToRemove.provider);
    setKeyToRemove(null);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-aurora">
      <header className="glass flex h-12 shrink-0 items-center justify-between border-x-0 border-t-0 px-4">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8">
        <div className="space-y-3">
          <Button variant="ghost" size="sm" className="-ml-2 gap-1.5" onClick={() => navigate('/')}>
            <ArrowLeft /> Back to workspace
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Account settings</h1>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email</CardTitle>
                <CardDescription>The address you use to sign in.</CardDescription>
              </CardHeader>
              <CardContent>
                <EmailForm currentEmail={email} pending={updateEmail.isPending} onSubmit={(value) => updateEmail.mutate(value)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Choose a new password for your account.</CardDescription>
              </CardHeader>
              <CardContent>
                <PasswordForm pending={updatePassword.isPending} onSubmit={(value) => updatePassword.mutateAsync(value)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-factor authentication</CardTitle>
                <CardDescription>Add a second step to protect your account and connected brokers.</CardDescription>
              </CardHeader>
              <CardContent>
                <TwoFactorSection
                  factors={factors.data ?? []}
                  busy={factors.isPending || unenroll.isPending}
                  onEnable={handleEnable}
                  onDisable={setFactorToDisable}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Copilot</CardTitle>
                <CardDescription>Choose the model and decide exactly what the AI may do for you.</CardDescription>
              </CardHeader>
              <CardContent>
                {aiSettings.data && (
                  <AiCopilotForm
                    settings={aiSettings.data}
                    hasKey={(provider) => (aiKeys.data ?? []).some((item) => item.provider === provider)}
                    pending={updateAiSettings.isPending}
                    onSubmit={(value) => updateAiSettings.mutate(value)}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bring your own AI</CardTitle>
                <CardDescription>
                  Add an API key for the provider you want to use. Requests are billed to your own provider account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {(aiKeys.data ?? []).length > 0 && (
                  <div className="space-y-2">
                    {aiKeys.data?.map((item) => (
                      <AiKeyRow key={item.provider} item={item} onRemove={setKeyToRemove} />
                    ))}
                  </div>
                )}
                <AiKeyForm
                  pending={saveKey.isPending}
                  onSubmit={(provider, apiKey) => saveKey.mutateAsync({ provider, apiKey }).then(() => undefined)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <TotpSetupDialog
        open={setupOpen}
        enrollment={enroll.data}
        loading={enroll.isPending}
        verifying={verify.isPending}
        onVerify={handleVerify}
        onOpenChange={setSetupOpen}
      />
      <ConfirmDialog
        open={factorToDisable !== null}
        title="Disable two-factor authentication?"
        description="Your account will only be protected by your password."
        confirmLabel="Disable"
        destructive
        onConfirm={handleDisable}
        onOpenChange={(open) => !open && setFactorToDisable(null)}
      />
      <ConfirmDialog
        open={keyToRemove !== null}
        title="Remove API key?"
        description="AI features using this provider will stop working until you add a key again."
        confirmLabel="Remove"
        destructive
        onConfirm={handleRemoveKey}
        onOpenChange={(open) => !open && setKeyToRemove(null)}
      />
    </div>
  );
}
