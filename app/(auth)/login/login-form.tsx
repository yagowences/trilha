"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { login, type AuthState } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Entrando..." : "Entrar"}
    </Button>
  );
}

/**
 * Anatomia e copy de 07-onboarding-login-configuracoes.md, Parte A.
 *
 * Ausente de propósito: o botão "Continuar com link mágico" e o divisor "ou"
 * que o acompanhava. Magic link saiu do escopo por decisão do produto — a
 * divergência com SPEC.md e com o protótipo está registrada no kickoff.
 */
export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const [state, formAction] = useActionState<AuthState, FormData>(login, {
    error: null,
  });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-display-l text-ink">Trilha</h1>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />

        <TextField
          id="email"
          name="email"
          type="email"
          label="E-mail"
          autoComplete="email"
          required
        />
        <TextField
          id="password"
          name="password"
          type="password"
          label="Senha"
          autoComplete="current-password"
          required
        />

        {/*
          Erro em `ink`, não em vermelho: "mesmo aqui o produto evita alarme
          desnecessário para um erro de formulário simples."
          `signal` é exclusivo da Revisão Semanal (RN-71).
        */}
        {state.error ? (
          <p role="alert" className="text-body-sm text-ink">
            {state.error}
          </p>
        ) : null}

        <SubmitButton />
      </form>

      <p className="text-body-sm text-ink">
        Não tem conta?{" "}
        <Link href="/signup" className="text-trail underline underline-offset-4">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
