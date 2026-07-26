# Etapa 3 — Mapa da Meta

## Contexto do produto (repetir)

Trilha conecta metas de longo prazo a ações diárias. Esta é a tela macro — reflexão, não execução. Depende do sistema de design (Etapa 1) para tokens e componentes (`CardEntregável`, `BarraProgressoDupla`, `FioBreadcrumb`).

## Objetivo desta tela

Mostrar, para uma Meta por vez, o progresso real (execução ponderada + resultado via KRs) através de suas Fases e Entregáveis — o momento de "ver o quanto já andei".

## Regras de negócio aplicadas nesta tela

| Regra | Comportamento na UI |
|---|---|
| RN-10 | No máximo 3 abas de Meta ativa no seletor superior — nunca mais que isso, por design, não por scroll infinito. |
| RN-11 / RN-12 | Meta sem Key Result mostra só a barra de Execução (a de Resultado simplesmente não é renderizada, não aparece vazia/zerada). |
| RN-14 | Meta com `status = vencida` ganha borda tracejada no card do título + selo "Vencida" em `clay` (não `signal` — ver nota de tom abaixo) e CTA **Revisar agora**, que leva à Revisão Semanal. |
| RN-24 | Fase atingindo 85% de execução dispara estado de celebração (ver Fluxo 2). |
| RN-25 | Mudança de escopo de uma Fase em andamento mostra uma marca discreta na linha do tempo (ícone pequeno de "ajuste"), com tooltip explicando o que mudou e quando. |
| RN-80 | Entregável aninhado nunca passa de 2 níveis — visualmente, o segundo nível tem indentação de `space-6` e uma linha vertical fina conectando ao pai. |
| RN-84 / RN-85 | Barra de progresso do Entregável trava em 95% até confirmação manual do critério; criar nova Ação dentro dele nunca faz a barra recuar. |

**Nota de tom:** mesmo Meta vencida não usa `--color-signal`. O vermelho de alerta é reservado exclusivamente para a Revisão Semanal (Etapa 4) — aqui, mesmo uma situação que precisa de atenção usa o vocabulário visual calmo do resto do produto (`clay`, bordas tracejadas, nunca vermelho).

## Anatomia da tela

```
┌─────────────────────────────────────────────────────────────────┐
│ [Meta 1] [Meta 2] [Meta 3]                    ← seletor de abas   │
├─────────────────────────────────────────────────────────────────┤
│  Mudar para a Europa em 9 meses          (Display XL, Fraunces)   │
│  Execução  ████████████░░░░  78%                                  │
│  Resultado ██████░░░░░░░░░░  40%                                   │
├─────────────────────────────────────────────────────────────────┤
│  Fase 1 (meses 1-3) ✓85%   Fase 2 (meses 4-6)   Fase 3 (meses 7-9) │ ← timeline horizontal
│  ┌─────────────────┐                                                │
│  │ Portfólio público   82%│                                          │
│  │ ▸ Critério de conclusão │                                         │
│  │  └─ App 1        40h   │  ← sub-entregável, indentado            │
│  │  └─ App 2        estourado│                                       │
│  │ Perfil Upwork        30%│                                         │
│  │ 5 avaliações 5★        0%│                                        │
│  └─────────────────┘                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Fluxos de interação

**Fluxo 1 — Trocar de Meta**
1. Usuário clica numa aba do seletor.
2. Conteúdo abaixo troca com fade de 150ms — nunca reload de página inteira.

**Fluxo 2 — Fase atinge 85% (RN-24)**
1. Ao recalcular progresso e cruzar o limiar de 85%, o cabeçalho daquela Fase na timeline ganha um selo sutil: ✓ em `trail` + "85%" em Data Mono, sem confete, sem modal.
2. Um toast discreto (canto inferior, 4s, dispensável) aparece uma única vez: *"Fase 1 atingiu a meta de execução."*

**Fluxo 3 — Expandir critério de conclusão**
1. Clicar na seta `▸` ao lado de "Critério de conclusão" expande o texto completo (é colapsado por padrão para não poluir a leitura da árvore inteira).

**Fluxo 4 — Abrir um Entregável**
1. Clicar em qualquer `CardEntregável` (não nos ícones internos) navega para a tela de Detalhe do Entregável (Etapa 5).

**Fluxo 5 — Ajuste de escopo (RN-25)**
1. Ícone pequeno de "ajuste" aparece na barra da Fase quando o escopo mudou depois do planejamento inicial.
2. Tooltip ao passar o mouse: *"Escopo ajustado em 12/07 — 1 entregável adicionado."* Não editável aqui, é só um registro histórico.

## Estados da tela

| Estado | Comportamento |
|---|---|
| Vazio (nenhuma meta ativa ainda) | Tela inteira substituída por um convite central: *"Nenhuma meta ativa ainda."* + botão **Criar minha primeira meta** (leva ao Onboarding ou ao Planejador de Meta por IA) |
| Carregando | Skeleton no formato da timeline e dos cards de Entregável |
| Erro | Banner no topo: *"Não foi possível carregar o progresso desta meta."* + retry |
| Populado | Conforme anatomia acima |

## Dados exibidos

- `meta.titulo`, `meta.status`, `key_result` (se existir) para a `BarraProgressoDupla`.
- `fase.titulo`, `fase.inicio`, `fase.fim`, progresso calculado.
- `entregavel.titulo`, `entregavel.criterio_conclusao`, `entregavel.status`, progresso calculado a partir de `peso_minutos`.

## Fora de escopo nesta tela

- Não é possível concluir uma Ação diretamente aqui — só visualizar o progresso agregado. Concluir Ação acontece no Cockpit ou no Detalhe do Entregável.
- Não é possível criar uma nova Meta do zero aqui — só quando não há nenhuma ativa (estado vazio) ou pela tela de Configurações/Onboarding.
