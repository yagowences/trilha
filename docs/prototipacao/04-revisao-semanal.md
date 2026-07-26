# Etapa 4 — Revisão Semanal

## Contexto do produto (repetir)

Trilha conecta metas de longo prazo a ações diárias. Esta é a única tela do sistema onde `--color-signal` (vermelho) pode aparecer — é o ritual de 15–20 min que sustenta o produto inteiro. Depende do sistema de design (Etapa 1) e do componente `ScorecardSemanal`.

## Objetivo desta tela

Guiar um ritual linear (não um dashboard livre) de fechamento da semana: esvaziar o Inbox, ver os números, atualizar KRs, checar áreas negligenciadas e planejar a semana seguinte respeitando a capacidade real.

## Regras de negócio aplicadas nesta tela

| Regra | Comportamento na UI |
|---|---|
| RN-03 | Cada item do Inbox exige uma das 6 decisões de triagem antes de prosseguir. |
| RN-13 | Key Results só são editáveis nesta tela — em nenhuma outra parte do produto há campo de input para KR. |
| RN-41 | Medidor de capacidade da semana seguinte: neutro até 60%, `clay` entre 60–80%, `signal` acima de 80% — única exceção de vermelho no sistema. |
| RN-44 | Se houver ≥20 ações concluídas no histórico, mostrar sugestão de calibração de estimativa como card informativo, não como alerta. |
| RN-60 | Se a última revisão foi há mais de 7 dias, banner neutro no topo — nunca vermelho, mesmo aqui (é ausência, não erro). |
| RN-70 | Se a ausência foi de 5+ dias, esta tela **não** é a primeira a aparecer — o usuário é levado à tela de Recomeço (Etapa 8) antes. |
| RN-73 | Área sem nenhuma ação concluída em 21 dias aparece na seção "Áreas negligenciadas" como pergunta, não como falha. |
| RN-89 | Todo Entregável ativo precisa ter ≥1 ação planejada para a semana seguinte, ou ser marcado como parado com motivo, antes de fechar a revisão. |

## Anatomia da tela — fluxo linear em 5 passos

A tela é um wizard com indicador de progresso fixo no topo (`Passo 2 de 5`), não uma única página rolável densa — o ritual precisa de sequência, não de escolha livre.

```
┌─────────────────────────────────────────────────────────────────┐
│  Revisão Semanal            ● ● ○ ○ ○   Passo 2 de 5              │
├─────────────────────────────────────────────────────────────────┤
│                     [conteúdo do passo atual]                     │
├─────────────────────────────────────────────────────────────────┤
│  ← Voltar                                    Continuar →           │
└─────────────────────────────────────────────────────────────────┘
```

### Passo 1 — Esvaziar o Inbox (obrigatório)

- Lista de itens capturados na semana, um de cada vez ou em lista com 6 botões de triagem por item (RN-03: fazer agora / virar ação / virar meta-fase / delegar / referência / descartar).
- Botão "Continuar" só habilita quando a lista chega a zero.
- Se o Inbox já está vazio ao entrar: passo é pulado automaticamente, indicador de progresso já mostra Passo 2 de 5.

### Passo 2 — Scorecard da semana (somente leitura)

- `ScorecardSemanal` com 4 tiles: Planejado vs. Executado (minutos), Ações concluídas, Ações adiadas, Hábitos com streak ativo.
- Nenhum campo editável aqui — é só leitura para contextualizar antes de atualizar KRs no próximo passo.

### Passo 3 — Atualizar Key Results

- Um card por KR ativo, mostrando baseline, alvo e um campo numérico para o valor atual.
- Ao lado do campo, a `BarraProgressoDupla` da meta correspondente se atualiza em tempo real conforme o número é digitado (preview antes de confirmar).

### Passo 4 — Áreas negligenciadas (RN-73)

- Lista de Áreas sem ação concluída em 21+ dias, cada uma com a pergunta: *"Essa área ainda importa?"* e duas respostas: **Sim, vou priorizar** (abre atalho para planejar algo nela no Passo 5) / **Por enquanto, não** (silencia o alerta por mais 21 dias).

### Passo 5 — Planejar a semana seguinte

- Lista de Entregáveis ativos à esquerda (backlog), coluna de dias da semana à direita — mesma metáfora de drag-and-drop do Cockpit, mas aqui o destino são dias inteiros, não horários.
- Medidor de capacidade fixo no topo desta coluna: barra horizontal mostrando `capacidade_semanal` vs. soma das estimativas já arrastadas. Cores: neutro (`mist`/`trail`) até 60%, `clay` de 60–80%, **`signal`** acima de 80% (RN-41).
- Ao tentar fechar a revisão com algum Entregável ativo sem nenhuma ação planejada (RN-89): modal simples pede para marcar como "parado" com motivo, ou voltar e planejar algo — não deixa fechar em silêncio.

## Estados da tela

| Estado | Comportamento |
|---|---|
| Vazio (primeira revisão, sem histórico) | Passo 2 mostra placeholder: *"Ainda não há dados da semana — isso vai aparecer a partir da próxima revisão."* |
| Carregando | Skeleton dentro do passo atual, indicador de progresso permanece visível |
| Erro | Banner no topo do passo afetado, nunca impede navegar para outro passo já concluído |
| Banner de revisão atrasada (RN-60) | Texto neutro logo abaixo do indicador de progresso: *"Última revisão: há 2 semanas."* Sem ícone de alerta. |

## Dados exibidos

- `revisao_semanal` (campos planejado/executado/contadores) para o Passo 2.
- `key_result` para o Passo 3.
- `area` + última data de `acao.status=concluida` vinculada, para o Passo 4.
- `entregavel` ativos + `capacidade_semanal` calculada (RN-40) para o Passo 5.

## Fora de escopo nesta tela

- Criar uma nova Meta ou Fase — só planejar dentro das que já existem.
- Qualquer edição de Ação individual além de arrastá-la para um dia (edição completa fica no Detalhe do Entregável ou no Cockpit).
