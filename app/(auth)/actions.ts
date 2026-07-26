"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { safeNext } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

/**
 * Ações de autenticação. Só e-mail/senha.
 *
 * Magic link foi removido do escopo por decisão do produto, divergindo do que
 * SPEC.md (Fase 0, req. 4 e Requisito de Segurança 6) e
 * docs/prototipacao/07-onboarding-login-configuracoes.md descrevem.
 */

export type AuthState = { error: string | null };

// Copy exata de 07-onboarding-login-configuracoes.md.
const MSG = {
  emailFormat: "Verifique se o e-mail está no formato correto.",
  badCredentials: "E-mail ou senha não conferem.",
  generic: "Não foi possível concluir agora. Tente de novo.",
} as const;

const credentialsSchema = z.object({
  email: z.email({ error: MSG.emailFormat }),
  password: z.string().min(8, {
    error: "A senha precisa ter pelo menos 8 caracteres.",
  }),
});

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // No login não detalhamos qual campo falhou: dizer "senha muito curta" já
  // confirma que o e-mail existe. Uma mensagem só, para os dois casos.
  if (!parsed.success) {
    const emailFailed = parsed.error.issues.some((i) => i.path[0] === "email");
    return { error: emailFailed ? MSG.emailFormat : MSG.badCredentials };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: MSG.badCredentials };
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

const signupSchema = credentialsSchema.extend({
  name: z.string().trim().min(1, { error: "Como podemos te chamar?" }),
});

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? MSG.generic };
  }

  const { name, email, password } = parsed.data;
  const supabase = await createClient();

  // `name` vai em raw_user_meta_data; o trigger handle_new_user() o lê para
  // preencher profiles.name (migration 20260725120000).
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    return { error: error.message || MSG.generic };
  }

  revalidatePath("/", "layout");
  redirect("/signup/confirme");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}
