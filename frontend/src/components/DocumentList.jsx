import DownloadButton from './DownloadButton.jsx';

function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentList({ documents, loading, error }) {
  if (loading) {
    return (
      <div className="br-loading medium" role="status" aria-label="Carregando documentos" />
    );
  }

  if (error) {
    return (
      <div className="br-message danger" role="alert">
        <div className="icon">
          <i className="fas fa-times-circle fa-lg" aria-hidden="true" />
        </div>
        <div className="content">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="br-message info">
        <div className="icon">
          <i className="fas fa-info-circle fa-lg" aria-hidden="true" />
        </div>
        <div className="content">
          <span>Nenhum documento enviado ainda.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="br-table">
      <table>
        <caption>Documentos enviados</caption>
        <thead>
          <tr>
            <th scope="col">Nome</th>
            <th scope="col">Dono</th>
            <th scope="col">Tamanho</th>
            <th scope="col">Enviado em</th>
            <th scope="col">Ações</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document.id}>
              <td>{document.originalName}</td>
              <td>{document.owner}</td>
              <td>{formatSize(document.size)}</td>
              <td>{new Date(document.uploadedAt).toLocaleString('pt-BR')}</td>
              <td>
                <DownloadButton documentId={document.id} originalName={document.originalName} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
