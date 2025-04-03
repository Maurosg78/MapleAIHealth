import React from 'react';

export export interface CardProps {
  // Props definidas automáticamente
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div className="Card">
      {children}
    </div>
  );
};

export default Card;
