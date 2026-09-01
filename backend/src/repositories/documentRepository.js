// Metadados dos documentos persistidos em um arquivo JSON dentro do storage.
const fs = require('node:fs');
const path = require('node:path');

const fileStorageRepository = require('./fileStorageRepository');

const metadataFile = path.join(fileStorageRepository.storageDir, '.documents.json');

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
  } catch {
    // Arquivo ausente ou corrompido: começa de uma lista vazia.
    return [];
  }
}

function writeAll(documents) {
  fs.writeFileSync(metadataFile, JSON.stringify(documents, null, 2), 'utf8');
}

function save(document) {
  const documents = readAll().filter((stored) => stored.id !== document.id);
  documents.push(document);
  writeAll(documents);
  return document;
}

function findAll() {
  return readAll();
}

function findByOwner(owner) {
  return findAll().filter((document) => document.owner === owner);
}

function findById(id) {
  return findAll().find((document) => document.id === id) || null;
}

module.exports = { save, findAll, findByOwner, findById };
