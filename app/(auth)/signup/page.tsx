"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { signup, type AuthState } from "../actions";

function SubmitButton() {
  const t = useTranslations("auth.signup");
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? t("submitting") : t("submit")}
    </Button>
  );
}

export default function SignupPage() {
  const t = useTranslations("auth");
  const tApp = useTranslations("app");
  const [state, formAction] = useActionState<AuthState, FormData>(signup, {
    error: null,
  });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-display-l text-ink">{tApp("name")}</h1>

      <form action={formAction} className="flex flex-col gap-4">
        <TextField
          id="name"
          name="name"
          type="text"
          label={t("nameLabel")}
          autoComplete="name"
          required
        />
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
        {t("signup.hasAccount")}{" "}
        <Link href="/login" className="text-trail underline underline-offset-4">
          {t("signup.login")}
        </Link>
      </p>
    </div>
  );
}
