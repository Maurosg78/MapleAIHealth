import React from 'react';

export export interface ToastProps {
  // Props definidas automáticamente
  children?: React.ReactNode;
}

export const Toast: React.FC<ToastProps> = ({ children }) => {
  return (
    <div className="Toast">
      {children}
    </div>
  );
};

export default Toast;
