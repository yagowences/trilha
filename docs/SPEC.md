# Trilha — Especificação Executável

## Glossário (leia antes do resto — a terminologia foi refinada durante o design)

| Termo | Definição | Agendável? | Carrega peso de progresso? |
|---|---|---|---|
| Área | Categoria de vida (Saúde, Carreira, Finanças...) | Não | Não |
| Meta | Objetivo de longo prazo, com 1-3 Key Results opcionais | Não | Não (é derivado) |
| Fase | Ciclo de execução de ~12 semanas dentro de uma Meta | Não | Não (é derivado) |
| Entregável | Resultado com critério de conclusão verificável, até 2 níveis de aninhamento | Não | Sim (peso congelado no planejamento) |
| Ação | Folha executável, com estimativa e teto de 4h | **Sim** | Sim (soma no Entregável pai) |
| Rotina | Compromisso fixo recorrente (RRULE), pode bloquear a agenda | Sim | Não |
| Hábito | Ação recorrente de manutenção, medida por streak, não por progresso de meta | Sim (se tiver horário) | Não |
| Bloco | Ocupação real de tempo na agenda, aponta para Ação, Rotina ou Hábito | — | — |

Regra de ouro do modelo: **só Ação, Rotina e Hábito tocam a agenda. Só Ação e Entregável tocam progresso.**

---

## Contexto Técnico

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind. `dnd-kit` para drag-and-drop (lista → grade de horários com snap de 15 min). Grade de calendário customizada em CSS Grid — evitar libs pesadas tipo FullCalendar.
- **Backend/dados:** Supabase (Postgres + Auth + Row Level Security + Edge Functions + Realtime).
- **Multi-tenancy:** isolamento por usuário via RLS (`auth.uid()`), não por organização. Cada linha de dado de domínio carrega `user_id` obrigatório.
- **IA:** chamadas de LLM feitas exclusivamente via Supabase Edge Functions — nunca direto do client, para não expor chave de API. `[A DEFINIR: provedor exato]`.
- **Deploy:** `[A DEFINIR: Vercel ou Netlify]` — qualquer um serve para Next.js.
- **Plataforma:** Web responsivo apenas nesta fase. Sem PWA/nativo no MVP.

## Modelo de Dados

Todas as tabelas abaixo (exceto `profiles`) têm `user_id uuid references auth.users(id)` e RLS habilitado com policy `user_id = auth.uid()` para select/insert/update/delete. Isso é constraint de segurança, não sugestão — ver Requisitos de Segurança.

```sql
profiles        (id uuid pk references auth.users, nome, timezone, criado_em)

area            (id, user_id, nome, cor, icone, ordem)

meta            (id, user_id, area_id fk, titulo, data_alvo, status
                  enum[rascunho|ativa|vencida|concluida|arquivada],
                  tipo enum[resultado|processo], aprendizado text nullable)

key_result      (id, meta_id fk, metrica, unidade, baseline numeric,
                  alvo numeric, atual numeric, atualizado_em)

fase            (id, meta_id fk, titulo, inicio date, fim date,
                  peso numeric, ordem int,
                  status enum[rascunho|ativa|concluida])

entregavel      (id, fase_id fk, entregavel_pai_id fk nullable, -- máx 2 níveis, ver RN-80
                  titulo, criterio_conclusao text,
                  esforco_estimado enum[8h|20h|40h|80h],
                  peso_minutos int, -- congelado no planejamento, nunca recalculado por criação de ação
                  status enum[rascunho|ativo|estourado|concluido|parado],
                  motivo_parado text nullable)

acao            (id, user_id, area_id fk, entregavel_id fk nullable, -- null = ação avulsa
                  titulo, estimativa_min int, -- múltiplo de 15, teto 240
                  prioridade_manual boolean default false,
                  data_prevista date,
                  status enum[inbox|clarificada|agendada|concluida|descartada|algum_dia],
                  adiamentos int default 0,
                  origem enum[manual|ia_captura|ia_decomposicao] default 'manual')

rotina          (id, user_id, area_id fk, titulo, rrule text,
                  hora_inicio time, hora_fim time, bloqueia_agenda boolean)

habito          (id, user_id, area_id fk, meta_id fk nullable, -- lead measure de uma meta, opcional
                  titulo, tipo enum[binario|quantidade],
                  alvo_diario numeric, minimo_viavel numeric nullable,
                  rrule text, hora_sugerida time nullable, gatilho text nullable)

habito_log      (habito_id fk, data date, valor numeric, primary key(habito_id, data))

bloco           (id, user_id, origem_tipo enum[acao|rotina|habito], origem_id uuid,
                  inicio timestamptz, fim timestamptz, concluido boolean,
                  executado_min int nullable) -- RN-43: estimado vs. realizado

revisao_semanal (id, user_id, semana_inicio date,
                  planejado_min int, executado_min int,
                  acoes_concluidas int, acoes_adiadas int,
                  inbox_zerado boolean, notas text)

ia_captura_log  (id, user_id, input_bruto text, sugestao_json jsonb,
                  aceito_sem_edicao boolean, criado_em) -- alimenta a métrica de confiança em IA
```

## Não-Escopo (declarado positivamente)

- Tabela de `workspace`/organização — não existe nesta versão. Um `user_id` é um tenant completo.
- Tabela de billing/assinatura — não construir ainda; `[A DEFINIR]` no PRD antes da Fase de monetização.
- Sincronização externa de calendário (Google/Outlook) — não construir campos de integração agora.
- Chat livre com IA — os 4 endpoints de IA são de propósito fixo (captura, decomposição, planejamento de meta, resumo semanal), não um assistente conversacional geral.
- Notificações push/e-mail transacional — fora do MVP; RN-71 já proíbe alertas de atraso na tela diária, então nem faria sentido priorizar push agora.

## Requisitos de Segurança

1. RLS obrigatório e habilitado em **toda** tabela de domínio antes de qualquer deploy — sem exceção, mesmo em tabelas que "só o dono vai usar mesmo".
2. Policy padrão de RLS é **negar tudo**; liberar explicitamente por tabela e operação (RN-93).
3. `service_role key` do Supabase nunca é exposta ao client — uso restrito a Edge Functions.
4. Chamadas de IA passam por Edge Function, nunca direto do browser para o provedor de LLM.
5. Rate limit de chamadas de IA por usuário (ex.: N capturas/decomposições por hora) — mitigação do risco de custo listado no PRD.
6. Autenticação via Supabase Auth (e-mail/senha + magic link no MVP). `[A DEFINIR: incluir OAuth Google?]`.
7. Toda rota autenticada usa middleware de proteção — redirect para login se sessão inválida.

## Requisitos de IA

| Funcionalidade | Latência-alvo | Degradação graciosa |
|---|---|---|
| Captura em linguagem natural → rascunho de ação (título, área, estimativa, data) | ≤3s p95 | Se falhar/timeout: abre formulário manual vazio, sem bloquear a captura |
| Sugestão de decomposição de um Entregável em Ações | ≤8s p95 | Se falhar: usuário decompõe manualmente, sem diferença de fluxo |
| Planejamento de Meta: descrição em linguagem natural → proposta de Fases + Entregáveis | ≤8s p95 | Se falhar: usuário cria Fase/Entregável em branco, com os mesmos campos |
| Resumo narrativo da revisão semanal | Assíncrono, pode pré-computar antes do usuário abrir a revisão | Se falhar: revisão mostra só os números (scorecard), sem o texto — nunca bloqueia a revisão |

Regras específicas de IA (novas, complementam RN-01 a RN-90 definidas anteriormente):

- **RN-91 — IA é acréscimo, nunca dependência.** Toda ação possível via IA tem caminho manual equivalente sempre visível, nunca escondido atrás de um fallback silencioso.
- **RN-92 — Toda sugestão de IA exige confirmação explícita antes de persistir.** Nada gerado por IA vira linha no banco sem o usuário revisar e confirmar. A UI marca visualmente o que veio de IA (badge `Sugestão`) até ser confirmado.
- **RN-93 — RLS é a fronteira de tenant.** Toda tabela nova criada em qualquer fase futura precisa de policy de isolamento por `user_id` no mesmo PR que a cria — nunca depois.
- **RN-94 — IA nunca apresenta números específicos não verificados como fato.** No planejamento de meta, se a IA mencionar prazos ou processos externos (ex.: "processo seletivo leva N semanas"), isso é marcado como estimativa, não como dado — mitigação direta do risco de alucinação.

Acurácia mínima e taxa de aceitação aceitável: `[A DEFINIR — sem dataset ainda; coletar baseline via ia_captura_log nas primeiras semanas de uso real antes de fixar meta]`.

---

## Fases de Implementação (ordenadas por dependência)

> Fase 0 está detalhada em granularidade de execução (5–15 min por item). Fases 1–5 estão em nível de épico — serão decompostas quando entrarmos nelas, por consistência com RN-87 (rolling wave planning).

### Fase 0: Fundação — infraestrutura, auth e multi-tenancy

- OBJETIVO: ter um esqueleto Next.js + Supabase publicado, com login funcionando e RLS base configurado, antes de qualquer entidade de domínio existir.
- REQUISITOS:
  1. Inicializar projeto Next.js (App Router, TypeScript, Tailwind).
  2. Criar projeto Supabase e configurar variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` só server-side).
  3. Criar tabela `profiles` com trigger de criação automática ao signup (`on auth.users insert`).
  4. Implementar fluxo de autenticação: signup, login, logout, magic link.
  5. Configurar RLS: policy padrão negar tudo; liberar select/insert/update/delete em `profiles` só para o próprio dono.
  6. Middleware de proteção de rotas: redirect para `/login` se não houver sessão válida.
  7. Deploy inicial em `[A DEFINIR: Vercel/Netlify]` com pipeline básico (build + deploy automático no push da branch principal).
- CRITÉRIOS DE ACEITE:
  - [ ] Given um visitante não autenticado, When acessa qualquer rota protegida, Then é redirecionado para `/login`.
  - [ ] Given um e-mail e senha válidos no signup, When o usuário confirma, Then uma linha em `profiles` é criada automaticamente com o `id` igual ao `auth.users.id`.
  - [ ] Given um usuário autenticado, When faz logout, Then a sessão é invalidada e rotas protegidas voltam a redirecionar.
  - [ ] Given a policy de RLS padrão, When qualquer query é feita sem `auth.uid()` correspondente, Then o Postgres retorna zero linhas (não erro, não dado de outro usuário).
  - [ ] Given o deploy configurado, When um commit é enviado para a branch principal, Then o build roda e o ambiente de produção é atualizado automaticamente.
- DO NOT CHANGE: nenhuma tabela de domínio (área, meta, fase, entregável, ação) é criada nesta fase — só `profiles`.
- Checkpoint: criar uma conta de teste manualmente, confirmar que aparece em `profiles`, confirmar que rotas protegidas bloqueiam acesso deslogado, confirmar que o deploy está no ar.

### Fase 1: Hierarquia core + cockpit diário (épico)

- OBJETIVO: CRUD completo de Área → Meta → Fase → Entregável → Ação, mais a tela diária com drag-and-drop para a agenda.
- REQUISITOS (alto nível, decompor em fases de 5-15min quando iniciar):
  1. CRUD de Área, Meta (com KR opcional), Fase, Entregável (com aninhamento de até 2 níveis), Ação.
  2. Aplicar limites: RN-10 (máx. 3 metas ativas), RN-21 (máx. 2 fases ativas), RN-32 (máx. 3 prioridades/dia), RN-80 (máx. 2 níveis de entregável).
  3. Cálculo de progresso: peso congelado no Entregável, agregação ponderada na Fase (RN-84, RN-85).
  4. Tela diária: lista de ações do dia + grade de horários com drag-and-drop (snap 15 min).
  5. Fluxo de captura/Inbox (RN-01 a RN-06).
- DO NOT CHANGE: schema de `bloco` deve já nascer com `origem_tipo` polimórfico, mesmo que Fase 2 (hábitos/rotinas) ainda não exista — evita migration destrutiva depois.
- Checkpoint: criar uma meta completa (com fase, 1 entregável de 2 níveis, 3 ações), agendar uma ação por drag-and-drop, concluir e ver a barra de progresso da fase mover corretamente.

### Fase 2: Hábitos e rotinas fixas (épico)

- OBJETIVO: unificar rotina fixa e hábito na agenda, usando RRULE, sem tocar no cálculo de progresso de metas.
- REQUISITOS (alto nível): RRULE para recorrência (biblioteca tipo `rrule.js`), tabela de exceções por ocorrência, regra de streak com "nunca falhe duas vezes" (RN-52), `habito_log` diário.
- DO NOT CHANGE: `habito` e `rotina` nunca escrevem em `peso_minutos` de entregável — RN-54 é innegociável.

### Fase 3: Revisão semanal, capacidade e calibração (épico)

- OBJETIVO: ritual de revisão semanal com scorecard, regra dos 60% de capacidade (RN-41), calibração automática de estimativa (RN-44).
- REQUISITOS (alto nível): cálculo de capacidade semanal, tela de revisão com esvaziamento de Inbox obrigatório, atualização de KRs, `revisao_semanal` persistida.

### Fase 4: Key Results e progresso de resultado (épico)

- OBJETIVO: segunda barra de progresso (resultado, via KRs) ao lado da barra de execução — o insight central do produto (RN-11 a RN-15).

### Fase 5: Camada de IA (épico)

- OBJETIVO: captura em linguagem natural, sugestão de decomposição de entregável, planejamento de meta assistido, resumo de revisão semanal — todos sujeitos a RN-91 a RN-94.
- DO NOT CHANGE: nenhuma sugestão de IA escreve direto nas tabelas de domínio — sempre passa por uma tabela/estado de rascunho até confirmação do usuário (ver RN-92).

---

## Perguntas antes de executar

Priorizadas pelo que mais bloqueia o início (Fase 0):

1. **Provedor de IA e orçamento por usuário** — bloqueia o design da Edge Function de IA, mas não bloqueia Fase 0 nem Fase 1.
2. **Vercel ou Netlify para deploy** — bloqueia o último item da Fase 0 diretamente.
3. **Nome final do produto e domínio** — não bloqueia código, mas bloqueia branding/URLs.
4. **Modelo de monetização** — não bloqueia MVP técnico, mas define se vale criar campos de billing agora ou depois.
5. **OAuth Google além de e-mail/magic link** — pequeno, mas melhor decidir antes da Fase 0 item 4 para não refazer o fluxo de auth.
6. **Prazo alvo do MVP** — não bloqueia código, mas define quanto das Fases 2-5 entram na v1 vs. depois.
