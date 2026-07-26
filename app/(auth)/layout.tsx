/**
 * Telas de entrada no produto.
 *
 * "Telas de baixo risco visual — a identidade de marca aparece de verdade a
 *  partir do Cockpit, não aqui." — 07-onboarding-login-configuracoes.md
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex flex-1 items-center justify-center px-8 py-12">
      <div className="w-full max-w-[360px]">{children}</div>
    </main>
  );
}
