import React from 'react';
import './HelpModal.css';

const HelpModal = ({ isOpen, onAccept, onReject, tentativas }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>💡 Precisa de ajuda?</h2>
        </div>
        
        <div className="modal-body">
          <p>
            Você já tentou <strong>{tentativas} vezes</strong> sem sucesso.
          </p>
          <p>
            Deseja ver a resposta correta?
          </p>
          <p className="modal-note">
            Se você visualizar a resposta, ela será preenchida automaticamente no campo.
          </p>
        </div>
        
        <div className="modal-footer">
          <button 
            className="modal-button modal-button-reject"
            onClick={onReject}
          >
            Não, quero tentar mais
          </button>
          <button 
            className="modal-button modal-button-accept"
            onClick={onAccept}
          >
            Sim, mostrar resposta
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;

