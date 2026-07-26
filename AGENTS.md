# AGENTS.md — Trilha

Guia rápido para qualquer agente de IA (Claude Code, Cursor, etc.) trabalhando neste repositório. Leia isto antes de tocar em código.

## Comandos

```bash
npm run dev              # ambiente local
npm run build             # build de produção
npm run lint               # eslint
npm run test               # testes unitários (vitest)
npm run test:e2e         # testes end-to-end (playwright), se configurado

supabase start              # sobe stack local do Supabase — EXIGE Docker
supabase db diff -f nome    # gera migration a partir de mudanças locais
supabase db push            # aplica migrations no projeto remoto
supabase functions deploy <nome>   # deploy de uma edge function
```

> Neste ambiente **não há Docker instalado**, então `supabase start` não roda e
> trabalhamos contra o projeto Supabase remoto (`supabase link` + `db push`).
> Se instalar o Docker Desktop, o stack local volta a ser uma opção.

## Decisões travadas no kickoff da Fase 0

Estas sobrepõem o que está escrito em `docs/SPEC.md` e `docs/PRD.md`:

- **Auth: só e-mail/senha.** Magic link foi removido do escopo — diverge de
  `SPEC.md` (Fase 0 req. 4 e Requisito de Segurança 6) e do botão
  "Continuar com link mágico" em `docs/prototipacao/07-...md`. Sem OAuth.
- **Deploy: Netlify** (`netlify.toml` + `@netlify/plugin-nextjs`).
- **Design: a spec vence o Stitch.** Os tokens em `app/globals.css` vêm de
  `docs/prototipacao/01-sistema-de-design.md`, não do export do Stitch. O
  projeto Stitch permanece como está, divergente e intocado.
- **Proteção de rotas fica em `proxy.ts`**, não `middleware.ts` — o Next 16
  renomeou a convenção. O papel é o mesmo que a SPEC descreve.

## Estrutura de pastas

```
app/                 # Next.js App Router — rotas e páginas
components/           # componentes de UI reutilizáveis
lib/supabase/          # clients (browser e server) e tipos gerados do schema
lib/domain/             # regras de negócio puras (cálculo de progresso, capacidade, RRULE) — sem I/O
lib/ai/                    # prompts e clients das Edge Functions de IA
supabase/migrations/       # migrations SQL versionadas
supabase/functions/         # edge functions (inclui as 4 funções de IA da Fase 5)
```

## Convenções de código

- TypeScript estrito (`strict: true`), sem `any` sem justificativa em comentário.
- Nomenclatura de domínio **em inglês no código e no banco** (`goal`, `phase`, `deliverable`, `action`, `area`, `habit`, `routine`, `block`), mesmo com as regras de negócio documentadas em português — a UI é traduzida via strings, o schema não. *(Confirmado no kickoff da Fase 0. `docs/SPEC.md` escreve o modelo de dados em português; onde os dois divergirem, esta convenção vence. Traduções: `meta`→`goal`, `fase`→`phase`, `entregavel`→`deliverable`, `acao`→`action`, `rotina`→`routine`, `habito`→`habit`, `bloco`→`block`, `revisao_semanal`→`weekly_review`.)*
- Componentes de UI genéricos (`Button`, `TextField`) usam nome em inglês. Componentes **de domínio** mantêm o nome do sistema de design, sem acento no arquivo: `CardAção` → `components/domain/card-acao.tsx` exportando `CardAcao`.
- Validação de entrada com Zod em toda rota/edge function que recebe dado externo, incluindo respostas de IA antes de qualquer persistência.
- Regras de negócio numeradas (RN-XX) do documento de especificação viram comentário no código onde são aplicadas, ex.: `// RN-10: máx 3 metas ativas`.

## Regras de commit/PR

- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`.
- Uma fase da Fase 0 (ou sub-fase futura das demais) = idealmente um PR, sempre terminando em algo verificável conforme o Checkpoint da especificação.

## Limites explícitos — nunca sem confirmação humana

- **Nunca alterar ou remover uma policy de RLS** sem apontar explicitamente a mudança e pedir confirmação — é a fronteira de segurança multi-tenant inteira (RN-93).
- **Nunca commitar chave de API** (Supabase service role, provedor de IA) em código ou `.env` versionado.
- **Nunca expor `service_role key` no client** — uso restrito a Edge Functions server-side.
- **Nunca alterar a lógica de cálculo de progresso** (peso congelado do Entregável, agregação ponderada da Fase) sem atualizar os testes correspondentes na mesma mudança — é a métrica mais sensível do produto e uma regressão silenciosa aqui destrói a confiança no número inteiro.
- **Nunca persistir uma sugestão de IA direto em tabela de domínio** sem passar por confirmação do usuário (RN-92).
- **Nunca criar uma tabela nova sem RLS habilitado no mesmo PR** (RN-93).
