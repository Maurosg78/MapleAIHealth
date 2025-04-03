import React from 'react';

export export interface ModalProps {
  // Props definidas automáticamente
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ children }) => {
  return (
    <div className="Modal">
      {children}
    </div>
  );
};

export default Modal;
