import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE ?? '';

export type WaitlistRow = {
  id: string;
  email: string;
  source: string | null;
  referrer: string | null;
  created_at: string;
};

export type ContentRow = {
  id: string;
  slug: string;
  title: string;
  body: string | null;
  excerpt: string | null;
  cover_image_url: string | null;
  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

let browserClient: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient {
  if (!url) throw new Error('Missing PUBLIC_SUPABASE_URL');
  if (!anonKey) throw new Error('Missing PUBLIC_SUPABASE_ANON_KEY');
  if (!browserClient) {
    browserClient = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
  }
  return browserClient;
}

let serverClient: SupabaseClient | null = null;
export function getSupabaseAdmin(): SupabaseClient {
  if (!url) throw new Error('Missing PUBLIC_SUPABASE_URL');
  const key = serviceKey || anonKey;
  if (!key) throw new Error('Missing Supabase key');
  if (!serverClient) {
    serverClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return serverClient;
}
