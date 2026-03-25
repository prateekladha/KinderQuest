import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { getMobileSupabaseEnv } from "./env";

let client: SupabaseClient | null = null;

export function getMobileSupabaseClient() {
  if (client) {
    return client;
  }

  const env = getMobileSupabaseEnv();

  if (!env) {
    return null;
  }

  client = createClient(env.url, env.anonKey, {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  });
  return client;
}

export async function getInitialSession() {
  const supabase = getMobileSupabaseClient();

  if (!supabase) {
    return null;
  }

  const result = await supabase.auth.getSession();
  return result.data.session ?? null;
}

export type AuthSession = Session | null;
