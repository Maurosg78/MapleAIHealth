
export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Página no encontrada
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Lo sentimos, la página que estás buscando no existe.
        </p>
        <Button onClick={() => navigate('/')}>Volver al inicio</Button>
      </div>
    </div>
  );
};
