const documentService = require('../services/documentService');

// Remove campos de uso interno antes de responder.
function toPublicDocument({ id, originalName, mimeType, size, uploadedAt, owner }) {
  return { id, originalName, mimeType, size, uploadedAt, owner };
}

function upload(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
  }

  const document = documentService.createDocument({
    id: req.file.documentId,
    originalName: req.file.originalname,
    storedName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    owner: req.body.owner,
  });

  return res.status(201).json(toPublicDocument(document));
}

function list(req, res) {
  const documents = documentService.listDocuments(req.query.owner);
  return res.json({ documents: documents.map(toPublicDocument) });
}

function download(req, res, next) {
  const result = documentService.getDocumentForDownload(req.params.id);

  if (!result) {
    return res.status(404).json({ error: 'Documento não encontrado.' });
  }

  res.type(result.document.mimeType);
  return res.download(result.filePath, result.document.originalName, (err) => {
    if (err) {
      next(err);
    }
  });
}

module.exports = { upload, list, download };
