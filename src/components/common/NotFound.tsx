import React from 'react';

export interface NotFoundProps {
  message?: string;
}

export const NotFound: React.FC<NotFoundProps> = ({ 
  message = 'No se encontró el recurso solicitado.'
}) => {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>{message}</p>
    </div>
  );
};

export default NotFound;
