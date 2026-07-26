"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { login, type AuthState } from "../actions";

function SubmitButton() {
  const t = useTranslations("auth.login");
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? t("submitting") : t("submit")}
    </Button>
  );
}

/**
 * Anatomia e copy de 07-onboarding-login-configuracoes.md, Parte A.
 *
 * Ausente de propósito: o botão "Continuar com link mágico" e o divisor "ou"
 * que o acompanhava. Magic link saiu do escopo por decisão do produto — a
 * divergência com SPEC.md e com o protótipo está registrada no kickoff.
 *
 * Também ausente de propósito: o "Esqueceu?" e a tagline "Mantenha-se
 * centrado." que o Stitch inventou. Reset de senha não foi especificado e fica
 * para depois (ver tabela de divergências no AGENTS.md).
 */
export function LoginForm() {
  const t = useTranslations("auth");
  const tApp = useTranslations("app");
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const [state, formAction] = useActionState<AuthState, FormData>(login, {
    error: null,
  });

  // Vem de /auth/confirm quando o link do e-mail já expirou ou foi usado.
  // Só um valor é reconhecido — qualquer outra coisa na query é ignorada em
  // vez de virar texto na tela.
  const linkError =
    searchParams.get("error") === "invalid_link" ? t("errors.invalidLink") : null;
  const message = state.error ?? linkError;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-display-l text-ink">{tApp("name")}</h1>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />

        <TextField
          id="email"
          name="email"
          type="email"
          label={t("emailLabel")}
          autoComplete="email"
          required
        />
        <TextField
          id="password"
          name="password"
          type="password"
          label={t("passwordLabel")}
          autoComplete="current-password"
          required
        />

        {/*
          Erro em `ink`, não em vermelho: "mesmo aqui o produto evita alarme
          desnecessário para um erro de formulário simples."
          `signal` é exclusivo da Revisão Semanal (RN-71).
        */}
        {message ? (
          <p role="alert" className="text-body-sm text-ink">
            {message}
          </p>
        ) : null}

        <SubmitButton />
      </form>

      <p className="text-body-sm text-ink">
        {t("login.noAccount")}{" "}
        <Link href="/signup" className="text-trail underline underline-offset-4">
          {t("login.createAccount")}
        </Link>
      </p>
    </div>
  );
}
