import * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/ownEmr';

/**
 * Componente que protege las rutas verificando si el usuario está autenticado
 * Si el usuario está autenticado, renderiza las rutas hijas
 * Si no, redirige al login
 */
const ProtectedRoute: React.FC = () => {
  // Verificar si hay un usuario autenticado
  const isAuthenticated = authService.isAuthenticated();

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return React.createElement('Navigate', { to: "/login" replace });
  }

  // Si está autenticado, renderizar las rutas hijas
  return React.createElement('Outlet', { });
};

export default ProtectedRoute;
