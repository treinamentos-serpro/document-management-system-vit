const { test, before, after } = require('node:test');
const assert = require('node:assert');

const {
  createTempStorageDir,
  removeTempStorageDir,
  startServer,
  stopServer,
  buildUploadForm,
} = require('../test-support/testServer');

const storageDir = createTempStorageDir();
process.env.STORAGE_DIR = storageDir;

const app = require('../src/app');

let server;
let baseUrl;

before(async () => {
  ({ server, baseUrl } = await startServer(app));

  await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: buildUploadForm({
      content: 'primeiro',
      filename: 'contrato.pdf',
      mimeType: 'application/pdf',
      owner: 'maria',
    }),
  });

  await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: buildUploadForm({
      content: 'segundo',
      filename: 'nota.txt',
      mimeType: 'text/plain',
      owner: 'joao',
    }),
  });
});

after(async () => {
  await stopServer(server);
  removeTempStorageDir(storageDir);
});

test('listagem retorna os documentos enviados sem expor storedName', async () => {
  const response = await fetch(`${baseUrl}/documents`);
  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.documents.length, 2);
  assert.deepStrictEqual(
    body.documents.map((document) => document.originalName).sort(),
    ['contrato.pdf', 'nota.txt'],
  );
  assert.ok(body.documents.every((document) => document.storedName === undefined));
});

test('listagem filtrada por owner retorna apenas os documentos do dono', async () => {
  const response = await fetch(`${baseUrl}/documents?owner=joao`);
  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.documents.length, 1);
  assert.strictEqual(body.documents[0].originalName, 'nota.txt');
  assert.strictEqual(body.documents[0].owner, 'joao');
});
