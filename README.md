# Hermes Lab Sovereign

Hermes Lab Sovereign é um painel pessoal de pesquisa com chat assistido, cofre de conhecimento e ferramentas de acompanhamento de loterias. O projeto usa React, tRPC, Drizzle e MySQL/TiDB.

## Status e limites

O módulo de Mega-Sena consulta resultados públicos, calcula estatísticas descritivas e gera combinações para estudo. Cada combinação simples de seis dezenas continua tendo a mesma probabilidade matemática de acertar a sena: **1 em 50.063.860**. Histórico, frequência e modelos heurísticos não tornam uma combinação individual mais provável de ser sorteada; portanto, o projeto não oferece promessas de prêmio, retorno financeiro ou desempenho preditivo. [1]

| Área | Estado atual |
| --- | --- |
| Chat Hermes | Histórico persistente por sessão |
| Vault | Documentos, categorias e tags |
| Loterias | Mega-Sena, Lotomania e +Milionária |
| Resultados | Registro manual e sincronização de Mega-Sena |
| Geração V2 | 30 jogos únicos em categorias A, B e C |
| Atualização recorrente | Endpoints preparados; job é ativado após a publicação do site |

## Execução local

Pré-requisitos: Node.js 22+, pnpm e uma instância MySQL/TiDB. Crie um arquivo `.env` local a partir das variáveis documentadas em `server/_core/env.ts`; nunca envie esse arquivo ao repositório.

```bash
pnpm install
pnpm db:push
pnpm dev
```

Para validar o projeto antes de abrir um pull request ou sincronizar alterações:

```bash
pnpm check
pnpm test
pnpm build
```

## Resultados e estratégia de loteria

O adaptador usa a API pública comunitária de resultados e normaliza as dezenas e datas antes de salvá-las. A página oficial da CAIXA permanece a referência para conferência final de resultados, regras e probabilidades. [1] [2]

Os 30 jogos são organizados em categorias de cobertura, não em níveis de probabilidade de vitória:

| Categoria | Quantidade | Finalidade |
| --- | ---: | --- |
| A | 10 | Mistura de frequência histórica e atraso para pesquisa exploratória |
| B | 10 | Distribuição equilibrada de dezenas |
| C | 10 | Cobertura concentrada nas dezenas historicamente mais frequentes |

Os valores exibidos como `confidence` são **scores heurísticos de análise**, entre 0 e 100, e não probabilidades de acerto ou recomendações financeiras.

## Sincronização com GitHub

O repositório inclui uma validação contínua em `.github/workflows/ci.yml`. Para sincronizar uma alteração validada, execute:

```bash
./scripts/sync-github.sh "descrição objetiva da alteração"
```

O script executa a verificação de tipos, os testes e o build antes de criar o commit e enviar a alteração ao repositório configurado. Ele não armazena tokens, senhas nem URLs com credenciais.

## Contribuição

Leia [CONTRIBUTING.md](CONTRIBUTING.md) antes de contribuir. Questões de segurança devem seguir [SECURITY.md](SECURITY.md).

## Licença

Este projeto é distribuído sob a licença [MIT](LICENSE).

## Referências

[1]: https://loterias.caixa.gov.br/wps/portal/loterias/landing/megasena "Mega-Sena — CAIXA"
[2]: https://github.com/guto-alves/loterias-api "guto-alves/loterias-api"
