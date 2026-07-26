# Trilha

Conecta metas de longo prazo às ações do dia, sem perder o fio entre as duas.

Documentação: [`AGENTS.md`](AGENTS.md) (convenções e limites) ·
[`docs/PRD.md`](docs/PRD.md) (problema e produto) ·
[`docs/SPEC.md`](docs/SPEC.md) (modelo de dados, RN-01 a RN-94, fases) ·
[`docs/prototipacao/`](docs/prototipacao) (uma tela por arquivo).

## Estado atual

**Fase 0 — fundação.** Next.js + Supabase, auth por e-mail/senha, RLS base e
deploy. Nenhuma entidade de domínio existe ainda: a Fase 0 cria apenas
`profiles`. As telas do produto começam na Fase 1.

## Setup

Requer Node 20+. Docker é opcional (só para o stack local do Supabase).

```bash
npm install
cp .env.local.example .env.local   # e preencha
npm run dev
```

### Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **Project Settings → API**, copie a URL, a `anon` key e a
   `service_role` key para o seu `.env.local`.
   A `service_role` bypassa RLS: nunca prefixe com `NEXT_PUBLIC_`, nunca use em
   Client Component.
3. Aplique a migration:

   ```bash
   npx supabase link --project-ref SEU_REF
   npx supabase db push
   ```

4. Em **Authentication → Providers**, deixe apenas **Email** habilitado.
   Magic link está fora do escopo por decisão de produto.

## Comandos

```bash
npm run dev     # ambiente local
npm run build   # build de produção
npm run lint    # eslint
npm run test    # vitest
```

## Como este projeto está organizado

```
app/                    # rotas (App Router)
  (auth)/               # login, signup — telas públicas
components/ui/          # primitivas do sistema de design
lib/auth/               # classificação de rotas e guarda de redirect
lib/supabase/           # clients browser/server e renovação de sessão
supabase/migrations/    # SQL versionado
docs/                   # PRD, SPEC e protótipos por tela
proxy.ts                # proteção de rotas (era middleware.ts até o Next 15)
```

`app/globals.css` é a **fonte única** dos tokens visuais, derivada de
`docs/prototipacao/01-sistema-de-design.md`. Não existe paleta de erro neste
sistema, e `--color-signal` só pode aparecer na Revisão Semanal (RN-71).
