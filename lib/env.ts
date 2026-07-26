import { z } from "zod";

/**
 * Validação de ambiente. Falhar aqui, no boot, é muito melhor do que descobrir
 * uma variável faltando dentro de uma query já em produção.
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url({
    error: "NEXT_PUBLIC_SUPABASE_URL precisa ser uma URL válida.",
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
    error: "NEXT_PUBLIC_SUPABASE_ANON_KEY não pode estar vazia.",
  }),
});

/**
 * As duas variáveis públicas. Seguras no browser: a anon key só consegue o que
 * as policies de RLS permitirem (RN-93).
 *
 * Os nomes são escritos por extenso de propósito — o Next substitui
 * `process.env.NEXT_PUBLIC_*` no bundle por correspondência textual, então
 * acesso dinâmico (`process.env[nome]`) não funcionaria no client.
 */
export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

/**
 * Service role key — bypassa RLS inteiro.
 *
 * Requisito de Segurança 3: nunca exposta ao client, uso restrito a código
 * server-side e Edge Functions. Por isso é uma função, e não uma constante
 * exportada: nada a lê por acidente ao importar este módulo, e o `throw`
 * dispara se alguma vez for chamada de um bundle de browser.
 */
export function getServiceRoleKey(): string {
  if (typeof window !== "undefined") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY foi acessada no client. Ela bypassa RLS e só pode ser usada server-side.",
    );
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não está definida.");
  }

  return key;
}
