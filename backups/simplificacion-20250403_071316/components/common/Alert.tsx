import React from 'react';

export export interface AlertProps {
  // Props definidas automáticamente
  children?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ children }) => {
  return (
    <div className="Alert">
      {children}
    </div>
  );
};

export default Alert;
