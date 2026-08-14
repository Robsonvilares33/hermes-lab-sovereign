# Política de publicação open source

O repositório público só recebe alterações depois de uma verificação automática de segurança, validação de tipos, testes e build. O comando `./scripts/sync-github.sh "mensagem"` executa essa sequência e envia o commit ao remoto público `github`.

| Controle | Regra |
| --- | --- |
| Arquivos proibidos | Arquivos `.env`, certificados, chaves privadas, bancos locais e arquivos de credenciais não podem estar rastreados. |
| Conteúdo sensível | Padrões de chaves de acesso, tokens de GitHub, chaves do Google e blocos de chave privada fazem a verificação falhar. |
| Validação | O mesmo bloqueio roda na integração contínua, seguido de `pnpm check`, `pnpm test` e `pnpm build`. |
| Segredos de produção | Variáveis de ambiente são fornecidas apenas pelo ambiente de execução; não são registradas em arquivos versionados. |

> A verificação é uma camada preventiva, não uma substituição para a revisão humana. Antes de publicar, revise o diff e confirme que não há dados pessoais, credenciais ou dumps de banco.
