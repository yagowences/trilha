"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { signup, type AuthState } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Criando..." : "Criar conta"}
    </Button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useActionState<AuthState, FormData>(signup, {
    error: null,
  });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-display-l text-ink">Trilha</h1>

      <form action={formAction} className="flex flex-col gap-4">
        <TextField
          id="name"
          name="name"
          type="text"
          label="Nome"
          autoComplete="name"
          required
        />
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
          autoComplete="new-password"
          minLength={8}
          required
        />

        {state.error ? (
          <p role="alert" className="text-body-sm text-ink">
            {state.error}
          </p>
        ) : null}

        <SubmitButton />
      </form>

      <p className="text-body-sm text-ink">
        Já tem conta?{" "}
        <Link href="/login" className="text-trail underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </div>
  );
}
