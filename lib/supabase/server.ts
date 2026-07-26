import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { publicEnv } from "@/lib/env";

/**
 * Client Supabase para Server Components, Route Handlers e Server Actions.
 *
 * Continua usando a anon key, não a service role: o servidor age *em nome do
 * usuário logado*, então as policies de RLS seguem valendo. Service role só
 * entra em Edge Functions, e mesmo lá com escopo explícito.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Component não pode escrever cookie. O middleware já
            // renova a sessão a cada request, então ignorar aqui é seguro.
          }
        },
      },
    },
  );
}
