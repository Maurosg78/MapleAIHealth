import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { NotFound } from '../components/common/NotFound';

// Lazy loading de páginas
const DashboardPage = lazy(() =>
    import('../pages/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage }))
);
const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-screen">Cargando...</div>
);

// Configuración de rutas
const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        errorElement: <NotFound />,
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <DashboardPage />
                    </Suspense>
                ),
            },
            {
                path: 'pacientes',
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <div>Lista de Pacientes (próximamente)</div>
                    </Suspense>
                ),
            },
            {
                path: 'configuracion',
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <div>Configuración (próximamente)</div>
                    </Suspense>
                ),
            },
        ],
    },
]);

export function AppRouter() {
    return <RouterProvider router={router} />;
}
