import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  variant = 'primary' 
}) => {
  return (
    <div className={`spinner spinner-${size} spinner-${variant}`}>
      <div className="spinner-circle"></div>
    </div>
  );
};

export default Spinner;
