import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

// Componente que provee el enrutador a la aplicación
const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter; 