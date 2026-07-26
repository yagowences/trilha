# Etapa 6 — Inbox/Captura Rápida + Planejamento Semanal

## Contexto do produto (repetir)

Depende do sistema de design (Etapa 1) e reaproveita `CardAção`, `BadgeSugestãoIA`. Ambas as telas lidam com itens que ainda não têm data fixa na agenda.

---

## Parte A — Inbox / Captura Rápida

### Objetivo

Captura com fricção zero (RN-01) — o campo de texto é o único obrigatório. Acessível de qualquer tela via atalho de teclado (`C`) ou botão flutuante.

### Regras de negócio aplicadas

| Regra | Comportamento |
|---|---|
| RN-01 | Só o título é obrigatório para salvar no Inbox. |
| RN-04 | Se a IA estimar ≤2 min de duração, sugere "Fazer agora" em vez de agendar. |
| RN-05 | Se o título não começar com verbo, sugestão sutil (não bloqueante) de reescrever como próxima ação. |
| RN-03 | Sair do Inbox exige uma das 6 decisões de triagem. |

### Anatomia

```
┌─────────────────────────────────────────┐
│  O que você precisa lembrar?               │
│  ┌───────────────────────────────────┐    │
│  │ Pagar conta de luz                  │    │
│  └───────────────────────────────────┘    │
│  [Sugestão de IA: Área "Finanças", 10 min] │
│                              [Adicionar]    │
├─────────────────────────────────────────┤
│  Inbox (3)                                  │
│  Ir ao médico          [🔧 triar]           │
│  Ideia: app de receitas [🔧 triar]           │
│  Comprar presente        [🔧 triar]         │
└─────────────────────────────────────────┘
```

### Fluxos

**Fluxo 1 — Captura com sugestão de IA em tempo real**
1. Usuário digita o título; após uma pequena pausa (debounce ~500ms), a IA sugere Área, estimativa e, se aplicável, data — tudo aparece abaixo do campo com `BadgeSugestãoIA`.
2. Usuário pode aceitar em bloco (clicar "Adicionar" já usa as sugestões) ou ignorá-las (item entra no Inbox só com o título, sugestões descartadas).
3. Nunca bloqueia o "Adicionar" esperando a IA responder — se a IA ainda não respondeu, o clique salva só com o título.

**Fluxo 2 — Triagem (RN-03)**
1. Clicar em "triar" (ícone) ao lado de um item do Inbox abre um menu com as 6 opções: Fazer agora / Virar ação / Virar meta-fase / Delegar / Referência / Descartar.
2. Escolher "Virar ação" abre um formulário mínimo (Área, estimativa, data) pré-preenchido com qualquer sugestão de IA que já existia.
3. Item sai da lista do Inbox assim que a triagem é concluída.

### Estados

| Estado | Comportamento |
|---|---|
| Vazio | *"Inbox limpo. Nada esperando triagem."* — tom de conquista discreta, não vazio genérico |
| Item com IA ainda processando | `BadgeSugestãoIA` com texto "Analisando..." no lugar da sugestão |

---

## Parte B — Planejamento Semanal (kanban)

### Objetivo

Distribuir Ações e Entregáveis pendentes ao longo dos 7 dias da semana, fora do ritual formal de Revisão Semanal (uso mais livre, dia a dia).

### Anatomia

```
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ Seg │ Ter │ Qua │ Qui │ Sex │ Sáb │ Dom │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│[Card]│      │[Card]│      │      │      │      │
│[Card]│[Card]│      │      │      │      │      │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┘
        Inbox de tarefas da semana (linha inferior, scroll horizontal)
```

### Fluxos

- Drag-and-drop de `CardAção` entre colunas de dia, ou da linha inferior (itens ainda sem dia definido) para uma coluna.
- Cada coluna de dia mostra uma barra fina de capacidade no cabeçalho (mesma lógica de cor da Etapa 4: neutro/`clay`/`signal`), mas aqui é só indicativo — não bloqueia o drop mesmo acima de 80%, porque esta tela é de uso livre, diferente do ritual formal da Revisão Semanal.

### Estados

| Estado | Comportamento |
|---|---|
| Vazio (semana toda livre) | Colunas mostram apenas um traço sutil convidando a arrastar itens da linha inferior |

## Fora de escopo nestas telas

- Inbox não faz decomposição de Entregável — isso é na Etapa 5.
- Planejamento Semanal não atualiza Key Results nem esvazia o Inbox obrigatoriamente — essas obrigações existem só na Revisão Semanal (Etapa 4).
