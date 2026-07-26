# Trilha — Prototipação Visual, guia de uso

Este pacote está dividido em etapas. **Entregue um arquivo por vez** para a IA de prototipação — não cole todos de uma vez no mesmo prompt. Cada arquivo de tela repete o contexto mínimo necessário para ser entendido sozinho, mas todos dependem do arquivo `01-sistema-de-design.md`, que deve ser o primeiro a ser enviado (ou colado junto, como contexto fixo, em toda etapa seguinte).

## Ordem de execução recomendada

| Ordem | Arquivo | Conteúdo | Por quê nessa ordem |
|---|---|---|---|
| 1 | `01-sistema-de-design.md` | Tokens, tipografia, grid, anatomia de todo componente reutilizável | Sem isso, cada tela seguinte reinventa estilo — é a fundação que todas as outras herdam |
| 2 | `02-cockpit-diario.md` | Tela do dia a dia | Reaproveita mais componentes do sistema de design que qualquer outra — bom teste de fogo |
| 3 | `03-mapa-da-meta.md` | Visão macro de metas | Valida a `BarraProgressoDupla` e a hierarquia visual antes de repetir em outras telas |
| 4 | `04-revisao-semanal.md` | Ritual semanal | Única tela que usa a cor de alerta — valida que a exceção está isolada corretamente |
| 5 | `05-detalhe-entregavel-e-planejador-ia.md` | Detalhe do entregável + criação de meta assistida por IA | Depende de padrões de "sugestão de IA" já estabelecidos nas telas anteriores |
| 6 | `06-inbox-e-planejamento-semanal.md` | Captura rápida + kanban semanal | Reaproveita `CardAção` e cores de área já validadas |
| 7 | `07-onboarding-login-configuracoes.md` | Entrada no produto e ajustes | Baixo risco visual, pode vir por último |
| 8 | `08-recomeco.md` | Tela de retorno após ausência | Isolada, sem dependências das outras |

## Regra de ouro ao prototipar

Se a IA de prototipação encontrar uma decisão não coberta em nenhum arquivo, ela deve **perguntar antes de inventar** — cada arquivo lista explicitamente o que está fora do escopo daquela tela. Não adicionar elementos visuais, cores ou estados que não estão descritos.
