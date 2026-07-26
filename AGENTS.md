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
- **Produto trilíngue desde já: `pt`, `en`, `es`.** Não está no `PRD.md` nem no
  `SPEC.md`, que assumem PT-BR único. Consequência: nenhuma string de UI nova
  entra hardcoded em componente — tudo passa pelo catálogo de mensagens. O
  schema segue em inglês (a convenção abaixo não muda), e conteúdo escrito pelo
  usuário (título de meta, critério de conclusão) **não** é traduzido.

## Divergências do Stitch — decisões da revisão de protótipo

O export do Stitch inventou 9 coisas que não existiam na spec. Decisão do
usuário sobre cada uma, para não serem "corrigidas" de volta por engano:

| # | Invenção do Stitch | Decisão |
|---|---|---|
| 1 | Sidebar global (Archive, Trash, Help, Nova Meta), labels em inglês | Vira i18n `pt`/`en`/`es`. **Archive/Trash/Help seguem sem modelo de dados — em aberto.** |
| 2 | Sino de notificações no Cockpit e no Inbox | Manter e ajustar. Contraria o `PRD.md` (notificação fora do MVP); precisa respeitar RN-71 — sem ponto vermelho, sem `signal`, sem badge de urgência. |
| 3 | "Nova Meta" persistente no Mapa da Meta | Manter, contra `03-mapa-da-meta.md`. Obrigatório desabilitar com o tooltip de RN-10 ao chegar em 3 metas ativas. |
| 4 | Entregável com checklist de 4 critérios (plural) | Aceito, **com mudança de modelo**: `deliverable.completion_criteria` vira `jsonb` (lista de itens). RN-84 continua valendo — o 100% só destrava por confirmação manual deliberada, não por marcar os itens. |
| 5 | Badge "Em Andamento" no entregável ativo | Rejeitado — vence a spec: `ativo` é justamente o estado sem badge. |
| 6 | Login com "Esqueceu?" e tagline "Mantenha-se centrado." | Copy exata da `07` vence. Reset de senha fica para depois (não especificado). |
| 7 | Tela de Recomeço (Etapa 8) não foi gerada | **Sem decisão ainda.** RN-70 depende dela. |
| 8 | Kanban com capacidade em texto ("4h/6h") | Rejeitado — vence a spec: barra fina com gradação neutro/`clay`/`signal` (RN-41). |
| 9 | Agenda do Cockpit sem faixa horária definida | Renderizar 05:00–23:00. |

## Estrutura de pastas

```
app/                 # Next.js App Router — rotas e páginas
components/           # componentes de UI reutilizáveis
lib/supabase/          # clients (browser e server) e tipos gerados do schema
lib/domain/             # regras de negócio puras (cálculo de progresso, capacidade, RRULE) — sem I/O
lib/i18n/                # resolução de idioma (cookie → Accept-Language → pt)
messages/                 # catálogos pt.json / en.json / es.json
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
- **Nenhuma string visível ao usuário hardcoded em componente.** Toda copy sai de
  `messages/*.json` via `useTranslations` (client) ou `getTranslations` (server).
  Adicionar chave em `pt.json` sem adicionar em `en.json` e `es.json` quebra o
  teste `messages/catalogs.test.ts` de propósito — chave faltando vira crash em
  runtime só no dia em que alguém abre aquela tela naquele idioma.
- Identificador em código e query string segue em inglês mesmo quando a copy é
  PT (`?error=invalid_link`, não `?erro=link_invalido`) — quem traduz é o catálogo.
- Idioma **não** aparece na URL: `/login` é `/login` nos três. A preferência vive
  em `profiles.locale`, espelhada no cookie `NEXT_LOCALE` para não custar uma
  query ao banco por render. O cookie se realinha a cada login.

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
