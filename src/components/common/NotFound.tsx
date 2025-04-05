import * as React from 'react';

export interface NotFoundProps {
  message?: string;
}

export const NotFound: React.FC<NotFoundProps> = ({
  message = 'No se encontró el recurso solicitado.',
}) => {
  return React.createElement('div', { className: "not-found" }, [
    React.createElement('h1', { key: 'title' }, '404'),
    React.createElement('p', { key: 'message' }, message)
  ]);
};

export default NotFound;
