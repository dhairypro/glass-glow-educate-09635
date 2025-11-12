import { createClient } from '@supabase/supabase-js';
import type { Database } from './types.gen';

const SUPABASE_URL = "https://ddsjinvivcfrjltlwnof.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkc2ppbnZpdmNmcmpsdGx3bm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NzcyMzUsImV4cCI6MjA3NzU1MzIzNX0.Cbw8AtE5zmcShOjh3pB0h1rwwXE8aIhBiWhIiT6KNTI";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
