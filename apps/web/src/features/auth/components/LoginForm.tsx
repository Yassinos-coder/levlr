import { useForm } from 'react-hook-form';
import { GoogleIcon } from '@/components/shared/GoogleIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { AuthMode, Credentials } from '@/features/auth/types/auth';

interface LoginFormProps {
  mode: AuthMode;
  pending: boolean;
  onSubmit: (credentials: Credentials) => void;
  onToggleMode: () => void;
  onGoogleSignIn: () => void;
}

export function LoginForm({ mode, pending, onSubmit, onToggleMode, onGoogleSignIn }: LoginFormProps) {
  const { register, handleSubmit } = useForm<Credentials>();
  const isSignIn = mode === 'signIn';

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">{isSignIn ? 'Welcome back' : 'Create your account'}</h2>
        <p className="text-sm text-muted-foreground">
          {isSignIn ? 'Sign in to your trading workspace.' : 'Start trading with risk control built in.'}
        </p>
      </div>

      <Button type="button" variant="outline" size="lg" className="w-full" disabled={pending} onClick={onGoogleSignIn}>
        <GoogleIcon className="size-4" />
        Continue with Google
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <Separator className="flex-1" />
        or
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@domain.com" required autoComplete="email" {...register('email')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            required
            minLength={8}
            autoComplete={isSignIn ? 'current-password' : 'new-password'}
            {...register('password')}
          />
        </div>
        <Button type="submit" size="lg" className="w-full bg-brand-gradient text-primary-foreground hover:opacity-90" disabled={pending}>
          {isSignIn ? 'Sign in' : 'Create account'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {isSignIn ? 'New to Levlr?' : 'Already have an account?'}{' '}
        <button type="button" onClick={onToggleMode} className="font-medium text-primary hover:underline">
          {isSignIn ? 'Create an account' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}
