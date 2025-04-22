import React, { useState } from 'react';
import { CacheMonitor } from '../../components/CacheMonitor';
import { CacheConfig } from '../../services/cache/types';
import { CacheManagerFactory } from '../../services/cache';

/**
 * Página de administración del sistema de caché
 */
const CacheManagement: React.FC = () => {
  const [optimizationCount, setOptimizationCount] = useState<number>(0);
  const [lastOptimizedSection, setLastOptimizedSection] = useState<string | null>(null);

  // Manejar la optimización de configuración de caché
  const handleOptimizeCache = (section: string, config: CacheConfig) => {
    try {
      // Obtener el administrador de caché para la sección
      const cacheManager = CacheManagerFactory.getInstance(section);
      
      // Actualizar configuración
      cacheManager.updateConfig(config);
      
      // Actualizar estado
      setOptimizationCount(prev => prev + 1);
      setLastOptimizedSection(section);
      
      console.log(`Caché optimizada para ${section}:`, config);
    } catch (error) {
      console.error(`Error al optimizar caché para ${section}:`, error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Administración de Caché</h1>
        
        {optimizationCount > 0 && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md">
            {optimizationCount} optimización{optimizationCount !== 1 ? 'es' : ''} aplicada{optimizationCount !== 1 ? 's' : ''}
            {lastOptimizedSection && <span className="ml-1">- Última: {lastOptimizedSection}</span>}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <p className="mb-4 text-gray-700">
            Esta página permite monitorear y optimizar el sistema de caché de la aplicación.
            Las optimizaciones sugeridas se basan en métricas de rendimiento y patrones de uso.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Ventajas de un sistema de caché optimizado</h2>
            <ul className="list-disc pl-5 text-sm text-blue-900">
              <li className="mb-1">Mayor velocidad de respuesta en consultas frecuentes</li>
              <li className="mb-1">Reducción en consumo de recursos de red</li>
              <li className="mb-1">Mejor experiencia de usuario con tiempos de carga reducidos</li>
              <li className="mb-1">Menor carga en APIs externas y bases de datos</li>
            </ul>
          </div>
        </div>
        
        {/* Componente de monitoreo de caché */}
        <CacheMonitor
          isAdmin={true}
          onOptimize={handleOptimizeCache}
          refreshInterval={5000}
        />
      </div>
      
      {/* Sección adicional para estadísticas globales */}
      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-semibold">Estadísticas Globales</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Optimizaciones Aplicadas</h3>
              <div className="text-3xl font-bold text-blue-600">{optimizationCount}</div>
              <p className="text-sm text-gray-600 mt-1">
                Total desde la carga de la página
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Última Optimización</h3>
              <div className="text-xl font-semibold text-blue-600">
                {lastOptimizedSection || "Ninguna"}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Sección optimizada recientemente
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Estado General</h3>
              <div className={`text-xl font-semibold ${optimizationCount > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                {optimizationCount > 0 ? 'Optimizado' : 'Pendiente de optimización'}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {optimizationCount > 0 
                  ? 'El sistema ha sido optimizado' 
                  : 'El sistema puede mejorarse'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Documentación */}
      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-semibold">Documentación</h2>
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-medium mb-3">¿Cómo funciona el sistema de caché?</h3>
          
          <p className="mb-4">
            El sistema de caché implementa algoritmos adaptativos que optimizan automáticamente 
            el almacenamiento de datos frecuentemente utilizados. Las principales características son:
          </p>
          
          <ul className="list-disc pl-5 mb-6">
            <li className="mb-2">
              <strong>Algoritmos de evicción:</strong> LRU (Least Recently Used), LFU (Least Frequently Used), 
              y Adaptive que combina frecuencia, recencia y tamaño.
            </li>
            <li className="mb-2">
              <strong>Configuración por sección:</strong> Cada sección de la aplicación tiene parámetros 
              optimizados para su caso de uso.
            </li>
            <li className="mb-2">
              <strong>Auto-optimización:</strong> El sistema analiza patrones de uso y sugiere mejoras.
            </li>
            <li className="mb-2">
              <strong>Invalidación inteligente:</strong> Estrategias de invalidación basadas en dependencias y TTL.
            </li>
          </ul>
          
          <h3 className="text-lg font-medium mb-3">Recomendaciones de Uso</h3>
          
          <p className="mb-2">
            Para obtener el mejor rendimiento del sistema de caché:
          </p>
          
          <ul className="list-disc pl-5">
            <li className="mb-1">Revise periódicamente las recomendaciones de optimización</li>
            <li className="mb-1">Limpie la caché cuando se realicen cambios importantes en la configuración</li>
            <li className="mb-1">Optimice el tamaño de caché para secciones muy utilizadas</li>
            <li className="mb-1">Ajuste los TTL según la frecuencia de actualización de los datos</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CacheManagement; 