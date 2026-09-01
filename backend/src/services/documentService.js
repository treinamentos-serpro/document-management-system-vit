const crypto = require('node:crypto');
const documentRepository = require('../repositories/documentRepository');
const fileStorageRepository = require('../repositories/fileStorageRepository');

const DEFAULT_OWNER = 'anonymous';

function generateDocumentId() {
  return crypto.randomUUID();
}

function createDocument({ id, originalName, storedName, mimeType, size, owner }) {
  return documentRepository.save({
    id: id || generateDocumentId(),
    originalName,
    storedName,
    mimeType,
    size,
    uploadedAt: new Date().toISOString(),
    owner: owner || DEFAULT_OWNER,
  });
}

function listDocuments(owner) {
  return owner ? documentRepository.findByOwner(owner) : documentRepository.findAll();
}

// Devolve o documento e o caminho em disco, ou null se não existir.
function getDocumentForDownload(id) {
  const document = documentRepository.findById(id);

  if (!document || !fileStorageRepository.exists(document.storedName)) {
    return null;
  }

  return { document, filePath: fileStorageRepository.resolvePath(document.storedName) };
}

module.exports = { generateDocumentId, createDocument, listDocuments, getDocumentForDownload };
