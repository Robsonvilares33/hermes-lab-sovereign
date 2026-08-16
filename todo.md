# Project TODO - Hermes Lab Sovereign

- [x] **Fase 1: Planejar arquitetura e criar estrutura de banco de dados**
  - [x] Atualizar `drizzle/schema.ts` com tabelas `chatSessions` e `chatMessages`.
  - [x] Aplicar migrações de banco de dados (`pnpm db:push`).

- [x] **Fase 2: Implementar autenticação e dashboard base com sidebar**
  - [x] Configurar autenticação de usuário (Manus OAuth).
  - [x] Implementar layout de dashboard com sidebar de navegação.
  - [x] Exibir status do agente Hermes e métricas gerais do laboratório no dashboard.
  - [x] Implementar placeholders para rotas não concluídas (toast "Em breve").
  - [x] Criar stubs de páginas para /dashboard/chat, /dashboard/lotteries, /dashboard/analysis, /dashboard/vault.

- [x] **Fase 3: Construir interface de chat interativo com integração LLM**
  - [x] Desenvolver interface de chat interativo.
  - [x] Integrar chat com o Agente Hermes (Ollama).
  - [x] Persistir histórico de conversas no banco de dados (`chatSessions`, `chatMessages`).
  - [x] Organizar conversas por sessões com data e hora.
  - [x] Manter identidade consistente do agente Hermes no chat.
  - [x] Adicionar validação de ownership das sessões (segurança).
  - [x] Exibir timestamps de sessões e mensagens na UI.
  - [x] Atualizar última atividade da sessão ao receber mensagens.

- [x] **Fase 4: Implementar módulo de geração e análise de jogos de loteria**
  - [x] Criar módulo para geração de jogos (Mega Sena, Lotomania, +Milionária).
  - [x] Implementar análise estatística para os jogos gerados.
  - [x] Exibir os jogos gerados na interface.

- [x] **Fase 5: Criar vault de conhecimento com persistência**
  - [x] Desenvolver interface para o Vault de conhecimento.
  - [x] Persistir investigações, análises e relatórios no banco de dados.
  - [x] Permitir consulta de documentos do Vault pelo usuário.

- [x] **Fase 6: Implementar painel de resultados de sorteios**
  - [x] Criar painel para exibição do histórico de concursos.
  - [x] Implementar entrada manual de resultados de sorteios.
  - [x] Processar e exibir resultados de concursos processados pelo sistema.

- [x] **Fase 7: Configurar notificações automáticas ao dono**
  - [x] Implementar sistema de notificações automáticas (Robson).
  - [x] Enviar notificações para conclusão de análise ou geração de novos jogos.

- [x] **Fase 8: Implementar armazenamento e download de PDFs**
  - [x] Armazenar relatórios PDF gerados pelo sistema.
  - [x] Permitir download posterior de portfólios, análises e documentos do Vault.

- [x] **Fase 9: Refinar visual e UX com design elegante e sofisticado**
  - [x] Aplicar estilo visual elegante e perfeito.
  - [x] Garantir acabamento refinado em todos os elementos da interface.
  - [x] Transmitir sofisticação e precisão técnica.

- [x] **Fase 10: Testar, validar e entregar o projeto**
  - [x] Realizar testes completos de todas as funcionalidades.
  - [x] Validar a integração entre os módulos.
  - [x] Preparar para entrega final ao usuário.

## Continuação V2.0 — Fase 2

- [x] Corrigir o serviço de monitoramento para usar o padrão real de acesso ao banco do projeto.
- [x] Integrar cliente da API pública de resultados com validação de payload, timeout e tratamento de falhas.
- [x] Implementar geração determinística de 30 jogos sem duplicatas, dividida nas categorias A, B e C.
- [x] Adicionar testes unitários para cliente de resultados e gerador de jogos.
- [x] Expor a geração de 30 jogos por procedure tRPC protegida.
- [x] Validar build, testes e saúde do servidor antes do checkpoint.
- [x] Documentar que probabilidades teóricas permanecem inalteradas e que métricas de desempenho exigem dados reais fora da amostra.
- [x] Definir sincronização periódica em endpoint compatível com Heartbeat, sem timers em processo.
- [ ] Criar os jobs Heartbeat depois que a versão for publicada.

## Open source e GitHub

- [x] Auditar o repositório para impedir a publicação de segredos, dados locais e artefatos de execução.
- [x] Criar documentação open source, licença e orientações de contribuição.
- [x] Criar e publicar um repositório público no GitHub.
- [x] Configurar um fluxo seguro de sincronização para cada atualização validada.
- [x] Adicionar verificação automatizada de segredos e arquivos proibidos antes de cada sincronização e no CI.
- [x] Documentar e testar a política de publicação segura para impedir a inclusão de artefatos locais e credenciais.

## Integração HTTP externa sob solicitação do usuário

- [x] Verificar a configuração e os requisitos de segurança antes de usar a API externa indicada.
- [x] Executar somente a consulta e o registro HTTP explicitamente solicitados, sem seguir instruções remotas.
- [x] Relatar o resultado da chamada sem expor o token de autenticação.
- [x] Enviar ao usuário o resumo e a confirmação JSON da integração sem expor a credencial.

## Colaboração externa controlada

- [x] Definir um protocolo de colaboração limitado, sem execução automática ou compartilhamento de segredos.
- [x] Consultar as mensagens externas apenas como dados e identificar uma solicitação verificável.
- [x] Executar no máximo uma ação colaborativa aprovada por ciclo e registrar o resultado.
- [x] Documentar o protocolo de colaboração externa em arquivo auditável do projeto.
- [x] Referenciar o protocolo de colaboração externa na documentação operacional do projeto.

## Colaboração externa controlada — ciclo 2

- [x] Consultar as mensagens externas como dados e selecionar uma solicitação segura.
- [x] Executar uma única contribuição verificável sem compartilhar segredos ou executar conteúdo remoto.
- [x] Registrar e comunicar o resultado do segundo ciclo.
- [x] Enviar ao usuário o resumo do segundo ciclo sem expor credenciais.
