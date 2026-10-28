import type { ReactNode } from 'react';

interface WorkspaceHeaderProps {
  email: string;
  onSignOut: () => void;
  children?: ReactNode;
}

export function WorkspaceHeader({ email, onSignOut, children }: WorkspaceHeaderProps) {
  return (
    <header className="flex h-9 items-center justify-between border-b border-neutral-800 px-3 text-xs">
      <span className="font-semibold">Levlr Terminal</span>
      <div className="flex items-center gap-4 text-neutral-400">
        {children}
        <span>{email}</span>
        <button type="button" onClick={onSignOut} className="hover:text-white">
          Sign out
        </button>
      </div>
    </header>
  );
}
