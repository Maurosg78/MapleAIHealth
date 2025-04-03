import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// Validación para asegurarnos de que el elemento existe
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
