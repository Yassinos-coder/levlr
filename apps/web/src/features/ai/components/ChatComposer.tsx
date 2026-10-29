import { SendHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatComposerProps {
  pending: boolean;
  onSend: (text: string) => void;
}

export function ChatComposer({ pending, onSend }: ChatComposerProps) {
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0 && !pending;

  const submit = () => {
    if (!canSend) return;
    onSend(text);
    setText('');
  };

  return (
    <form
      className="flex items-end gap-2 border-t p-2"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Textarea
        rows={1}
        value={text}
        placeholder="Ask about your chart…"
        className="max-h-32 min-h-9 resize-none"
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' || event.shiftKey) return;
          event.preventDefault();
          submit();
        }}
      />
      <Button type="submit" size="icon" disabled={!canSend} aria-label="Send message">
        <SendHorizontal />
      </Button>
    </form>
  );
}
