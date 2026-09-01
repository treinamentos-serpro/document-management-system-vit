const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');

const {
  createTempStorageDir,
  removeTempStorageDir,
  startServer,
  stopServer,
  buildUploadForm,
} = require('../test-support/testServer');

const storageDir = createTempStorageDir();
process.env.STORAGE_DIR = storageDir;
process.env.MAX_FILE_SIZE = '1024';

const app = require('../src/app');

let server;
let baseUrl;

before(async () => {
  ({ server, baseUrl } = await startServer(app));
});

after(async () => {
  await stopServer(server);
  removeTempStorageDir(storageDir);
});

test('upload com sucesso retorna 201 com os metadados do documento', async () => {
  const form = buildUploadForm({
    content: 'conteudo do contrato',
    filename: 'contrato.pdf',
    mimeType: 'application/pdf',
    owner: 'maria',
  });

  const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: form });
  const body = await response.json();

  assert.strictEqual(response.status, 201);
  assert.match(body.id, /^[0-9a-f-]{36}$/);
  assert.strictEqual(body.originalName, 'contrato.pdf');
  assert.strictEqual(body.mimeType, 'application/pdf');
  assert.strictEqual(body.size, 20);
  assert.strictEqual(body.owner, 'maria');
  assert.ok(!Number.isNaN(Date.parse(body.uploadedAt)));
  assert.strictEqual(body.storedName, undefined, 'storedName não deve ser exposto');

  const uploadedFiles = fs.readdirSync(storageDir).filter((name) => !name.startsWith('.'));
  assert.strictEqual(uploadedFiles.length, 1, 'o arquivo deve ser gravado no storage');
});

test('upload sem owner assume o dono padrão anonymous', async () => {
  const form = buildUploadForm({
    content: 'sem dono',
    filename: 'anexo.txt',
    mimeType: 'text/plain',
  });

  const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: form });
  const body = await response.json();

  assert.strictEqual(response.status, 201);
  assert.strictEqual(body.owner, 'anonymous');
});

test('upload sem arquivo retorna 400 com mensagem de erro', async () => {
  const form = new FormData();
  form.append('owner', 'maria');

  const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: form });
  const body = await response.json();

  assert.strictEqual(response.status, 400);
  assert.strictEqual(typeof body.error, 'string');
});

test('upload com campo de arquivo inesperado retorna 400', async () => {
  const form = new FormData();
  form.append('documento', new Blob(['conteudo'], { type: 'text/plain' }), 'nota.txt');

  const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: form });
  const body = await response.json();

  assert.strictEqual(response.status, 400);
  assert.strictEqual(typeof body.error, 'string');
});

test('upload acima do limite de tamanho retorna 413', async () => {
  const form = buildUploadForm({
    content: 'a'.repeat(2048),
    filename: 'grande.txt',
    mimeType: 'text/plain',
  });

  const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: form });
  const body = await response.json();

  assert.strictEqual(response.status, 413);
  assert.strictEqual(typeof body.error, 'string');
});
