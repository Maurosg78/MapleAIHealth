import React, { useState, useEffect } from 'react';
import { cacheService, cachePrioritizationService, PrioritizationStrategy } from '../../services/ai';

interface CacheStats {
  totalItems: number;
  activeItems: number;
  expiredItems: number;
  categoryCounts: Record<string, number>;
  uptime: number;
  maxCacheSize: number;
  usagePercentage: number;
  prioritizationStats: {
    totalTrackedItems: number;
    avgAccessCount: number;
    avgHitRate: number;
    avgProcessingTime: number;
    totalEstimatedCostSaved: number;
    strategy: PrioritizationStrategy;
  }
}

interface CachePrioritizationSettings {
  strategy: PrioritizationStrategy;
  weights: {
    contentType: number;
    queryComplexity: number;
    accessFrequency: number;
    recency: number;
    criticalContext: number;
  };
  evictionPercentage: number;
}

/**
 * Panel de control para el servicio de caché de IA
 */
const CacheControlPanel: React.FC = () => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<CachePrioritizationSettings>({
    strategy: 'hybrid',
    weights: {
      contentType: 30,
      queryComplexity: 20,
      accessFrequency: 15,
      recency: 15,
      criticalContext: 20
    },
    evictionPercentage: 20,
  });

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      setLoading(true);
      const cacheStats = await cacheService.getStats();
      setStats(cacheStats as CacheStats);
      setError(null);
    } catch (err) {
      setError('Error al cargar estadísticas del caché');
      console.error('Error loading cache stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Limpiar caché
  const handleClearCache = async () => {
    try {
      await cacheService.clear();
      await loadStats();
    } catch (err) {
      setError('Error al limpiar el caché');
      console.error('Error clearing cache:', err);
    }
  };

  // Actualizar configuración
  const handleUpdateSettings = () => {
    try {
      cachePrioritizationService.updateConfig(settings);
      setError(null);
      loadStats();
    } catch (err) {
      setError('Error al actualizar la configuración');
      console.error('Error updating settings:', err);
    }
  };

  // Manejar cambios en los campos de configuración
  const handleStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({
      ...settings,
      strategy: e.target.value as PrioritizationStrategy
    });
  };

  const handleWeightChange = (field: string, value: number) => {
    setSettings({
      ...settings,
      weights: {
        ...settings.weights,
        [field]: value
      }
    });
  };

  const handleEvictionChange = (value: number) => {
    setSettings({
      ...settings,
      evictionPercentage: value
    });
  };

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    loadStats();
    // Actualizar estadísticas cada 30 segundos
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg shadow-inner text-center">
        <p className="text-gray-600">Cargando estadísticas del caché...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 rounded-lg border border-red-300 text-red-800 mb-4">
        <p className="font-medium">{error}</p>
        <button
          onClick={loadStats}
          className="mt-2 px-3 py-1 bg-red-200 rounded-md hover:bg-red-300"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Panel de Control de Caché</h2>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800">Estado del Caché</h3>
          <div className="mt-2">
            <p>Elementos totales: <span className="font-medium">{stats?.totalItems}</span></p>
            <p>Elementos activos: <span className="font-medium">{stats?.activeItems}</span></p>
            <p>Uso: <span className="font-medium">{stats?.usagePercentage.toFixed(1)}%</span></p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${stats?.usagePercentage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800">Rendimiento</h3>
          <div className="mt-2">
            <p>Tasa de aciertos: <span className="font-medium">{(stats?.prioritizationStats.avgHitRate * 100).toFixed(1)}%</span></p>
            <p>Tiempo promedio: <span className="font-medium">{stats?.prioritizationStats.avgProcessingTime.toFixed(0)} ms</span></p>
            <p>Costo estimado ahorrado: <span className="font-medium">${stats?.prioritizationStats.totalEstimatedCostSaved.toFixed(2)}</span></p>
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800">Distribución</h3>
          <div className="mt-2">
            <p>Elementos rastreados: <span className="font-medium">{stats?.prioritizationStats.totalTrackedItems}</span></p>
            <p>Estrategia actual: <span className="font-medium">{stats?.prioritizationStats.strategy}</span></p>
            <p>Tiempo activo: <span className="font-medium">{stats?.uptime} minutos</span></p>
          </div>
        </div>
      </div>

      {/* Distribución por categorías */}
      {stats?.categoryCounts && Object.keys(stats.categoryCounts).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Distribución por Categoría</h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(stats.categoryCounts).map(([category, count]) => (
                <div key={category} className="flex justify-between">
                  <span className="text-gray-700">{category}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Opciones de control */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configuración */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-3">Configuración de Priorización</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estrategia de Priorización
            </label>
            <select
              value={settings.strategy}
              onChange={handleStrategyChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="hybrid">Híbrida (Combinada)</option>
              <option value="medical-content">Contenido Médico</option>
              <option value="critical-queries">Consultas Críticas</option>
              <option value="resource-intensive">Intensidad de Recursos</option>
              <option value="recency-based">Basada en Recencia</option>
              <option value="access-frequency">Frecuencia de Acceso</option>
            </select>
          </div>

          {settings.strategy === 'hybrid' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pesos de la Estrategia Híbrida
              </label>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Contenido Médico</span>
                    <span>{settings.weights.contentType}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.weights.contentType}
                    onChange={(e) => handleWeightChange('contentType', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Complejidad de Consulta</span>
                    <span>{settings.weights.queryComplexity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.weights.queryComplexity}
                    onChange={(e) => handleWeightChange('queryComplexity', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Frecuencia de Acceso</span>
                    <span>{settings.weights.accessFrequency}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.weights.accessFrequency}
                    onChange={(e) => handleWeightChange('accessFrequency', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Recencia</span>
                    <span>{settings.weights.recency}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.weights.recency}
                    onChange={(e) => handleWeightChange('recency', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Contexto Crítico</span>
                    <span>{settings.weights.criticalContext}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.weights.criticalContext}
                    onChange={(e) => handleWeightChange('criticalContext', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Porcentaje de Eliminación
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="10"
                max="50"
                value={settings.evictionPercentage}
                onChange={(e) => handleEvictionChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium w-12">{settings.evictionPercentage}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Porcentaje del caché a limpiar cuando está lleno
            </p>
          </div>

          <button
            onClick={handleUpdateSettings}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Actualizar Configuración
          </button>
        </div>

        {/* Acciones */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-3">Acciones</h3>

          <div className="space-y-4">
            <div>
              <button
                onClick={loadStats}
                className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                Actualizar Estadísticas
              </button>
            </div>

            <div>
              <button
                onClick={handleClearCache}
                className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              >
                Limpiar Caché
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Esto eliminará todos los elementos del caché
              </p>
            </div>
          </div>

          <div className="mt-6 p-3 bg-yellow-50 rounded-md border border-yellow-200">
            <h4 className="text-sm font-semibold text-yellow-800 mb-1">Recomendaciones</h4>
            <ul className="text-xs text-yellow-700 space-y-1 list-disc pl-4">
              <li>Usa la estrategia híbrida para un mejor rendimiento general</li>
              <li>Para contenido médico crítico, aumenta el peso de contenido médico</li>
              <li>Para optimizar costos, aumenta el peso de intensidad de recursos</li>
              <li>Mantén la tasa de eliminación entre 15-25% para un rendimiento óptimo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CacheControlPanel;
