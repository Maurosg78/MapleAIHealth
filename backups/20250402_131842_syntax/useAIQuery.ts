
export const useAIQuery = () => {





  const query = async (query: AIQuery) => {
    try {
      setLoading(true);
      setError(null);

      // Verificar caché primero

      if (cached) {
        setResponse(cached);
        return;
      }

      // Si no está en caché, hacer la consulta

      setResponse(result);

      // Guardar en caché
      await cacheService.set(query.query, result);

      // Guardar en historial si hay usuario autenticado
      if (user) {
        await aiHistoryService.addEntry({
          query,
          response: result,
          timestamp: new Date().toISOString(),
          userId: user.id,
        });
      }
    } catch (err) {
      setError('Error al procesar la consulta');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      await cacheService.clear();
    } catch (err) {
      console.error('Error al limpiar la caché:', err);
    }
  };

  const getCacheStats = () => {
    return cacheService.getStats();
  };

  return {
    query,
    loading,
    error,
    response,
    clearCache,
    getCacheStats,
  };
};
