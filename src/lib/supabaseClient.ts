import { createClient } from "@supabase/supabase-js";

import { isSupabaseConfigured, supabaseConfig } from "./supabaseConfig";
import type { Database } from "../types/supabase.types";

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseConfig.url, supabaseConfig.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
