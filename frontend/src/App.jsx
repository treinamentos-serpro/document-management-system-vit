import DocumentsPage from './pages/DocumentsPage.jsx';

export default function App() {
  return (
    <>
      <header className="br-header">
        <div className="container-lg">
          <div className="header-bottom">
            <div className="header-info">
              <h1 className="header-title">Document Management System</h1>
              <div className="header-subtitle">Envio, listagem e download de documentos</div>
            </div>
          </div>
        </div>
      </header>

      <main id="main" className="mb-5">
        <DocumentsPage />
      </main>
    </>
  );
}
