import Link from "next/link";

export const metadata = { title: "Confirme seu e-mail — Trilha" };

export default function ConfirmePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-display-l text-ink">Trilha</h1>
      <p className="text-body text-ink">
        Conta criada. Verifique sua caixa de entrada para confirmar o e-mail.
      </p>
      <p className="text-body-sm text-ink">
        <Link href="/login" className="text-trail underline underline-offset-4">
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
