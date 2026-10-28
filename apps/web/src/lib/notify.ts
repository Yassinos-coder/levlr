import { toast } from 'sonner';

export class Notify {
  static success(message: string, description?: string) {
    toast.success(message, { description });
  }

  static error(message: string, description?: string) {
    toast.error(message, { description });
  }

  static info(message: string, description?: string) {
    toast.info(message, { description });
  }

  static warning(message: string, description?: string) {
    toast.warning(message, { description });
  }

  static fromError(error: unknown, fallback: string) {
    toast.error(fallback, { description: error instanceof Error ? error.message : undefined });
  }
}
