// Metadados dos documentos mantidos em memória nesta fase.
const documents = new Map();

function save(document) {
  documents.set(document.id, document);
  return document;
}

function findAll() {
  return Array.from(documents.values());
}

function findByOwner(owner) {
  return findAll().filter((document) => document.owner === owner);
}

function findById(id) {
  return documents.get(id) || null;
}

module.exports = { save, findAll, findByOwner, findById };
