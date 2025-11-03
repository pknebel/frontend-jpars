import React from 'react';
import './styles.css';

export default function Manual() {
  return (
    <div className="manual-page">
      <div className="header">
        <h1>Manual de Utilização</h1>
      </div>
      
      <div className="main-content">
        <div className="pdf-container">
          <iframe
            src="/manual.pdf"
            title="Manual da Ferramenta - JPARS"
            className="pdf-viewer"
          />
        </div>
      </div>
    </div>
  );
}

