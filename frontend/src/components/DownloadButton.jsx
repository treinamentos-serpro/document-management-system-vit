import { buildDownloadUrl } from '../services/documentApi.js';

export default function DownloadButton({ documentId, originalName }) {
  return (
    <a
      className="br-button secondary small"
      href={buildDownloadUrl(documentId)}
      download={originalName}
      aria-label={`Baixar ${originalName}`}
    >
      <i className="fas fa-download" aria-hidden="true" />
      Baixar
    </a>
  );
}
