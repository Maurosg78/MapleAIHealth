import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from './routes';

// Componente que provee el enrutador a la aplicación
const AppRouter = () => {
  const router = createBrowserRouter(routes);
  return <RouterProvider router={router} />;
};

export default AppRouter; 