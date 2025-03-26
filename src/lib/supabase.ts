// src/lib/supabase/client.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Create a singleton Supabase client
let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabase) {
    return supabase;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase URL and anon key must be provided in environment variables'
    );
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}
