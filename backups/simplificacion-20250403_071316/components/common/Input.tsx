import React from 'react';

export export interface InputProps {
  // Props definidas automáticamente
  children?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ children }) => {
  return (
    <div className="Input">
      {children}
    </div>
  );
};

export default Input;
