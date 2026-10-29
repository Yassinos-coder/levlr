import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SUGGESTED_PROMPTS } from '@/features/ai/constants/ai';

interface ChatEmptyStateProps {
  onPick: (prompt: string) => void;
}

export function ChatEmptyState({ onPick }: ChatEmptyStateProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="flex size-11 items-center justify-center rounded-xl border bg-muted/50 text-muted-foreground">
        <Brain className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">Ask about your chart</p>
        <p className="max-w-64 text-xs text-muted-foreground">
          Draw a level, then ask how often price touched it, or whether a trade idea makes sense.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <Button key={prompt} variant="outline" size="sm" className="h-auto whitespace-normal py-1.5 text-xs" onClick={() => onPick(prompt)}>
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
}
