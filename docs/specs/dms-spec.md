# Especificação - Document Management System

> Especificação completa (Spec Driven Development) gerada a partir de
> `docs/specs/spec-template.md`. Este documento descreve **o que** construir e
> **em que ordem**. Nenhum arquivo de backend ou frontend é implementado nesta
> etapa.

## 1. Objetivo

Entregar uma aplicação web que permita a um usuário enviar, listar e baixar
documentos, com os arquivos gravados no filesystem local da própria aplicação.

## 2. Escopo

### Dentro do escopo

- Upload de documentos (um arquivo por requisição)
- Listagem de documentos com seus metadados
- Download de documentos pelo identificador
- Gestão simples por usuário (identificação do dono no envio)
- Interface web em React consumindo a API via proxy `/api`

### Fora do escopo

- Armazenamento externo ou em nuvem
- Versionamento de documentos
- Autenticação/autorização real (login, sessão, tokens)
- Banco de dados e persistência de metadados entre reinícios
- Exclusão e edição de documentos
- Paginação, busca e filtros avançados

## 3. Requisitos funcionais

| ID    | Requisito                                                                   |
| ----- | --------------------------------------------------------------------------- |
| RF-01 | O usuário pode enviar um documento via `multipart/form-data`                 |
| RF-02 | O sistema gera um identificador único para cada documento enviado            |
| RF-03 | O sistema registra os metadados do documento (nome, tamanho, data, dono)     |
| RF-04 | O usuário pode listar todos os documentos enviados                           |
| RF-05 | O usuário pode filtrar a listagem pelo dono (`owner`) via query string        |
| RF-06 | O usuário pode baixar um documento pelo identificador                        |
| RF-07 | O download preserva o nome original do arquivo                               |
| RF-08 | O sistema rejeita upload sem arquivo com erro de validação                   |
| RF-09 | O sistema rejeita upload acima do tamanho máximo configurado                 |
| RF-10 | O sistema responde 404 para identificador inexistente                        |
| RF-11 | A interface exibe formulário de upload, lista de documentos e botão de baixar |
| RF-12 | A interface exibe mensagens de erro e de sucesso ao usuário, em português    |

## 4. Requisitos não funcionais

| ID     | Requisito                                                                  |
| ------ | -------------------------------------------------------------------------- |
| RNF-01 | Arquivos gravados no filesystem local (`backend/storage`) via multer         |
| RNF-02 | Metadados mantidos em memória nesta fase                                    |
| RNF-03 | Configuração via variáveis de ambiente (12-Factor)                          |
| RNF-04 | Backend em CommonJS; frontend em ESM                                        |
| RNF-05 | Testes de backend com o runner nativo `node:test`                           |
| RNF-06 | Nomes de código em inglês; mensagens e comentários em português             |
| RNF-07 | Nome do arquivo em disco não deriva diretamente do nome enviado pelo usuário |
| RNF-08 | Erros tratados nos limites do sistema (HTTP e I/O de arquivos)              |
| RNF-09 | Sem dependências novas além de `express` e `multer`                         |

### Variáveis de ambiente

| Variável        | Padrão              | Descrição                             |
| --------------- | ------------------- | ------------------------------------- |
| `PORT`          | `3000`              | Porta do servidor backend             |
| `STORAGE_DIR`   | `backend/storage`   | Diretório de gravação dos arquivos    |
| `MAX_FILE_SIZE` | `10485760` (10 MB)  | Tamanho máximo de upload em bytes     |

## 5. Modelo de dados (metadados do documento)

| Campo          | Tipo   | Obrigatório | Descrição                                       |
| -------------- | ------ | ----------- | ----------------------------------------------- |
| `id`           | string | sim         | Identificador único (`crypto.randomUUID()`)     |
| `originalName` | string | sim         | Nome original do arquivo enviado                |
| `storedName`   | string | sim         | Nome do arquivo gravado em disco (uso interno)  |
| `mimeType`     | string | sim         | Tipo MIME informado no upload                   |
| `size`         | number | sim         | Tamanho em bytes                                |
| `uploadedAt`   | string | sim         | Data/hora do upload (ISO 8601)                  |
| `owner`        | string | sim         | Identificador do usuário dono (padrão `anonymous`) |

Regras:

- `storedName` segue o formato `<id><extensão original>` e nunca é exposto na
  API pública.
- O repositório em memória é um `Map` indexado por `id`.

## 6. Contratos de API

Base: `http://localhost:3000`. O frontend acessa via prefixo `/api`
(proxy do Vite remove o prefixo).

### `POST /upload`

- Content-Type: `multipart/form-data`
- Campos:
  - `file` (obrigatório): arquivo a enviar
  - `owner` (opcional): identificador do dono; padrão `anonymous`
- `201 Created`:

```json
{
  "id": "0f7f2b1a-4c9f-4c2e-9f5a-1f0e9b2c3d4e",
  "originalName": "contrato.pdf",
  "mimeType": "application/pdf",
  "size": 20481,
  "uploadedAt": "2026-09-01T12:00:00.000Z",
  "owner": "anonymous"
}
```

- `400 Bad Request`: nenhum arquivo enviado
- `413 Payload Too Large`: arquivo acima de `MAX_FILE_SIZE`

### `GET /documents`

- Query string opcional: `owner`
- `200 OK`:

```json
{
  "documents": [
    {
      "id": "0f7f2b1a-4c9f-4c2e-9f5a-1f0e9b2c3d4e",
      "originalName": "contrato.pdf",
      "mimeType": "application/pdf",
      "size": 20481,
      "uploadedAt": "2026-09-01T12:00:00.000Z",
      "owner": "anonymous"
    }
  ]
}
```

### `GET /documents/:id/download`

- `200 OK`: conteúdo binário
  - `Content-Type`: `mimeType` do documento
  - `Content-Disposition`: `attachment; filename="<originalName>"`
- `404 Not Found`: documento inexistente ou arquivo ausente em disco

### `GET /health`

- `200 OK`: `{ "status": "ok" }`

### Formato de erro

```json
{ "error": "Mensagem de erro em português" }
```

## 7. Decisões arquiteturais

### Backend (Clean Architecture simples)

Fluxo de dependência: `routes -> controllers -> services -> repositories`.
Camadas internas não conhecem camadas externas.

| Camada         | Arquivo previsto                              | Responsabilidade                                        |
| -------------- | --------------------------------------------- | ------------------------------------------------------- |
| `routes/`      | `documentRoutes.js`                           | Declarar endpoints e aplicar o middleware do multer      |
| `controllers/` | `documentController.js`                       | Ler requisição, validar entrada básica, montar resposta  |
| `services/`    | `documentService.js`                          | Regras de negócio: criar metadados, listar, resolver download |
| `repositories/`| `documentRepository.js`                       | Armazenar/consultar metadados em memória                 |
| `repositories/`| `fileStorageRepository.js`                    | Resolver caminhos e ler arquivos em `STORAGE_DIR`        |
| infra          | `config/storage.js` (multer `diskStorage`)    | Configurar destino, nome gravado e limite de tamanho     |

Decisões:

- Multer com `diskStorage`; `filename` usa o `id` gerado, evitando path
  traversal a partir do nome enviado pelo usuário.
- O `id` é criado antes da gravação para que `storedName` e metadados fiquem
  consistentes.
- Repositório em memória isolado atrás de uma interface simples, permitindo
  substituição futura por banco de dados sem alterar o service.
- Middleware de tratamento de erros centralizado no `app.js`, traduzindo erros
  do multer (`LIMIT_FILE_SIZE`) em respostas HTTP adequadas.

### Frontend

| Item                        | Responsabilidade                                    |
| --------------------------- | --------------------------------------------------- |
| `services/documentApi.js`   | Chamadas `fetch` para `/api/...`                    |
| `components/UploadForm.jsx` | Formulário de envio com feedback de erro/sucesso    |
| `components/DocumentList.jsx` | Tabela/lista de documentos                        |
| `components/DownloadButton.jsx` | Ação de baixar um documento                     |
| `pages/DocumentsPage.jsx`   | Compor upload + lista e coordenar o estado          |
| `App.jsx`                   | Renderizar a página                                 |

Decisões:

- Componentes funcionais com Hooks; estado da lista mantido na página.
- Após upload bem-sucedido, a lista é recarregada.
- Sem biblioteca de estado ou de UI (YAGNI).

## 8. Plano de execução

Etapas na ordem de implementação. **Nenhum código é escrito nesta
especificação**; cada etapa será executada posteriormente.

### Etapa 0 - Preparação

1. Confirmar dependências instaladas (`express`, `multer`, React/Vite).
2. Garantir que `backend/storage` exista e que seu conteúdo seja ignorado pelo
   Git (mantendo a pasta com `.gitkeep`).
3. Definir os valores padrão de `PORT`, `STORAGE_DIR` e `MAX_FILE_SIZE`.

### Etapa 1 - Backend: persistência

4. Criar o repositório de metadados em memória (`documentRepository`) com
   `save`, `findAll`, `findByOwner` e `findById`.
5. Criar o repositório de arquivos (`fileStorageRepository`) com resolução de
   caminho dentro de `STORAGE_DIR` e verificação de existência.

### Etapa 2 - Backend: regras de negócio

6. Criar `documentService` com `createDocument`, `listDocuments` e
   `getDocumentForDownload`, incluindo geração de `id` e `uploadedAt`.
7. Definir erros de domínio simples (não encontrado, entrada inválida) para
   serem traduzidos em códigos HTTP pelos controllers.

### Etapa 3 - Backend: HTTP

8. Configurar o multer com `diskStorage`, `limits.fileSize` e nomeação por `id`.
9. Criar `documentController` com `upload`, `list` e `download`.
10. Criar `documentRoutes` e registrá-las no `app.js`, preservando `/health`.
11. Adicionar o middleware central de tratamento de erros.

### Etapa 4 - Backend: testes

12. Escrever testes com `node:test` para: upload com sucesso, upload sem
    arquivo, listagem, listagem filtrada por dono, download com sucesso e
    download de id inexistente.
13. Garantir que os testes usem um diretório temporário de storage.

### Etapa 5 - Frontend

14. Criar `services/documentApi.js` com `uploadDocument`, `fetchDocuments` e
    `buildDownloadUrl`.
15. Criar os componentes `UploadForm`, `DocumentList` e `DownloadButton`.
16. Criar `pages/DocumentsPage` e conectá-la ao `App.jsx`.

### Etapa 6 - Integração e verificação

17. Subir backend e frontend e validar o fluxo completo: enviar, listar e baixar.
18. Verificar mensagens de erro (arquivo ausente, arquivo grande, id inválido).
19. Revisar aderência a SOLID/DRY/KISS/YAGNI e ao fluxo de dependências.

## 9. Critérios de aceite

- [ ] `POST /upload` grava o arquivo em `STORAGE_DIR` e retorna `201` com os metadados.
- [ ] `GET /documents` retorna todos os documentos enviados na sessão atual.
- [ ] `GET /documents?owner=X` retorna apenas os documentos de `X`.
- [ ] `GET /documents/:id/download` devolve o arquivo com o nome original.
- [ ] Identificador inexistente retorna `404` com mensagem em português.
- [ ] Upload sem arquivo retorna `400`; acima do limite retorna `413`.
- [ ] `npm test` no backend passa sem falhas.
- [ ] O frontend permite enviar, listar e baixar sem erros no console.

## 10. Riscos e mitigações

| Risco                                        | Mitigação                                              |
| -------------------------------------------- | ------------------------------------------------------ |
| Perda de metadados ao reiniciar o servidor    | Aceito nesta fase; repositório isolado permite trocar   |
| Path traversal pelo nome do arquivo enviado   | Nome em disco derivado do `id`, nunca do nome original  |
| Upload de arquivos muito grandes              | `limits.fileSize` do multer + resposta `413`            |
| Divergência entre metadados e arquivos        | Download valida existência do arquivo antes de responder |
| Crescimento indefinido de `backend/storage`   | Fora do escopo; documentado como limitação              |
