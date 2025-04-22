import React, { useState, useEffect } from 'react';
import { CacheManagerFactory } from '../services/cache';
import { CacheAnalytics, CacheMetrics, Recommendation } from '../services/cache/utils/CacheAnalytics';
import { CacheConfig, CacheStats } from '../services/cache/types';

// Propiedades del componente
interface CacheMonitorProps {
  sections?: string[]; // Secciones a monitorear (si no se especifica, se monitoreará todo)
  refreshInterval?: number; // Intervalo de actualización en milisegundos
  onOptimize?: (section: string, config: CacheConfig) => void; // Callback para optimizaciones
  isAdmin?: boolean; // Si el usuario tiene permisos de administrador
}

// Definición de secciones predeterminadas a monitorear
const DEFAULT_SECTIONS = [
  'clinical-dashboard',
  'evidence-charts',
  'evidence-comparison',
  'evidence-search',
  'evidence-tables',
  'evidence-visualizer',
  'search-results'
];

/**
 * Componente para monitorear y administrar el sistema de caché
 */
export const CacheMonitor: React.FC<CacheMonitorProps> = ({
  sections = DEFAULT_SECTIONS,
  refreshInterval = 10000, // 10 segundos por defecto
  onOptimize,
  isAdmin = false
}) => {
  // Estado para métricas de caché por sección
  const [metrics, setMetrics] = useState<Map<string, CacheMetrics>>(new Map());
  
  // Estado para configuraciones de caché por sección
  const [configs, setConfigs] = useState<Map<string, CacheConfig>>(new Map());
  
  // Estado para sección seleccionada
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  
  // Estado para modo de visualización (básico o avanzado)
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);
  
  // Obtener instancia de CacheAnalytics
  const cacheAnalytics = CacheAnalytics.getInstance();
  
  // Cargar datos de caché
  useEffect(() => {
    const loadCacheData = () => {
      const newMetrics = new Map<string, CacheMetrics>();
      const newConfigs = new Map<string, CacheConfig>();
      
      sections.forEach(section => {
        try {
          // Obtener instancia de caché para la sección
          const cacheManager = CacheManagerFactory.getInstance(section);
          
          // Obtener estadísticas y configuración
          const stats: CacheStats = cacheManager.getStats();
          const config: CacheConfig = cacheManager.config;
          
          // Analizar métricas
          const sectionMetrics = cacheAnalytics.analyzeCache(section, stats, config);
          
          // Guardar datos
          newMetrics.set(section, sectionMetrics);
          newConfigs.set(section, config);
        } catch (error) {
          console.error(`Error al cargar datos de caché para ${section}:`, error);
        }
      });
      
      setMetrics(newMetrics);
      setConfigs(newConfigs);
    };
    
    // Cargar datos iniciales
    loadCacheData();
    
    // Configurar intervalo de actualización
    const intervalId = setInterval(loadCacheData, refreshInterval);
    
    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalId);
  }, [sections, refreshInterval, cacheAnalytics]);
  
  // Renderizar recomendaciones
  const renderRecommendations = (recommendations: Recommendation[]) => {
    if (recommendations.length === 0) {
      return <p className="text-green-600">No hay recomendaciones. El caché funciona de manera óptima.</p>;
    }
    
    return (
      <div className="mt-2">
        <h4 className="font-semibold">Recomendaciones:</h4>
        <ul className="list-disc pl-5 text-sm">
          {recommendations.map((rec, index) => (
            <li key={index} className={`mb-1 ${getImpactColor(rec.impact)}`}>
              {rec.message}
              {rec.currentValue !== undefined && rec.recommendedValue !== undefined && (
                <span className="ml-1">
                  ({rec.currentValue} → {rec.recommendedValue})
                </span>
              )}
              {isAdmin && rec.impact === 'high' && (
                <button
                  className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-xs"
                  onClick={() => handleOptimize(selectedSection!, rec)}
                >
                  Aplicar
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  // Manejar click en optimizar
  const handleOptimize = (section: string, recommendation: Recommendation) => {
    const currentConfig = configs.get(section);
    if (!currentConfig || !onOptimize) return;
    
    const newConfig = { ...currentConfig };
    
    switch (recommendation.type) {
      case 'size':
        if (recommendation.recommendedValue) {
          newConfig.maxSize = recommendation.recommendedValue as number;
        }
        break;
      case 'ttl':
        if (recommendation.recommendedValue) {
          newConfig.ttlMs = recommendation.recommendedValue as number;
        }
        break;
    }
    
    // Actualizar configuración
    onOptimize(section, newConfig);
    
    // Actualizar estado local
    const newConfigs = new Map(configs);
    newConfigs.set(section, newConfig);
    setConfigs(newConfigs);
  };
  
  // Obtener color basado en impacto
  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-amber-600';
      case 'low':
        return 'text-blue-600';
      default:
        return '';
    }
  };
  
  // Limpiar caché de una sección
  const handleClearCache = (section: string) => {
    try {
      const cacheManager = CacheManagerFactory.getInstance(section);
      cacheManager.clear();
      alert(`Caché de ${section} limpiada correctamente.`);
    } catch (error) {
      console.error(`Error al limpiar caché de ${section}:`, error);
      alert(`Error al limpiar caché de ${section}`);
    }
  };
  
  // Renderizar métricas detalladas
  const renderDetailedMetrics = (section: string) => {
    const sectionMetrics = metrics.get(section);
    if (!sectionMetrics) return null;
    
    return (
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-semibold mb-2">{section}</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-medium">Rendimiento</h4>
            <ul className="text-sm space-y-1">
              <li>Hit Ratio: <span className="font-mono">{(sectionMetrics.hitRatio * 100).toFixed(1)}%</span></li>
              <li>Miss Ratio: <span className="font-mono">{(sectionMetrics.missRatio * 100).toFixed(1)}%</span></li>
              <li>Tasa de Evicción: <span className="font-mono">{(sectionMetrics.evictionRate * 100).toFixed(1)}%</span></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium">Uso de Memoria</h4>
            <ul className="text-sm space-y-1">
              <li>Entradas: <span className="font-mono">{sectionMetrics.totalEntries}</span></li>
              <li>Memoria: <span className="font-mono">{sectionMetrics.memoryUsageMB.toFixed(2)} MB</span></li>
              <li>Tamaño Medio: <span className="font-mono">{sectionMetrics.avgEntrySize.toFixed(0)} bytes</span></li>
            </ul>
          </div>
        </div>
        
        {renderRecommendations(sectionMetrics.recommendedOptimizations)}
        
        {isAdmin && (
          <div className="mt-4 flex space-x-2">
            <button
              className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm"
              onClick={() => handleClearCache(section)}
            >
              Limpiar Caché
            </button>
            <button
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
              onClick={() => onOptimize && onOptimize(section, cacheAnalytics.getOptimizedConfig(section, configs.get(section)!))}
            >
              Optimizar Automáticamente
            </button>
          </div>
        )}
      </div>
    );
  };
  
  // Renderizar vista general
  const renderOverview = () => {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Monitor de Caché</h2>
        
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="advanced-mode"
              checked={advancedMode}
              onChange={(e) => setAdvancedMode(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="advanced-mode">Modo Avanzado</label>
          </div>
          
          {isAdmin && (
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
              onClick={() => {
                sections.forEach(section => {
                  const cacheManager = CacheManagerFactory.getInstance(section);
                  cacheManager.clear();
                });
                alert('Todas las cachés han sido limpiadas.');
              }}
            >
              Limpiar Todas
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map(section => (
            <div
              key={section}
              className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedSection(section)}
            >
              <h3 className="font-medium">{section}</h3>
              
              {metrics.has(section) && (
                <div className="mt-2 flex justify-between">
                  <div>
                    <div className="text-sm">Hit Ratio: <span className="font-mono">{(metrics.get(section)!.hitRatio * 100).toFixed(1)}%</span></div>
                    <div className="text-sm">Entradas: <span className="font-mono">{metrics.get(section)!.totalEntries}</span></div>
                  </div>
                  
                  <div>
                    <div className="text-sm">Memoria: <span className="font-mono">{metrics.get(section)!.memoryUsageMB.toFixed(2)} MB</span></div>
                    <div className="text-sm">Optimizaciones: <span className="font-mono">{metrics.get(section)!.recommendedOptimizations.length}</span></div>
                  </div>
                </div>
              )}
              
              {advancedMode && metrics.has(section) && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${metrics.get(section)!.hitRatio * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {selectedSection ? (
        <div>
          <button
            className="mb-4 flex items-center text-blue-600"
            onClick={() => setSelectedSection(null)}
          >
            <span>← Volver</span>
          </button>
          
          {renderDetailedMetrics(selectedSection)}
        </div>
      ) : (
        renderOverview()
      )}
    </div>
  );
}; 