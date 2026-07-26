# Etapa 1 — Sistema de Design

## Contexto do produto (repetir em toda etapa)

Trilha é um SaaS de produtividade que conecta metas de longo prazo a ações do dia a dia via uma hierarquia obrigatória (Área → Meta → Fase → Entregável → Ação), mais rotinas fixas e hábitos que compõem a agenda. A identidade visual precisa parecer **calma por natureza** — uma regra de negócio (nenhum vermelho na tela diária) virou restrição de marca: a paleta de alerta só existe numa única tela (Revisão Semanal).

## Grid e espaçamento

- Grid base de **8px**. Toda margem, padding e gap é múltiplo de 8 (exceção: 4px permitido só dentro de componentes pequenos como badges).
- Escala de espaçamento nomeada: `space-1` = 4px, `space-2` = 8px, `space-3` = 12px, `space-4` = 16px, `space-6` = 24px, `space-8` = 32px, `space-12` = 48px, `space-16` = 64px.
- Container máximo: 1440px, centralizado, com `space-8` de margem lateral mínima.
- Breakpoints: mobile `<768px`, tablet `768–1023px`, desktop `≥1024px`.

## Paleta (tokens CSS)

```css
--color-paper: #F3F4F0;   /* fundo base */
--color-ink: #23261F;      /* texto principal */
--color-trail: #3F5A45;    /* ação primária, o "fio" */
--color-clay: #B9793E;     /* sugestão de IA, celebração */
--color-mist: #DADFD7;     /* bordas, divisores */
--color-signal: #A64B3E;   /* ALERTA — só na Revisão Semanal, nunca em outra tela */
```

Paleta de Área (categórica, escolhida pelo usuário ao criar uma Área — nunca reutilizar trail/clay/signal):

```css
--area-1: #5B7B9C; /* azul-poeira */
--area-2: #C08A3E; /* ocre */
--area-3: #6E8B6E; /* sage */
--area-4: #8B6A8F; /* ameixa */
--area-5: #5B6670; /* ardósia */
--area-6: #B06B4A; /* terracota */
```

## Tipografia

| Papel | Fonte | Tamanho/altura de linha | Peso | Uso |
|---|---|---|---|---|
| Display XL | Fraunces | 40px/48px | 600 | Nome da meta no Mapa da Meta |
| Display L | Fraunces | 28px/36px | 600 | Título de página |
| Heading | Inter | 20px/28px | 600 | Cabeçalho de seção/card |
| Body | Inter | 16px/24px | 400 | Texto principal, itens de lista |
| Body Small | Inter | 14px/20px | 400 | Texto secundário, descrições |
| Caption | Inter | 12px/16px | 500, uppercase, tracking 0.04em | Labels, badges, nomes de status |
| Data Mono | IBM Plex Mono | 14px/20px | 500 | Estimativas, percentuais, contadores de streak |

Regra: Fraunces aparece **só** em títulos de página e no momento de celebração de 85% da fase. Em qualquer outro lugar, título de card usa Heading (Inter), não Fraunces — excesso de display face é o erro mais comum que torna um protótipo "genérico".

## Ícones

Lucide (`lucide-react`), stroke 1.5px, tamanho padrão 20px. Nunca ícones preenchidos (filled) — só outline, para manter o tom quieto.

## Elevação e forma

- `radius-sm` 6px: badges, chips, pills.
- `radius-md` 8px: cards.
- `radius-lg` 12px: modais, drawers, painéis flutuantes.
- Nenhum `box-shadow` em cards no estado padrão — borda de 1px `mist`. Hover: borda muda para `trail` a 40% de opacidade, sem sombra.
- Único lugar do sistema inteiro com `box-shadow`: modais e drawers (elevação real, sombra suave `0 8px 24px rgba(35,38,31,0.12)`).

## Movimento

- Transição padrão: 150ms ease-out para hover/focus.
- Preenchimento de barra de progresso: 400ms ease-out, dispara só ao concluir uma ação (não em toda renderização).
- Respeitar `prefers-reduced-motion: reduce` — nesse caso, todas as transições acima viram instantâneas (0ms), sem exceção.

---

## Anatomia dos componentes

### `CardAção`

```
┌──┬──────────────────────────────────┬────────┐
│▎ │ ☐  Título da ação                 │ 45 min │
│▎ │    [badge de Área] [fio ▸]         │        │
└──┴──────────────────────────────────┴────────┘
```

- Faixa lateral esquerda (`▎`) de 2px na cor `trail` — é o "fio", sempre presente, independente do estado.
- Checkbox à esquerda do título (16px, radius-sm).
- Badge de Área: pill pequena (radius-sm), cor de fundo = cor da área a 15% de opacidade, texto na cor sólida da área.
- Estimativa à direita, sempre em Data Mono.
- `[fio ▸]`: ícone pequeno de link (Lucide `link-2` ou similar), ao lado do badge de área — ao clicar/tocar, expande o `FioBreadcrumb` (ver abaixo).

**Estados:**
| Estado | Diferença visual |
|---|---|
| Padrão | conforme anatomia acima |
| Concluída | checkbox preenchido em `trail`, título com `text-decoration: line-through` e opacidade 60% |
| Agendada (já num bloco da agenda) | ícone de relógio pequeno ao lado da estimativa |
| Arrastando | opacidade 80%, sombra temporária `0 4px 12px rgba(35,38,31,0.15)` (única exceção de sombra em card, só durante o drag) |
| Sugestão de IA pendente | `BadgeSugestãoIA` substitui o badge de Área até confirmação |

### `CardEntregável`

```
┌────────────────────────────────────────┐
│ Título do Entregável         [status]   │
│ ▸ Critério de conclusão (colapsável)    │
│ ████████████████░░░░  82%                │
└────────────────────────────────────────┘
```

- Barra de progresso: altura 6px, `radius-lg` (full/pill), trilho em `mist`, preenchimento em `trail`.
- Barra trava visualmente em 95% mesmo com todas as ações concluídas (RN-84) — não é bug de UI, é o comportamento correto; só passa de 95% quando o critério é marcado manualmente.
- Badge de status: `rascunho` (cinza neutro), `ativo` (sem badge, é o padrão), `estourado` (`clay`), `concluído` (`trail` cheio), `parado` (contorno tracejado + `mist`).

### `BarraProgressoDupla`

```
Execução   ████████████░░░░  78%
Resultado  ██████░░░░░░░░░░  40%
```

Duas barras de 4px de altura, `space-1` (4px) de gap entre elas, cada uma com label em Caption acima. Cor da barra de Execução: `trail`. Cor da barra de Resultado: `clay` a 70% de opacidade (deliberadamente mais clara que a de Execução — Execução é o dado "quente", Resultado é o dado "frio e mais raro de atualizar"). Tooltip ao passar o mouse sobre qualquer uma explica a diferença em uma frase.

### `BadgeSugestãoIA`

Pill `radius-sm`, fundo `clay` a 15% de opacidade, borda 1px `clay`, texto `clay` sólido em Caption. Ícone de sparkle (Lucide `sparkles`) antes do texto **"Sugestão"**. Nunca aparece sozinho sem essa palavra — é o único elemento que distingue dado de IA de dado confirmado.

### `GradeAgenda`

- Linhas de hora das 08h às 22h, cada linha com 56px de altura.
- Subdivisões de 15 min marcadas com linha guia sutil (`mist` a 40%) a cada 14px dentro da linha de hora.
- Linha de "agora" (hora atual): 2px sólida em `trail`, atravessando a grade inteira horizontalmente.
- Blocos de Rotina fixa: fundo `mist` sólido, sem borda, label centralizado, não podem receber drop (RN-42) — cursor de "not-allowed" ao tentar arrastar algo por cima.
- Blocos de Ação/Hábito: seguem a cor da Área correspondente, a 20% de opacidade de fundo com borda sólida na cor cheia.
- Drop-hover: slot de destino destacado com borda tracejada `trail` antes de soltar.
- Conflito de drop sobre Rotina bloqueante: o bloco retorna à posição original com uma pequena animação de "sacudida" (shake, 200ms) e um tooltip aparece: *"Esse horário já está ocupado por [nome da rotina]."*

### `ToggleHábito`

Círculo de 24px. Vazio (contorno `mist`) → feito (preenchido `trail`, ícone de check branco). Contador de streak ao lado, sempre em Data Mono, formato `🔥 12` (emoji de fogo é aceitável aqui — é o único emoji do sistema, reservado para streak). Nunca mostrar número negativo ou "0 dias" com tom de fracasso — streak zerado mostra apenas o ícone vazio, sem número.

### `FioBreadcrumb`

Ao clicar no ícone `[fio ▸]` de um `CardAção` ou `CardEntregável`, expande abaixo do card (empurra o conteúdo seguinte para baixo, não sobrepõe) uma linha compacta:

```
Carreira › Mudar para a Europa em 9 meses › Fase 1
```

Cada segmento é clicável e navega para a tela correspondente (Área → Configurações; Meta e Fase → Mapa da Meta, com scroll até o item). Transição de expansão: 200ms ease-out, ícone gira de `▸` para `▾`.

### `ScorecardSemanal`

Grid de 2 colunas × 2 linhas de "tiles" de estatística, cada tile com: label em Caption, valor grande em Data Mono (24px), variação opcional em Body Small abaixo. É o único componente do sistema que pode usar `--color-signal`, e só quando um valor está em estado de alerta genuíno (ex.: capacidade da semana seguinte acima de 80% do limite) — ver detalhes na Etapa 4.

## Fora de escopo desta etapa

Esta etapa não define copy específico de cada tela (isso está em cada arquivo de tela) nem lógica de negócio — só a linguagem visual compartilhada. Se a IA de prototipação precisar de um componente não listado aqui, deve perguntar antes de criar um novo padrão visual.
