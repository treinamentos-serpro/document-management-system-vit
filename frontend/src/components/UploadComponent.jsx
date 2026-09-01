import { useRef, useState } from 'react';
import { uploadDocument } from '../services/documentApi.js';

export default function UploadComponent({ onUploaded }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [owner, setOwner] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  function resetForm() {
    setFile(null);
    setOwner('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setFeedback({ type: 'danger', message: 'Selecione um arquivo para enviar.' });
      return;
    }

    setSending(true);
    setFeedback(null);

    try {
      const document = await uploadDocument({ file, owner: owner.trim() });
      setFeedback({
        type: 'success',
        message: `Documento "${document.originalName}" enviado com sucesso.`,
      });
      resetForm();
      onUploaded?.();
    } catch (error) {
      setFeedback({ type: 'danger', message: error.message });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="br-card">
      <div className="card-header">
        <div className="text-weight-semi-bold text-up-02">Enviar documento</div>
        <div className="text-down-01 text-secondary-06">
          Selecione um arquivo do seu computador
        </div>
      </div>

      <div className="card-content">
        <form onSubmit={handleSubmit} noValidate>
          <div className="br-upload mb-4">
            <label className="upload-label" htmlFor="file">
              <span>Arquivo</span>
            </label>
            <input
              ref={fileInputRef}
              className="upload-input"
              id="file"
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            <button
              className="upload-button"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="fas fa-upload" aria-hidden="true" />
              <span>{file ? file.name : 'Selecione o arquivo'}</span>
            </button>
          </div>

          <div className="br-input mb-4">
            <label htmlFor="owner">Dono do documento</label>
            <input
              id="owner"
              type="text"
              placeholder="anonymous"
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
            />
          </div>

          <button
            className={`br-button primary ${sending ? 'loading' : ''}`}
            type="submit"
            disabled={sending}
          >
            Enviar
          </button>
        </form>

        <div aria-live="polite">
          {feedback && (
            <div className={`br-message ${feedback.type} mt-4`} role="alert">
              <div className="icon">
                <i
                  className={`fas ${feedback.type === 'success' ? 'fa-check-circle' : 'fa-times-circle'} fa-lg`}
                  aria-hidden="true"
                />
              </div>
              <div className="content">
                <span>{feedback.message}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
