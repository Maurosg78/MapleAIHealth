import React from 'react';

export export interface ButtonProps {
  // Props definidas automáticamente
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children }) => {
  return (
    <div className="Button">
      {children}
    </div>
  );
};

export default Button;
