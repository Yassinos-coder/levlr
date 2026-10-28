import { useForm } from 'react-hook-form';
import type { AuthMode, Credentials } from '@/features/auth/types/auth';

interface LoginFormProps {
  mode: AuthMode;
  pending: boolean;
  errorMessage?: string;
  onSubmit: (credentials: Credentials) => void;
  onToggleMode: () => void;
}

export function LoginForm({ mode, pending, errorMessage, onSubmit, onToggleMode }: LoginFormProps) {
  const { register, handleSubmit } = useForm<Credentials>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-80 flex-col gap-3">
      <h1 className="text-lg font-semibold">Levlr Terminal</h1>
      <input
        type="email"
        placeholder="Email"
        required
        className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
        {...register('email')}
      />
      <input
        type="password"
        placeholder="Password"
        required
        minLength={8}
        className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
        {...register('password')}
      />
      {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-blue-600 px-3 py-2 text-sm font-medium disabled:opacity-50"
      >
        {mode === 'signIn' ? 'Sign in' : 'Create account'}
      </button>
      <button type="button" onClick={onToggleMode} className="text-xs text-neutral-400">
        {mode === 'signIn' ? 'No account? Sign up' : 'Have an account? Sign in'}
      </button>
    </form>
  );
}
