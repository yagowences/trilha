import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { logout } from "./(auth)/actions";

/**
 * Placeholder da Fase 0.
 *
 * Não é o Cockpit Diário. O Cockpit (docs/prototipacao/02-cockpit-diario.md)
 * chega na Fase 1, junto das entidades de domínio — a Fase 0 não cria nenhuma
 * tabela além de profiles.
 *
 * Esta página existe para provar duas coisas do Checkpoint: que a rota é
 * protegida, e que o profile do usuário foi criado e é legível sob RLS.
 */
export default async function Home() {
  const supabase = await createClient();

  // O middleware já garantiu a sessão; aqui só lemos quem é.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Sob RLS, esta query só pode retornar a própria linha (RN-93).
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, timezone, created_at")
    .single();

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8 px-8 py-12">
      <h1 className="font-display text-display-l text-ink">Trilha</h1>

      <div className="flex flex-col gap-2 rounded-md border border-mist p-6">
        <p className="text-caption uppercase text-ink/60">Sessão ativa</p>
        <p className="text-body text-ink">{profile?.name ?? user?.email}</p>
        <p className="font-mono text-data text-ink/60">{user?.email}</p>
        <p className="text-body-sm text-ink/60">
          Fuso: {profile?.timezone ?? "—"}
        </p>
      </div>

      <p className="text-body-sm text-ink/60">
        Fundação no ar. As telas do produto entram na Fase 1.
      </p>

      <form action={logout}>
        <Button type="submit" variant="quiet">
          Sair
        </Button>
      </form>
    </main>
  );
}
