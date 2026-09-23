# Backend — exportação de CSV

API do projeto de estudo de exportação de CSV. Lista os produtos e gera o arquivo CSV para download.

## Stack

| Tecnologia | Uso |
|---|---|
| Node.js + TypeScript | Linguagem e runtime |
| Fastify | Servidor HTTP |
| Drizzle ORM | Schema, queries e migrations |
| SQLite (better-sqlite3) | Banco de dados em arquivo |
| tsx | Roda TypeScript direto em desenvolvimento |

## Estrutura

```
backend/
├── drizzle/              # migrations geradas pelo drizzle-kit (versionadas)
├── src/
│   ├── db/
│   │   ├── schema.ts     # definição das tabelas
│   │   ├── index.ts      # conexão com o banco
│   │   └── seed.ts       # dados de teste
│   ├── routes/
│   │   └── produtos.ts   # listagem e exportação
│   ├── utils/
│   │   └── csv.ts        # geração do CSV (escape, BOM, separador)
│   └── server.ts
├── drizzle.config.ts
└── sqlite.db             # banco local (não versionado)
```

## Como rodar

Pré-requisito: Node.js 20 ou mais novo.

```bash
npm install
npm run db:migrate   # cria as tabelas no sqlite.db
npm run db:seed      # insere 54 produtos de teste
npm run dev          # sobe em http://localhost:3333
```

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Sobe o servidor com reload automático |
| `npm run db:generate` | Gera uma migration a partir do `schema.ts` |
| `npm run db:migrate` | Aplica as migrations no banco |
| `npm run db:seed` | Apaga e recria os dados de teste |
| `npm run db:studio` | Abre o Drizzle Studio para ver os dados |

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Verifica se a API está no ar |
| GET | `/produtos?categoria=` | Lista os produtos em JSON (filtro opcional) |
| GET | `/produtos/export?categoria=` | Baixa os produtos em CSV (mesmo filtro da listagem) |

A listagem e a exportação usam a mesma função de busca (`buscarProdutos`), então o CSV sempre traz o que está filtrado na tela.

## Como a exportação funciona

A rota `/produtos/export` monta o CSV como texto e responde com dois headers:

| Header | Função |
|---|---|
| `Content-Type: text/csv; charset=utf-8` | Informa que o conteúdo é CSV em UTF-8 |
| `Content-Disposition: attachment; filename="produtos-AAAA-MM-DD.csv"` | Faz o navegador baixar o arquivo, com esse nome, em vez de exibir o texto |

O CORS libera a origem do front (`http://localhost:5173`) e expõe o header `Content-Disposition`. Sem o `exposedHeaders`, o JavaScript do front não consegue ler o nome do arquivo.

## Decisões sobre o CSV

A geração fica isolada em `src/utils/csv.ts`: a rota entrega cabeçalho + linhas, e o `gerarCsv` cuida do resto.

| Decisão | Motivo |
|---|---|
| Separador `;` | O Excel em pt-BR usa vírgula como separador decimal |
| BOM UTF-8 (`\uFEFF`) no início | Faz o Excel reconhecer o UTF-8 e exibir os acentos corretamente |
| Escape RFC 4180 | Valores com `;`, `"` ou quebra de linha vão entre aspas, e `"` vira `""` |
| Quebra de linha `\r\n` | Padrão da RFC 4180, preferido pelo Excel |
| Preço como `39,90` | Sem `R$` e sem separador de milhar, para a planilha reconhecer como número |
| Data em `America/Sao_Paulo` | O servidor pode rodar em UTC; o fuso explícito garante o horário certo |
| `'` antes de `=`, `+`, `-`, `@` | Proteção contra CSV injection (fórmulas executadas pelo Excel) |

O seed inclui produtos com aspas, `;`, acentos e quebra de linha, de propósito, para testar o escape.

## Anotações de estudo

**SQLite x Postgres**
- O SQLite não tem servidor: o banco inteiro é um arquivo (`sqlite.db`)
- Não tem `BOOLEAN` nem `TIMESTAMP`: grava números, e o Drizzle converte com `{ mode: 'boolean' }` e `{ mode: 'timestamp' }`
- Não tem decimal exato, por isso o preço é guardado em centavos (inteiro), o que é boa prática em qualquer banco
- Os tipos têm "afinidade", não são rígidos: o banco aceita texto numa coluna `INTEGER`

**Fastify x Express**
- Retornar um objeto na rota já responde JSON (sem `res.json()`)
- `reply` é o equivalente ao `res`, usado quando é preciso definir headers
- Rotas e recursos (como o CORS) são plugins registrados com `app.register`
- Tipagem de query/params via generic: `app.get<{ Querystring: ... }>`