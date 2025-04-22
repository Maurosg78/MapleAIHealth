import React, { Suspense, lazy } from 'react';
import { RouteObject, createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AiduxLayout } from './components/layout/AiduxLayout';
import ClinicalAssistantPage from './pages/ClinicalAssistantPage';
import { ProgressPage } from './components/emr/progress';
import VoiceEnabledClinicalPage from './pages/VoiceEnabledClinicalPage';
import VoiceCommandsHelpPage from './pages/VoiceCommandsHelpPage';
import { FunctionalAssessmentContainer } from './containers/FunctionalAssessmentContainer';
import { FunctionalAssessmentSelectionPage } from './pages/FunctionalAssessmentSelectionPage';
import PatientsPage from './pages/PatientsPage';
import PatientDetailPage from './pages/PatientDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreatePatientPage from './pages/CreatePatientPage';
import EditPatientPage from './pages/EditPatientPage';
import ClinicalDashboardPage from './pages/ClinicalDashboardPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

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
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/unauthorized',
    element: (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso No Autorizado</h1>
          <p className="text-gray-600">No tiene los permisos necesarios para acceder a esta página.</p>
        </div>
      </div>
    )
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AiduxLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'dashboard-clinico',
        element: <ClinicalDashboardPage />
      },
      {
        path: 'pacientes',
        element: <PatientsPage />
      },
      {
        path: 'pacientes/nuevo',
        element: <CreatePatientPage />
      },
      {
        path: 'pacientes/:id',
        element: <PatientDetailPage />
      },
      {
        path: 'pacientes/:id/editar',
        element: <EditPatientPage />
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
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
];

// Crear el router con las rutas definidas
const router = createBrowserRouter(routes);

// Componente principal de rutas
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default routes; 