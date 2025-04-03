import React from 'react';

export export interface SelectProps {
  // Props definidas automáticamente
  children?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ children }) => {
  return (
    <div className="Select">
      {children}
    </div>
  );
};

export default Select;
