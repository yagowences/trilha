# Etapa 7 — Onboarding, Login e Configurações

## Contexto do produto (repetir)

Depende do sistema de design (Etapa 1). Telas de baixo risco visual — a identidade de marca aparece de verdade a partir do Cockpit, não aqui.

---

## Parte A — Login / Signup

### Anatomia e copy exata

```
┌───────────────────────────┐
│  Trilha                     │
│                              │
│  E-mail                      │
│  [                        ]  │
│  Senha                       │
│  [                        ]  │
│  [Entrar]                    │
│  ── ou ──                    │
│  [Continuar com link mágico] │
│  Não tem conta? Criar conta  │
└───────────────────────────┘
```

- Erro de e-mail inválido: texto abaixo do campo, Body Small, `--color-ink` (não vermelho — mesmo aqui o produto evita alarme desnecessário para um erro de formulário simples): *"Verifique se o e-mail está no formato correto."*
- Após pedir link mágico: *"Link enviado. Verifique sua caixa de entrada."*
- Erro de autenticação (senha errada): *"E-mail ou senha não conferem."*

---

## Parte B — Onboarding (primeira Meta)

### Objetivo

Um único fluxo linear, sem pedir Fases ou Entregáveis ainda — só o suficiente para o usuário ver o Mapa da Meta populado pela primeira vez.

### Anatomia — 3 passos

```
Passo 1: Qual é a sua meta?
  [campo de texto livre]
  Área: [seletor entre áreas padrão ou criar nova]

Passo 2: Para quando?
  [seletor de data]

Passo 3 (opcional): Como você vai medir que chegou lá?
  [campo de Key Result — pode pular]
  [Pular esta etapa]  [Criar minha meta →]
```

- Copy do passo 3, se o usuário tentar pular: sem confirmação extra, pular é uma ação de primeira classe, não escondida.
- Ao concluir: navega direto para o Mapa da Meta com um estado vazio de Fases e uma sugestão: *"Quer que a IA sugira as fases dessa meta?"* com botão que leva ao Planejador de Meta por IA (Etapa 5) já com a meta recém-criada selecionada.

---

## Parte C — Configurações

### Objetivo

Gerenciar Áreas, Hábitos e Rotinas fixas — sem hierarquia visual complexa, listas simples.

### Regras de negócio aplicadas

| Regra | Comportamento |
|---|---|
| RN-55 | Botão "+ Novo hábito" fica desabilitado ao atingir 5 hábitos ativos, com tooltip: *"Você já tem 5 hábitos ativos. Pausar um para adicionar outro."* |

### Anatomia

```
┌─────────────────────────────┐
│ Áreas                          │
│ ● Carreira    ● Saúde    [+ nova] │
├─────────────────────────────┤
│ Hábitos (4/5)                  │
│ Beber 2L de água     [editar]  │
│ Treinar 45min          [editar]  │
│                    [+ Novo hábito]│
├─────────────────────────────┤
│ Rotinas fixas                  │
│ Trabalho  seg-sex 09h-18h [editar]│
│                  [+ Nova rotina]  │
└─────────────────────────────┘
```

- Criar/editar Área: seletor de cor limitado às 6 cores da paleta de Área definida na Etapa 1 — nunca um color picker livre, para preservar consistência visual.
- Criar/editar Rotina: interface simplificada (checkboxes de dia da semana + campo de hora início/fim), nunca expor a sintaxe RRULE crua ao usuário.

## Fora de escopo nestas telas

- Onboarding não permite criar mais de uma meta no fluxo inicial — a 2ª e 3ª metas (até o limite de RN-10) são criadas depois, pelo Mapa da Meta ou Planejador de IA.
- Configurações não gerencia Metas/Fases/Entregáveis — isso é sempre no Mapa da Meta.
