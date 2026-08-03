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

- [ ] **Fase 4: Implementar módulo de geração e análise de jogos de loteria**
  - [ ] Criar módulo para geração de jogos (Mega Sena, Lotomania, +Milionária).
  - [ ] Implementar análise estatística para os jogos gerados.
  - [ ] Exibir os jogos gerados na interface.

- [ ] **Fase 5: Criar vault de conhecimento com persistência**
  - [ ] Desenvolver interface para o Vault de conhecimento.
  - [ ] Persistir investigações, análises e relatórios no banco de dados.
  - [ ] Permitir consulta de documentos do Vault pelo usuário.

- [ ] **Fase 6: Implementar painel de resultados de sorteios**
  - [ ] Criar painel para exibição do histórico de concursos.
  - [ ] Implementar entrada manual de resultados de sorteios.
  - [ ] Processar e exibir resultados de concursos processados pelo sistema.

- [ ] **Fase 7: Configurar notificações automáticas ao dono**
  - [ ] Implementar sistema de notificações automáticas (Robson).
  - [ ] Enviar notificações para conclusão de análise ou geração de novos jogos.

- [ ] **Fase 8: Implementar armazenamento e download de PDFs**
  - [ ] Armazenar relatórios PDF gerados pelo sistema.
  - [ ] Permitir download posterior de portfólios, análises e documentos do Vault.

- [ ] **Fase 9: Refinar visual e UX com design elegante e sofisticado**
  - [ ] Aplicar estilo visual elegante e perfeito.
  - [ ] Garantir acabamento refinado em todos os elementos da interface.
  - [ ] Transmitir sofisticação e precisão técnica.

- [ ] **Fase 10: Testar, validar e entregar o projeto**
  - [ ] Realizar testes completos de todas as funcionalidades.
  - [ ] Validar a integração entre os módulos.
  - [ ] Preparar para entrega final ao usuário.
