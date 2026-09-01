// Configuração do multer: gravação local em STORAGE_DIR com nome derivado do id.
const path = require('node:path');
const multer = require('multer');

const fileStorageRepository = require('../repositories/fileStorageRepository');
const documentService = require('../services/documentService');

const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, fileStorageRepository.storageDir);
  },
  filename(req, file, cb) {
    // O nome em disco nunca deriva do nome enviado pelo usuário.
    file.documentId = documentService.generateDocumentId();
    cb(null, `${file.documentId}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage, limits: { fileSize: MAX_FILE_SIZE } });

module.exports = { upload };
