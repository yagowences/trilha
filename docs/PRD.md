# Trilha — PRD

> **Nome do projeto:** `[A DEFINIR: nome do produto]`. Usando o codinome **"Trilha"** neste documento — faz referência à trilha entre uma meta de longo prazo e a ação de hoje, que é o problema central que o produto resolve. Trocar por find-and-replace quando o nome final existir.

## Problema

Ferramentas de produtividade existentes (Todoist, Notion, Google Calendar) resolvem bem uma das duas pontas — ou o micro (lista de tarefas do dia) ou o macro (quadro de metas) — mas não a conexão entre elas. O usuário acaba com uma lista de afazeres sem propósito visível ou um quadro de metas bonito que não sobrevive a duas semanas de uso, porque nada na tela do dia mostra que aquela tarefa está empurrando um objetivo real.

**Para quem:** pessoas com metas pessoais ou profissionais ambiciosas de médio/longo prazo (mudança de carreira, mudança de país, projeto pessoal grande, transformação de saúde) que já tentaram e abandonaram sistemas como Notion ou Todoist — tipicamente por perda do fio entre a ação diária e o objetivo, não por falta de disciplina.

**Evidência:** `[A DEFINIR: validar com entrevistas ou dados de abandono de ferramentas concorrentes — hoje a hipótese vem da experiência pessoal de quem propôs o produto, o que é um bom ponto de partida mas não é evidência de mercado]`.

## Proposta / Hipótese

Um sistema com hierarquia obrigatória — Área da vida → Meta → Fase (ciclos de 12 semanas) → Entregável → Ação — onde toda ação agendável carrega, de forma visível mas não intrusiva, o vínculo com a meta que ela serve. O progresso é calculado por peso de esforço (não por contagem de itens), e o produto impõe limites deliberados (máx. 3 metas ativas, máx. 2 fases ativas, máx. 3 prioridades por dia) para forçar foco em vez de virar mais um lugar para acumular listas infinitas.

A camada de IA acelera a fricção de planejamento (descrever uma meta em linguagem natural e receber uma proposta de fases/entregáveis) sem nunca decidir sozinha — toda sugestão de IA é editável e exige confirmação antes de virar dado real (RN-92).

## Usuários & Job-to-be-Done

**Perfil:** early adopters de produtividade, confortáveis com estrutura — não é o usuário que quer um simples bloco de notas, é quem já tentou sistemas complexos e abandonou por falta de conexão entre camadas.

**Job-to-be-done:** *"Quando estou perseguindo uma meta ambiciosa de longo prazo, quero que minhas ações diárias estejam claramente conectadas a ela e caibam na minha agenda real, para não abandonar nem o sistema nem a meta."*

**Contexto de uso:** check-in diário rápido (≤2 min) ao acordar ou começar o trabalho; fechamento diário (≤1 min) à noite; revisão semanal (15–20 min) no fim de semana; planejamento de fase a cada 12 semanas.

## Métricas de Sucesso

| Métrica | Definição | Meta |
|---|---|---|
| Ativação | % de contas que criam ≥1 meta com ≥1 fase e ≥1 ação agendada nas primeiras 48h | `[A DEFINIR]` |
| Retenção do ritual | % de usuários que completam a revisão semanal em ≥3 das primeiras 4 semanas | `[A DEFINIR]` |
| Confiança na IA | % de sugestões de IA (decomposição/planejamento) aceitas sem edição vs. editadas vs. descartadas | `[A DEFINIR — coletar baseline nas primeiras semanas, sem meta a priori]` |
| Qualidade da captura por linguagem natural | % de itens capturados via IA que exigem correção manual do usuário | `[A DEFINIR]` |
| Latência de IA | Tempo de resposta para captura em linguagem natural | ≤3s p95 (percebido como instantâneo) |
| Latência de IA | Tempo de resposta para decomposição de entregável / planejamento de meta | ≤8s p95 (aceitável com loading state, é ação deliberada) |

Não há números-alvo de negócio (MRR, número de contas pagantes) porque monetização ainda não foi decidida — ver Questões em Aberto.

## Não-Objetivos

Explicitamente fora desta versão:

- Times/workspaces compartilhados (ex.: casal planejando metas juntos) — modelo é single-user por conta.
- Aplicativo mobile nativo — MVP é web responsivo.
- Sincronização bidirecional com Google Calendar/Outlook.
- Gamificação além de contadores simples de streak (sem pontos, níveis, badges).
- Cobrança/assinatura — MVP roda como acesso gratuito ou beta fechado.
- IA generativa para qualquer coisa além dos quatro casos de uso definidos (captura, decomposição, planejamento de meta, resumo semanal) — sem chat livre, sem "assistente geral".

## Questões em Aberto & Riscos

**Bloqueiam o início do trabalho:**

1. `[A DEFINIR]` Nome final do produto e domínio.
2. `[A DEFINIR]` Modelo de monetização (freemium, trial, sempre grátis no beta?) — afeta se precisamos de tabela de billing desde já mesmo sem cobrar ainda.
3. `[A DEFINIR]` Provedor de IA a usar via edge function (Claude API é a escolha natural dado o ecossistema, mas não foi confirmado) e orçamento de custo por usuário/mês.
4. `[A DEFINIR]` Prazo alvo para o MVP.

**Não bloqueiam o início, mas precisam de decisão antes da Fase correspondente:**

5. `[A DEFINIR]` Se "multi-tenant" nunca vai além de isolamento por usuário individual, ou se workspaces compartilhados entram no roadmap — muda o modelo de dados quando chegar lá.
6. `[A DEFINIR]` Idioma único (PT-BR) ou i18n desde o início.

**Riscos:**

- **Risco de produto:** o limite rígido de 3 metas ativas (RN-10) é a decisão de posicionamento mais arriscada do produto — pode gerar atrito e reviews negativas de quem quer mais flexibilidade. É uma aposta consciente de identidade, não um detalhe técnico.
- **Risco técnico de IA:** alucinação em sugestões de planejamento de meta (ex.: IA inventando prazos ou fatos específicos de um processo externo, como "Toptal leva 3–8 semanas") — mitigado por marcar toda sugestão como `[Sugestão de IA]` na UI e nunca apresentar como fato verificado.
- **Risco de custo:** captura por linguagem natural em toda tarefa criada pode gerar custo de API não trivial em escala — precisa de rate limit por usuário desde o MVP (ver Requisitos de Segurança na Camada 2).
