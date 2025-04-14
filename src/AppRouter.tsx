import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

// Componente que provee el enrutador a la aplicación
export const AppRouter = () => <RouterProvider router={router} />; 