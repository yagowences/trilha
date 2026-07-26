# Etapa 8 — Tela de Recomeço

## Contexto do produto (repetir)

Depende do sistema de design (Etapa 1). Provavelmente a regra que mais impacta retenção no produto inteiro: quem some por um tempo não pode ser recebido de volta com uma lista de fracassos.

## Objetivo desta tela

Substituir, para quem esteve ausente 5+ dias, a experiência de abrir o app e ver tudo atrasado. Em vez disso: tudo que venceu volta silenciosamente para o Inbox, e esta tela pergunta o que ainda importa.

## Regra de negócio aplicada

| Regra | Comportamento |
|---|---|
| RN-70 | Ao detectar ausência de 5+ dias no login, esta tela substitui o Cockpit como primeira tela — não há lista de atrasados em lugar nenhum da interface, eles já foram movidos ao Inbox nos bastidores antes mesmo do usuário ver qualquer coisa. |

## Anatomia

```
┌─────────────────────────────────────────┐
│                                              │
│         O que ainda importa?                 │
│                                              │
│   Faz um tempo que você não vinha aqui.       │
│   Tudo que ficou parado está esperando         │
│   no seu Inbox, sem pressa.                    │
│                                              │
│           [Ver minhas metas ativas →]           │
│                                              │
└─────────────────────────────────────────┘
```

- Fundo: `--color-paper`, sem elementos decorativos extras — é a tela mais silenciosa do produto de propósito.
- Nenhum número é mostrado nesta tela (nem "12 itens pendentes", nem streak perdido) — números aqui reintroduziriam a culpa que a tela existe para evitar.
- Único CTA: **Ver minhas metas ativas**, que leva ao Mapa da Meta (não ao Cockpit nem ao Inbox diretamente) — o ponto de entrada certo depois de um tempo fora é lembrar do "porquê", não encarar uma lista de tarefas.

## Fluxo

1. Usuário faz login após 5+ dias de ausência.
2. Nos bastidores (sem UI visível disso): todas as Ações com `data_prevista` vencida têm o campo zerado e voltam ao status `inbox`.
3. Esta tela é exibida uma única vez nesse retorno — logins seguintes no mesmo dia já vão direto ao Cockpit normal.

## Estados

Esta tela não tem estado de "vazio" ou "erro" no sentido tradicional — ela só aparece quando a condição de ausência é satisfeita, e seu único conteúdo é o convite acima. Se por algum motivo o usuário não tiver nenhuma meta ativa (ex.: conta nova que nunca usou), o CTA muda para **Criar minha primeira meta** e leva ao Onboarding em vez do Mapa da Meta.

## Fora de escopo nesta tela

- Não mostra o Inbox nem pede triagem imediata — o usuário decide quando quer lidar com aquilo, no seu próprio tempo, na tela de Inbox normal (Etapa 6).
- Não é um modal sobre o Cockpit — é uma tela própria, de tela cheia, que precisa ser conscientemente atravessada antes de chegar a qualquer lista de tarefas.
