const { test, before, after } = require('node:test');
const assert = require('node:assert');

const {
  createTempStorageDir,
  removeTempStorageDir,
  startServer,
  stopServer,
} = require('../test-support/testServer');

const storageDir = createTempStorageDir();
process.env.STORAGE_DIR = storageDir;

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

test('listagem sem documentos retorna uma lista vazia', async () => {
  const response = await fetch(`${baseUrl}/documents`);
  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.deepStrictEqual(body, { documents: [] });
});
