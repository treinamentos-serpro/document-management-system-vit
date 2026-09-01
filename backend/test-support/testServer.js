// Utilidades compartilhadas pelos testes de integração HTTP.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Cria um diretório temporário de storage, isolando os testes de backend/storage.
function createTempStorageDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-'));
}

function removeTempStorageDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// Sobe o app em porta efêmera e devolve a URL base.
async function startServer(app) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  return { server, baseUrl: `http://127.0.0.1:${server.address().port}` };
}

function stopServer(server) {
  return new Promise((resolve) => server.close(resolve));
}

// Monta o corpo multipart de um upload.
function buildUploadForm({ content, filename, mimeType, owner }) {
  const form = new FormData();
  form.append('file', new Blob([content], { type: mimeType }), filename);
  if (owner) {
    form.append('owner', owner);
  }
  return form;
}

module.exports = {
  createTempStorageDir,
  removeTempStorageDir,
  startServer,
  stopServer,
  buildUploadForm,
};
