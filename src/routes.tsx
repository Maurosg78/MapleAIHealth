import React from 'react';
import { RouteObject } from 'react-router-dom';
import { AiduxLayout } from './components/layout/AiduxLayout';
import ClinicalAssistantPage from './pages/ClinicalAssistantPage';

// Página de inicio que redirigirá a la sección adecuada
const HomePage = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-primary-700 mb-4">AIDUX EMR</h1>
      <p className="text-gray-600 mb-8">Sistema de Historia Clínica Electrónica con IA</p>
      <div className="space-y-2">
        <p>Seleccione una opción del menú lateral para comenzar.</p>
      </div>
    </div>
  </div>
);

// Página provisional para secciones en desarrollo
const UnderDevelopmentPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-full bg-gray-50 py-12">
    <div className="text-center">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h1>
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 inline-block">
        <p className="text-yellow-700">Esta sección está en desarrollo.</p>
      </div>
    </div>
  </div>
);

// Definición de rutas
const routes: RouteObject[] = [
  {
    path: '/',
    element: <AiduxLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'pacientes',
        element: <UnderDevelopmentPage title="Gestión de Pacientes" />
      },
      {
        path: 'consultas',
        element: <ClinicalAssistantPage />
      },
      {
        path: 'agenda',
        element: <UnderDevelopmentPage title="Agenda Médica" />
      },
      {
        path: 'analisis',
        element: <UnderDevelopmentPage title="Análisis y Reportes" />
      },
      {
        path: 'configuracion',
        element: <UnderDevelopmentPage title="Configuración" />
      }
    ]
  }
];

export default routes; 