import * as React from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    React.createElement('div', { className: "modal-overlay" }, 
      <div className="modal">
        <div className="modal-header">
          {title && <h3 className="modal-title">{title}</h3>}
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        )
        React.createElement('div', { className: "modal-content" }, {children})
      </div>
    </div>
    null
  );
};

export default Modal;
