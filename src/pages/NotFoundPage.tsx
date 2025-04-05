import * as React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return React.createElement('div', { className: "not-found-page" }, [
    React.createElement('h1', { key: 'title' }, 'Página no encontrada'),
    React.createElement('p', { key: 'message' }, 'Lo sentimos, la página que buscas no existe.'),
    React.createElement(Link, { key: 'link', to: "/" }, 'Volver al inicio')
  ]);
};

export default NotFoundPage;
