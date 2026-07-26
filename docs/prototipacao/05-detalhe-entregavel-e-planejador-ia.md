# Etapa 5 — Detalhe do Entregável + Planejador de Meta por IA

## Contexto do produto (repetir)

Depende do sistema de design (Etapa 1) e reaproveita `CardAção`, `BadgeSugestãoIA`, `CardEntregável`. Estas duas telas compartilham o mesmo padrão central: **toda sugestão de IA é editável e exige confirmação antes de virar dado real (RN-92)** — nenhuma delas escreve direto no banco.

---

## Parte A — Detalhe do Entregável

### Objetivo

Ver e gerenciar as Ações/sub-entregáveis de um Entregável específico, marcar manualmente o critério de conclusão, e pedir decomposição assistida por IA quando o entregável está vago demais.

### Regras de negócio aplicadas

| Regra | Comportamento |
|---|---|
| RN-80 | Aninhamento limitado a 2 níveis — se o usuário tentar criar um 3º nível, a UI bloqueia com aviso: *"Este item já está no nível mais profundo permitido. Considere transformá-lo em uma Fase própria."* |
| RN-82 | Critério de conclusão é campo obrigatório para o entregável sair de `rascunho`. |
| RN-84 | Checkbox de "Marcar critério como concluído" é **separado** de qualquer checkbox de Ação — só ele destrava 100%. |
| RN-86 | Ações concluídas somando mais de 120% do esforço estimado disparam o badge `estourado` no `CardEntregável` (herdado da Etapa 3). |
| RN-92 | Sugestões de decomposição chegam com `BadgeSugestãoIA`, aceitas uma a uma ou em lote, nunca automaticamente. |

### Anatomia

```
┌─────────────────────────────────────────────────────────────────┐
│ ‹ Fase 1                                                          │
│ Portfólio público                                     [ativo]     │
│ ▸ Critério de conclusão: 3 repositórios públicos, cada um com...   │
│   ☐ Marcar critério como concluído                                │
│ ████████████████░░░░ 82%  (esforço estimado: 40h)                 │
├─────────────────────────────────────────────────────────────────┤
│  Ações e sub-entregáveis                    [+ Sugerir decomposição]│
│  [CardAção] Comprar e configurar domínio          45 min           │
│  [CardEntregável] App 1                            40h  ▸          │
│  [CardEntregável] App 2                        estourado ▸         │
└─────────────────────────────────────────────────────────────────┘
```

### Fluxos

**Fluxo 1 — Pedir decomposição por IA**
1. Usuário clica em **Sugerir decomposição**.
2. Botão entra em estado de carregamento (spinner pequeno inline, texto muda para "Pensando...", até 8s conforme meta de latência).
3. Resposta popula uma lista temporária de `CardAção` sugeridas, cada uma com `BadgeSugestãoIA` e dois ícones: aceitar (✓) e descartar (✕), individuais.
4. Botão adicional no topo da lista temporária: **Aceitar todas**.
5. Nada é salvo até a ação de aceitar — descartar uma sugestão simplesmente a remove da lista, sem confirmação extra.

**Fluxo 2 — Marcar critério de conclusão manualmente**
1. Usuário clica no checkbox "Marcar critério como concluído" — ação deliberada, separada de qualquer Ação individual.
2. Barra de progresso salta de até-95% para 100%, com a animação de preenchimento padrão (400ms).
3. Status do `CardEntregável` muda para `concluído` em todas as telas onde ele aparece (Mapa da Meta inclusive).

### Estados

| Estado | Comportamento |
|---|---|
| Vazio (entregável recém-criado, sem ações) | Mensagem central: *"Ainda não há ações aqui. Adicione manualmente ou peça uma sugestão de decomposição."* |
| Carregando decomposição | Ver Fluxo 1 |
| Erro na decomposição | Card informativo no lugar da lista: *"Não foi possível gerar sugestões agora. Você pode adicionar ações manualmente."* — nunca bloqueia a criação manual |

---

## Parte B — Planejador de Meta por IA

### Objetivo

Permitir que o usuário descreva uma meta em linguagem natural e receba uma proposta editável de Fases e Entregáveis — reduzindo a fricção de estruturar um plano do zero.

### Regras de negócio aplicadas

| Regra | Comportamento |
|---|---|
| RN-10 | Se o usuário já tem 3 metas ativas, o botão de criar nova meta por IA (ou manual) fica desabilitado com tooltip: *"Você já tem 3 metas ativas. Conclua ou arquive uma para criar outra."* |
| RN-92 | Nenhuma Fase/Entregável sugerido é salvo antes da confirmação explícita. |
| RN-94 | Qualquer prazo ou fato externo mencionado pela IA (ex.: duração de um processo seletivo) ganha um ícone de "estimativa, não verificado" ao lado. |

### Anatomia

```
┌─────────────────────────────────────────────────────────────────┐
│  Descreva sua meta                                                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Ex.: "Quero mudar para a Europa em 9 meses trabalhando        │  │
│  │ remoto como desenvolvedor..."                                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                              [Gerar proposta →]     │
├─────────────────────────────────────────────────────────────────┤
│  Proposta (editável antes de confirmar)                           │
│  Fase 1 (meses 1-3) — construir ativos enquanto o inglês sobe      │
│    Entregável: Portfólio público            [editar] [remover]     │
│    Entregável: Perfil Upwork nichado ⓘ       [editar] [remover]     │
│  Fase 2 (meses 4-6) — subir de patamar                              │
│    ...                                                              │
│                          [Descartar tudo]   [Confirmar e criar →]  │
└─────────────────────────────────────────────────────────────────┘
```

O ⓘ ao lado de um item indica que a IA incluiu uma referência externa não verificada (RN-94) — tooltip: *"Estimativa da IA, não verificada — confirme antes de confiar no prazo."*

### Fluxos

**Fluxo 1 — Gerar proposta**
1. Usuário escreve a descrição livre e clica **Gerar proposta**.
2. Estado de carregamento: o botão vira "Pensando..." com spinner, campo de texto fica desabilitado (até 8s).
3. Resposta popula a lista de Fases/Entregáveis propostos, cada item com `BadgeSugestãoIA` implícito (toda a seção "Proposta" já está visualmente marcada, não precisa repetir o badge em cada linha).

**Fluxo 2 — Editar antes de confirmar**
1. Clicar em "editar" em qualquer Entregável proposto abre edição inline (título e esforço estimado editáveis diretamente na lista, sem modal).
2. Clicar em "remover" tira o item da proposta sem afetar os demais.

**Fluxo 3 — Confirmar**
1. **Confirmar e criar** persiste a Meta + Fases + Entregáveis de uma vez, respeitando os limites RN-10/RN-21 no momento da criação (se confirmar excederia o limite, a UI barra com a mesma mensagem do bloqueio de criação).
2. Após confirmar, navega automaticamente para o Mapa da Meta, já na aba da meta recém-criada.

### Estados

| Estado | Comportamento |
|---|---|
| Vazio (antes de descrever a meta) | Campo de texto com placeholder de exemplo, sem proposta abaixo |
| Erro ao gerar proposta | Mensagem abaixo do campo: *"Não foi possível gerar uma proposta agora. Tente novamente ou crie sua meta manualmente."* + link para criação manual |

## Fora de escopo nestas telas

- O Planejador de Meta por IA não cria Ações individuais — só até o nível de Entregável. Ações são criadas depois, manualmente ou via decomposição (Parte A).
- Nenhuma das duas telas atualiza Key Results — isso é exclusivo da Revisão Semanal.
