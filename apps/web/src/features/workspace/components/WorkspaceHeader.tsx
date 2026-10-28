import type { ReactNode } from 'react';
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { UserMenu } from '@/features/auth/components/UserMenu';

interface WorkspaceHeaderProps {
  email: string;
  onSignOut: () => void;
  children?: ReactNode;
}

export function WorkspaceHeader({ email, onSignOut, children }: WorkspaceHeaderProps) {
  return (
    <header className="glass flex h-12 shrink-0 items-center justify-between border-x-0 border-t-0 px-4">
      <Logo />
      <div className="flex items-center gap-3">
        {children}
        <ThemeToggle />
        <UserMenu email={email} onSignOut={onSignOut} />
      </div>
    </header>
  );
}
