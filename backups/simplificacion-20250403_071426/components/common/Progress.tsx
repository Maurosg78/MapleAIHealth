import React from 'react';

export export interface ProgressProps {
  // Props definidas automáticamente
  children?: React.ReactNode;
}

export const Progress: React.FC<ProgressProps> = ({ children }) => {
  return (
    <div className="Progress">
      {children}
    </div>
  );
};

export default Progress;
