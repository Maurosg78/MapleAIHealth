import React, { Suspense, lazy } from 'react';
import { RouteObject, createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AiduxLayout } from './components/layout/AiduxLayout';
import ClinicalAssistantPage from './pages/ClinicalAssistantPage';
import { ProgressPage } from './components/emr/progress';
import VoiceEnabledClinicalPage from './pages/VoiceEnabledClinicalPage';
import VoiceCommandsHelpPage from './pages/VoiceCommandsHelpPage';
import { FunctionalAssessmentContainer } from './containers/FunctionalAssessmentContainer';
import { FunctionalAssessmentSelectionPage } from './pages/FunctionalAssessmentSelectionPage';

// Importando componentes con lazy loading
const PatientComparisonPage = lazy(() => import('./pages/PatientComparisonPage').then(module => ({ default: module.PatientComparisonPage })));
const AssistantDemoPage = lazy(() => import('./pages/AssistantDemoPage').then(module => ({ default: module.AssistantDemoPage })));

// Componente de carga
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    Cargando...
  </div>
);

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
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <PatientComparisonPage />
      </Suspense>
    ),
  },
  {
    path: '/assistant',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AssistantDemoPage />
      </Suspense>
    ),
  },
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
        path: 'consultas-voz',
        element: <VoiceEnabledClinicalPage />
      },
      {
        path: 'consultas-voz/:patientId',
        element: <VoiceEnabledClinicalPage />
      },
      {
        path: 'consultas-voz/:patientId/:visitId',
        element: <VoiceEnabledClinicalPage />
      },
      {
        path: 'comandos-voz',
        element: <VoiceCommandsHelpPage />
      },
      {
        path: 'progreso',
        element: <ProgressPage />
      },
      {
        path: 'evaluacion-funcional',
        element: <FunctionalAssessmentSelectionPage />
      },
      {
        path: 'evaluacion-funcional/:patientId',
        element: <FunctionalAssessmentContainer />
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

// Crear el router con las rutas definidas
const router = createBrowserRouter(routes);

// Componente principal de rutas
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default routes; 