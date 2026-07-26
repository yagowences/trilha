# Etapa 2 — Cockpit Diário

## Contexto do produto (repetir)

Trilha conecta metas de longo prazo a ações diárias. Esta é a tela que o usuário abre ao acordar — 100% execução, zero visão de metas distantes. Depende do sistema de design (Etapa 1) para tokens, tipografia e componentes (`CardAção`, `ToggleHábito`, `GradeAgenda`, `FioBreadcrumb`).

## Objetivo desta tela

Permitir, em menos de 2 minutos, que o usuário veja hábitos do dia, escolha até 3 prioridades e as encaixe na agenda por drag-and-drop — sem nenhum sinal de urgência ou atraso.

## Regras de negócio aplicadas nesta tela

| Regra | Comportamento na UI |
|---|---|
| RN-32 | Máximo 3 `CardAção` na seção "Prioridades". Tentar marcar uma 4ª exige desmarcar outra antes — ver Fluxo 2. |
| RN-42 | Bloco de Ação não pode sobrepor Rotina com `bloqueia_agenda = true` — drop rejeitado, ver anatomia da `GradeAgenda` na Etapa 1. |
| RN-45 | Ação não concluída **não** migra automaticamente para amanhã — permanece na lista de hoje até o Fechamento Diário decidir seu destino. |
| RN-34 | 3º adiamento de uma ação dispara modal único com 4 opções — ver Fluxo 6. |
| RN-71 | Nenhum elemento desta tela usa `--color-signal`. Atraso é comunicado, no máximo, com um texto neutro em Body Small — nunca cor de alerta. |
| RN-52 | Hábito com streak em risco (faltou o dia anterior) mostra o `ToggleHábito` com um contorno pontilhado sutil em `clay` — não vermelho, não texto de alarme. |

## Anatomia da tela

```
┌─────────────────────────────────────────────────────────────────┐
│  Bom dia, [nome]                             qui, 25 de julho    │  ← header, space-8 padding
├───────────────────────────┬───────────────────────────────────────┤
│ HÁBITOS DO DIA (Caption)    │  AGENDA                    08h–22h    │
│ ○ Beber 2L de água  🔥12    │  ┌───────────────────────────────┐  │
│ ○ Treinar 45min      🔥3    │  │ 08h                            │  │
│                              │  │ 09h ▓▓ Trabalho (rotina fixa)   │  │
│ PRIORIDADES (Caption)  2/3   │  │ 10h                            │  │
│ [CardAção]                  │  │ 11h ░░ [CardAção arrastado]      │  │
│ [CardAção]                  │  │ ...                             │  │
│ + adicionar prioridade        │  │ 18h ▓▓ Trabalho (rotina fixa)   │  │
│                              │  └───────────────────────────────┘  │
│ OUTRAS TAREFAS DE HOJE       │                                     │
│ [CardAção]                  │                                     │
│ [CardAção]                  │                                     │
├───────────────────────────┴───────────────────────────────────────┤
│                                          [Encerrar o dia →]         │  ← footer fixo
└─────────────────────────────────────────────────────────────────┘
```

Proporção de colunas: 40% (lista) / 60% (agenda) em desktop. Divisor vertical: 1px `mist`.

## Fluxos de interação

**Fluxo 1 — Marcar hábito do dia**
1. Usuário toca no `ToggleHábito` vazio.
2. Círculo preenche em `trail` (150ms), contador de streak incrementa com uma pequena animação de "pulso" no número.
3. Se esse hábito tem `minimo_viavel` e o valor de hoje ainda não atingiu o alvo cheio, o toggle mostra um estado intermediário (metade preenchido) em vez de binário — só para hábitos do tipo `quantidade`.

**Fluxo 2 — Marcar a 4ª prioridade (RN-32)**
1. Usuário tenta arrastar ou marcar como prioridade um 4º `CardAção` enquanto já há 3.
2. Ação é bloqueada; aparece um tooltip discreto ancorado no card: *"Você já tem 3 prioridades hoje. Desmarque uma para adicionar esta."*
3. Nenhum modal, nenhum som, nenhuma cor de alerta — é fricção informativa, não punição.

**Fluxo 3 — Drag-and-drop para a agenda**
1. Usuário pressiona e arrasta um `CardAção` da coluna esquerda.
2. Card assume o estado "arrastando" (ver Etapa 1).
3. Ao pairar sobre a `GradeAgenda`, o slot mais próximo (snap de 15 min) é destacado com borda tracejada `trail`.
4. Se o slot está livre: ao soltar, o card se transforma num bloco na agenda, cor da Área, e a lista da esquerda marca esse item com o ícone de relógio (estado "agendada").
5. Se o slot conflita com Rotina bloqueante: bloco retorna à origem com shake + tooltip (especificado na Etapa 1, anatomia da `GradeAgenda`).
6. Se o slot conflita com outra Ação (não Rotina): permitido, ambos aparecem lado a lado estreitados — sobreposição entre ações é às vezes intencional (RN-42 só proíbe sobre rotina bloqueante).

**Fluxo 4 — Concluir uma ação**
1. Usuário clica no checkbox do `CardAção`, seja na lista ou no bloco da agenda (os dois representam o mesmo dado, sempre sincronizados).
2. Checkbox preenche, título ganha risco, opacidade cai para 60%.
3. Nos bastidores, o progresso do Entregável pai é recalculado — **mas isso nunca aparece nesta tela**. O Cockpit não mostra barra de progresso de Entregável; isso é exclusivo do Mapa da Meta (Etapa 3). Mostrar progresso aqui seria reintroduzir a distração de meta distante que esta tela existe para evitar.

**Fluxo 5 — Expandir o Fio**
1. Usuário clica no ícone `[fio ▸]` de um `CardAção`.
2. Expande o `FioBreadcrumb` abaixo do card (conforme Etapa 1).
3. Não navega para outra tela automaticamente — só ao clicar num segmento específico do breadcrumb.

**Fluxo 6 — 3º adiamento de uma ação (RN-34)**
1. Ao mover uma ação para "amanhã" pela terceira vez (contador `adiamentos` interno, não visível diretamente ao usuário como número), abre um modal (`radius-lg`, sombra padrão de modal).
2. Título do modal: *"Essa tarefa já foi adiada 3 vezes."* Corpo: *"O que você quer fazer com ela?"*
3. Quatro botões, mesmo peso visual (nenhum é destacado como "recomendado" — a decisão é do usuário): **Reduzir escopo** · **Delegar** · **Agendar agora** · **Descartar**.
4. Modal nunca mais reaparece para essa ação depois de uma escolha, mesmo que ela seja adiada de novo.

**Fluxo 7 — Encerrar o dia (shutdown ritual)**
1. Botão fixo no rodapé, sempre visível, nunca obrigatório.
2. Abre um painel simples (não modal bloqueante): lista de ações não concluídas hoje, cada uma com dois botões rápidos — **Manter para amanhã** / **Voltar para o Inbox**.
3. Fechar o painel sem decidir nada é permitido — nesse caso, RN-45 se aplica: nada migra sozinho.

## Estados da tela

| Estado | Comportamento |
|---|---|
| Vazio (sem tarefas hoje) | Coluna de prioridades mostra: *"Nada planejado para hoje ainda."* com botão **Ver Fase ativa** que leva ao Mapa da Meta |
| Carregando | Skeleton cinza-claro (`mist` pulsando suavemente) no formato exato dos `CardAção` e da grade — nunca um spinner genérico central |
| Erro (falha ao carregar) | Banner fino no topo da coluna afetada: *"Não foi possível carregar sua agenda. Tentar de novo."* com link de retry — nunca modal, nunca bloqueia a outra coluna |
| Populado | Conforme anatomia acima |

## Dados exibidos (referência ao modelo de dados)

- `CardAção`: `acao.titulo`, `acao.area_id` (cor do badge), `acao.estimativa_min`, `acao.status`.
- `ToggleHábito`: `habito.titulo`, `habito_log.valor` do dia, streak calculado.
- Blocos da `GradeAgenda`: `bloco.origem_tipo`, `bloco.inicio`, `bloco.fim`, cor derivada da Área da origem.

## Fora de escopo nesta tela

- Progresso de Entregável/Fase/Meta (pertence ao Mapa da Meta).
- Qualquer atualização de Key Result (pertence à Revisão Semanal).
- Criação de nova Meta/Fase/Entregável (pertence a outras telas) — o Cockpit só cria Ações avulsas via captura rápida (Etapa 6).
