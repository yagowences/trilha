import { createBrowserClient } from "@supabase/ssr";

import { publicEnv } from "@/lib/env";

/**
 * Client Supabase para Client Components.
 *
 * Usa a anon key. Todo acesso a dado passa pelas policies de RLS — este client
 * nunca vê linha de outro usuário (RN-93).
 */
export function createClient() {
  return createBrowserClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
