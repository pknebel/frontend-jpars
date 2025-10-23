import React from 'react';
import './ModalResultadoValidacao.css';

const ModalResultadoValidacao = ({ 
  isOpen, 
  tipo, 
  mensagem, 
  onConfirm, 
  onClose, 
  showConfirmButton = true,
  confirmText = "Sim",
  closeText = "Não"
}) => {
  if (!isOpen) return null;

  const isSuccess = tipo === 'sucesso';
  const isError = tipo === 'erro';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header ${isError ? 'error' : 'success'}`}>
          <div className="modal-icon">
            {isSuccess && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
            )}
            {isError && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            )}
          </div>
          <h2 className="modal-title">
            {isSuccess ? 'Validação Concluída' : 'Erro na Validação'}
          </h2>
        </div>

        <div className="modal-body">
          <p className="modal-message">{mensagem}</p>
          
          {isSuccess && (
            <p className="modal-complement">
              Deseja selecionar outra gramática para continuar estudando?
            </p>
          )}
        </div>

        <div className={`modal-footer ${!showConfirmButton ? 'single-button' : ''}`}>
          {showConfirmButton && isSuccess && (
            <button 
              className="btn-confirm"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          )}
          
          <button 
            className={`btn-close ${isError ? 'error' : ''}`}
            onClick={onClose}
          >
            {isSuccess ? closeText : closeText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalResultadoValidacao;
