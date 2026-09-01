import { useCallback, useEffect, useState } from 'react';
import UploadComponent from '../components/UploadComponent.jsx';
import DocumentList from '../components/DocumentList.jsx';
import { fetchDocuments } from '../services/documentApi.js';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [ownerFilter, setOwnerFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setDocuments(await fetchDocuments(ownerFilter.trim()));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [ownerFilter]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <div className="container-lg">
      <div className="row mt-4">
        <div className="col">
          <UploadComponent onUploaded={loadDocuments} />
        </div>
      </div>

      <div className="row mt-4">
        <div className="col">
          <div className="br-card">
            <div className="card-header">
              <div className="text-weight-semi-bold text-up-02">Documentos</div>
              <div className="text-down-01 text-secondary-06">
                {documents.length} documento(s) encontrado(s)
              </div>
            </div>
            <div className="card-content">
              <div className="br-input mb-4">
                <label htmlFor="owner-filter">Filtrar por dono</label>
                <input
                  id="owner-filter"
                  type="text"
                  placeholder="Todos os donos"
                  value={ownerFilter}
                  onChange={(event) => setOwnerFilter(event.target.value)}
                />
              </div>

              <DocumentList documents={documents} loading={loading} error={error} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
