// Resolve caminhos e verifica arquivos dentro do diretório de armazenamento.
const fs = require('node:fs');
const path = require('node:path');

const storageDir = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR)
  : path.resolve(__dirname, '../../storage');

fs.mkdirSync(storageDir, { recursive: true });

function resolvePath(storedName) {
  return path.join(storageDir, path.basename(storedName));
}

function exists(storedName) {
  return fs.existsSync(resolvePath(storedName));
}

module.exports = { storageDir, resolvePath, exists };
