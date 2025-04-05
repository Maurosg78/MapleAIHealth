import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EMRDemo from '../pages/EMRDemo';
import AlertsDemoPage from '../components/examples/AlertsDemoPage';
import AlertsAdvancedPage from '../pages/alerts/AlertsAdvancedPage';
import MainLayout from '../components/layout/MainLayout';

/**
 * Componente principal de rutas de la aplicación
 * Configura las diferentes rutas disponibles en la aplicación
 */
const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Ruta para la página de demostración del EMR */}
        <Route
          path="/emr-demo"
          element={
            <MainLayout>
              <EMRDemo />
            </MainLayout>
          }
        />

        {/* Ruta para la página de demostración de alertas clínicas */}
        <Route
          path="/alertas"
          element={
            <MainLayout>
              <AlertsDemoPage />
            </MainLayout>
          }
        />

        {/* Ruta para la página avanzada de alertas clínicas */}
        <Route
          path="/alertas-avanzadas"
          element={
            <MainLayout>
              <AlertsAdvancedPage />
            </MainLayout>
          }
        />

        {/* Redirección a la página principal por defecto */}
        <Route path="/" element={<Navigate to="/emr-demo" replace />} />

        {/* Redirección para cualquier ruta no encontrada */}
        <Route path="*" element={<Navigate to="/emr-demo" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
