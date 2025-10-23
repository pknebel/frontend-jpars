import React from 'react';
import './MessageBox.css';

const MessageBox = ({ 
  type = 'info', 
  message, 
  onClose,
  showCloseButton = false,
  className = ''
}) => {
  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';
  const isInfo = type === 'info';

  return (
    <div className={`message-box ${type} ${className}`}>
      <div className="message-content">
        <div className="message-icon">
          {isSuccess && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          )}
          {isError && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          )}
          {isInfo && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
          )}
        </div>
        
        <div className="message-text">
          <p>{message}</p>
        </div>

        {showCloseButton && onClose && (
          <button 
            className="message-close"
            onClick={onClose}
            aria-label="Fechar mensagem"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageBox;
