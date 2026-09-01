// Cliente HTTP do DMS. O prefixo /api é redirecionado ao backend pelo proxy do Vite.
const API_PREFIX = '/api';

async function parseError(response, fallbackMessage) {
  try {
    const body = await response.json();
    return body?.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function fetchDocuments(owner) {
  const query = owner ? `?owner=${encodeURIComponent(owner)}` : '';
  const response = await fetch(`${API_PREFIX}/documents${query}`);

  if (!response.ok) {
    throw new Error(await parseError(response, 'Não foi possível carregar os documentos.'));
  }

  const body = await response.json();
  return body.documents;
}

export async function uploadDocument({ file, owner }) {
  const formData = new FormData();
  formData.append('file', file);

  if (owner) {
    formData.append('owner', owner);
  }

  const response = await fetch(`${API_PREFIX}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Não foi possível enviar o documento.'));
  }

  return response.json();
}

export function buildDownloadUrl(id) {
  return `${API_PREFIX}/documents/${encodeURIComponent(id)}/download`;
}
