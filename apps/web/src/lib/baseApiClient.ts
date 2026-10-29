import { supabase } from '@/lib/supabase';

export abstract class BaseApiClient {
  protected get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  protected post<T>(path: string, body: unknown = {}): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  protected put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  protected async delete(path: string): Promise<void> {
    await this.request<void>('DELETE', path);
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) throw new Error(await BaseApiClient.errorMessage(response, path));
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  private static async errorMessage(response: Response, path: string): Promise<string> {
    const fallback = `Request to ${path} failed with status ${response.status}`;
    if (response.status >= 500) return fallback;
    try {
      const body = (await response.json()) as { message?: string | string[] };
      const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      return message || fallback;
    } catch {
      return fallback;
    }
  }
}
