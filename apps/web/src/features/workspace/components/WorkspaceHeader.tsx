interface WorkspaceHeaderProps {
  email: string;
  onSignOut: () => void;
}

export function WorkspaceHeader({ email, onSignOut }: WorkspaceHeaderProps) {
  return (
    <header className="flex h-9 items-center justify-between border-b border-neutral-800 px-3 text-xs">
      <span className="font-semibold">Levlr Terminal</span>
      <div className="flex items-center gap-3 text-neutral-400">
        <span>{email}</span>
        <button type="button" onClick={onSignOut} className="hover:text-white">
          Sign out
        </button>
      </div>
    </header>
  );
}
