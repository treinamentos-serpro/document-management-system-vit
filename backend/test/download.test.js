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
let uploaded;

before(async () => {
  ({ server, baseUrl } = await startServer(app));

  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: buildUploadForm({
      content: 'conteudo do contrato',
      filename: 'contrato.pdf',
      mimeType: 'application/pdf',
      owner: 'maria',
    }),
  });
  uploaded = await response.json();
});

after(async () => {
  await stopServer(server);
  removeTempStorageDir(storageDir);
});

test('download devolve o arquivo preservando o nome original', async () => {
  const response = await fetch(`${baseUrl}/documents/${uploaded.id}/download`);
  const content = await response.text();

  assert.strictEqual(response.status, 200);
  assert.match(response.headers.get('content-disposition'), /attachment; filename="contrato\.pdf"/);
  assert.strictEqual(response.headers.get('content-type'), 'application/pdf');
  assert.strictEqual(content, 'conteudo do contrato');
});

test('download de id inexistente retorna 404', async () => {
  const response = await fetch(`${baseUrl}/documents/id-inexistente/download`);
  const body = await response.json();

  assert.strictEqual(response.status, 404);
  assert.strictEqual(typeof body.error, 'string');
});
