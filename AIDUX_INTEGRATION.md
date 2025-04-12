# Guía de Integración de AIDUX EMR

Este documento explica cómo integrar los componentes de AIDUX EMR en la aplicación MapleAI Health existente, con enfoque en la reducción de carga cognitiva y mejora de la experiencia del usuario clínico.

## Estructura de Componentes

AIDUX se organiza en los siguientes componentes principales:

1. **AiduxLayout**: Layout principal con navegación optimizada
2. **ClinicalAssistant**: Asistente clínico inteligente con IA
3. **PatientDashboard**: Gestión de pacientes centrada en el usuario

## Pasos para la Integración

### 1. Actualizar las Dependencias

Asegúrate de que todas las dependencias necesarias estén instaladas:

```bash
npm install @heroicons/react @headlessui/react react-router-dom
```

### 2. Configurar las Rutas

Modifica el archivo `src/routes/index.tsx` para incluir las nuevas rutas de AIDUX:

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AiduxLayout } from '../components/layout/AiduxLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import NotFound from '../components/common/NotFound';

// Importaciones con lazy loading
const PatientDashboard = lazy(() => import('../components/patients/PatientDashboard'));
const ConsultationPage = lazy(() => import('../components/consultations/ConsultationPage'));
const SchedulePage = lazy(() => import('../components/schedule/SchedulePage'));
const AnalyticsPage = lazy(() => import('../components/analytics/AnalyticsPage'));
const SettingsPage = lazy(() => import('../components/settings/SettingsPage'));

// Configuración de rutas
const router = createBrowserRouter([
  {
    path: '/',
    element: <AiduxLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PatientDashboard />
          </Suspense>
        ),
      },
      {
        path: 'pacientes',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PatientDashboard />
          </Suspense>
        ),
      },
      {
        path: 'consultas',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ConsultationPage />
          </Suspense>
        ),
      },
      {
        path: 'agenda',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <SchedulePage />
          </Suspense>
        ),
      },
      {
        path: 'analisis',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AnalyticsPage />
          </Suspense>
        ),
      },
      {
        path: 'configuracion',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <SettingsPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
```

### 3. Configurar Tailwind CSS

Actualiza el archivo `tailwind.config.cjs` para incluir los colores personalizados de AIDUX:

```js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
```

### 4. Implementar el Contexto para el Asistente Clínico

Crea un nuevo archivo `src/contexts/ClinicalAssistantContext.tsx`:

```tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface ClinicalAssistantContextType {
  activateAssistant: () => void;
  deactivateAssistant: () => void;
  isActive: boolean;
  currentPatientId: string | null;
  setCurrentPatientId: (id: string | null) => void;
}

const ClinicalAssistantContext = createContext<ClinicalAssistantContextType | undefined>(undefined);

export function ClinicalAssistantProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(true);
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);

  const activateAssistant = () => setIsActive(true);
  const deactivateAssistant = () => setIsActive(false);

  return (
    <ClinicalAssistantContext.Provider
      value={{
        activateAssistant,
        deactivateAssistant,
        isActive,
        currentPatientId,
        setCurrentPatientId,
      }}
    >
      {children}
    </ClinicalAssistantContext.Provider>
  );
}

export function useClinicalAssistant() {
  const context = useContext(ClinicalAssistantContext);
  if (context === undefined) {
    throw new Error('useClinicalAssistant debe usarse dentro de un ClinicalAssistantProvider');
  }
  return context;
}
```

### 5. Modificar el Punto de Entrada de la Aplicación

Actualiza el archivo `src/main.tsx` para incluir los proveedores necesarios:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from './routes';
import { ClinicalAssistantProvider } from './contexts/ClinicalAssistantContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClinicalAssistantProvider>
      <AppRouter />
    </ClinicalAssistantProvider>
  </React.StrictMode>
);
```

## Características Pendientes de Implementar

Para una implementación completa del sistema AIDUX, se deben desarrollar los siguientes componentes adicionales:

1. **Módulo de Consultas**:
   - Formulario de consulta inteligente
   - Plantillas adaptables
   - Documentación asistida

2. **Módulo de Fisioterapia**:
   - Evaluación física estructurada
   - Registro visual de evolución
   - Biblioteca de ejercicios con instrucciones

3. **Panel de Análisis**:
   - Visualización de tendencias
   - Análisis predictivo
   - Métricas de resultados clínicos

4. **Integración con APIs Externas**:
   - Conexión con bases de datos de medicamentos
   - Integración con sistemas de laboratorio
   - Compatibilidad con dispositivos médicos

## Mejores Prácticas para Desarrollo Futuro

1. **Priorizar la Experiencia del Usuario**:
   - Cada nueva funcionalidad debe evaluarse en términos de carga cognitiva
   - Realizar pruebas de usabilidad con profesionales clínicos
   - Mantener la interfaz limpia y minimalista

2. **Desarrollo del Asistente IA**:
   - Ampliar la base de conocimiento con guías clínicas actualizadas
   - Mejorar la precisión de las sugerencias contextuales
   - Implementar análisis de patrones en datos clínicos

3. **Seguridad y Cumplimiento**:
   - Desarrollar con el principio de privacidad por diseño
   - Implementar auditorías detalladas de acceso a datos
   - Mantener conformidad con normativas de salud (HIPAA, PIPEDA)

## Conclusión

La integración de AIDUX EMR representa un cambio de paradigma en cómo los profesionales clínicos interactúan con los sistemas EMR. Al centrarnos en reducir la carga cognitiva y proporcionar asistencia contextual inteligente, liberamos tiempo que puede dedicarse a lo que realmente importa: la atención al paciente. 