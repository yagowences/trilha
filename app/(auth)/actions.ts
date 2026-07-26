"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { safeNext } from "@/lib/auth/routes";
import { getLocale, persistLocale } from "@/lib/i18n/locale";
import { isLocale } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";

/**
 * Ações de autenticação. Só e-mail/senha.
 *
 * Magic link foi removido do escopo por decisão do produto, divergindo do que
 * SPEC.md (Fase 0, req. 4 e Requisito de Segurança 6) e
 * docs/prototipacao/07-onboarding-login-configuracoes.md descrevem.
 */

export type AuthState = { error: string | null };

function credentialsSchema(t: (key: string) => string) {
  return z.object({
    email: z.email({ error: t("emailFormat") }),
    password: z.string().min(8, { error: t("passwordTooShort") }),
  });
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const t = await getTranslations("auth.errors");

  const parsed = credentialsSchema(t).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // No login não detalhamos qual campo falhou: dizer "senha muito curta" já
  // confirma que o e-mail existe. Uma mensagem só, para os dois casos.
  if (!parsed.success) {
    const emailFailed = parsed.error.issues.some((i) => i.path[0] === "email");
    return { error: emailFailed ? t("emailFormat") : t("badCredentials") };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: t("badCredentials") };
  }

  // profiles.locale é a fonte de verdade do idioma; o cookie é só o espelho
  // que evita uma query por render. Este é o momento em que ele se realinha
  // depois de um login em outro dispositivo.
  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("locale")
      .eq("id", data.user.id)
      .single();

    if (isLocale(profile?.locale)) {
      await persistLocale(profile.locale);
    }
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const t = await getTranslations("auth.errors");

  const parsed = credentialsSchema(t)
    .extend({ name: z.string().trim().min(1, { error: t("nameRequired") }) })
    .safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("generic") };
  }

  const { name, email, password } = parsed.data;
  const locale = await getLocale();
  const supabase = await createClient();

  // `name` e `locale` vão em raw_user_meta_data; o trigger handle_new_user()
  // os lê para preencher profiles (migration 20260725120000).
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, locale } },
  });

  if (error) {
    // Mensagem genérica de propósito: repassar o texto do Supabase ("User
    // already registered") transformaria este formulário num verificador de
    // quem tem conta aqui. O erro real fica no log do servidor.
    console.error("signup failed", { code: error.code, status: error.status });
    return { error: t("generic") };
  }

  await persistLocale(locale);
  revalidatePath("/", "layout");
  // Sem `?email=` na URL: e-mail é dado pessoal e query string vaza para log
  // de servidor, header Referer e histórico do browser.
  redirect("/signup/confirme");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}
