
export const useDashboard = () => {




  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);

        setMetrics(data);
      } catch (err) {
        setError('Error al cargar los datos del dashboard');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return { metrics, isLoading, error };
};
