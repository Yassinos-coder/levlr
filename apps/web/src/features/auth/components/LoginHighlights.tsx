import { Gauge, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const HIGHLIGHTS = [
  { icon: ShieldCheck, title: 'Risk first', text: 'Position size comes from your stop and risk percent, enforced before every order.' },
  { icon: LayoutDashboard, title: 'Your workspace', text: 'Dock, tab and save layouts. Switch between scalping and swing in a click.' },
  { icon: Gauge, title: 'Connected to your broker', text: 'Bring your own account. Live prices and orders straight from the source.' },
];

export function LoginHighlights({ className }: { className?: string }) {
  return (
    <section className={cn('max-w-xl space-y-8', className)}>
      <div className="space-y-4">
        <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight">
          Trade with <span className="text-gradient">precision</span>,<br />
          not guesswork.
        </h1>
        <p className="text-lg text-muted-foreground">A multi-asset terminal built around risk control and the way you actually trade.</p>
      </div>
      <ul className="space-y-4">
        {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-card/60 text-primary">
              <Icon className="size-5" />
            </div>
            <div>
              <p className="font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
