import { supabase } from '@/lib/supabase';

export abstract class BaseApiClient {
  protected async get<T>(path: string): Promise<T> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Request to ${path} failed with status ${response.status}`);
    return (await response.json()) as T;
  }
}
