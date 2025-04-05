import * as React from 'react';
import { useMemo, memo } from 'react';

interface AnalysisItem {
  id: string;
  type: 'diagnosis' | 'treatment' | 'medication' | 'test' | 'observation';
  title: string;
  description: string;
  confidence: number;
  sources?: {
    id: string;
    title: string;
    url?: string;
  }[];
  relatedTerms?: string[];
  timestamp: string;
}

interface AnalysisResultsProps {
  results: AnalysisItem[];
  isLoading?: boolean;
  onItemClick?: (item: AnalysisItem) => void;
  className?: string;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = memo(({
  results,
  isLoading = false,
  onItemClick,
  className = '',
}) => {
  // Agrupar resultados por tipo
  const groupedResults = useMemo(() => {
    return results.reduce<Record<string, AnalysisItem[]>>((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {});
  }, [results]);

  // Traducir tipos de análisis
  const getTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      diagnosis: 'Diagnósticos',
      treatment: 'Tratamientos',
      medication: 'Medicamentos',
      test: 'Pruebas',
      observation: 'Observaciones'
    };
    return typeMap[type] || type;
  };

  // Formatear nivel de confianza
  const getConfidenceLabel = (confidence: number): { text: string; color: string } => {
    if (confidence >= 0.9) {
      return { text: 'Alta', color: 'text-green-600' };
    } else if (confidence >= 0.7) {
      return { text: 'Media', color: 'text-yellow-600' };
    } else {
      return { text: 'Baja', color: 'text-red-600' };
    }
  };

  // Renderizar icono según el tipo
  const renderIcon = (type: string) => {
    switch (type) {
      case 'diagnosis':
        return <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      case 'treatment':
        return <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
      case 'medication':
        return <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
      case 'test':
        return <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
      default:
        return <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    null
  );
  }

  if (results.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 text-center ${className}`}>
        <p className="text-gray-500">No hay resultados de análisis disponibles</p>
      </div>
    null
  );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium">Resultados del análisis</h3>
        <p className="text-sm text-gray-500">Basado en la información proporcionada</p>
      </div>

      <div className="divide-y divide-gray-200">
        {Object.entries(groupedResults).map(([type, items]) => (
          <div key={type} className="p-4">
            <h4 className="font-medium mb-3 flex items-center">
              {renderIcon(type)}
              <span className="ml-2">{getTypeLabel(type)}</span>
              <span className="ml-auto text-sm text-gray-500">{items.length}</span>
            </h4>

            <ul className="space-y-3">
              {items.map((item) => {
                const confidence = getConfidenceLabel(item.confidence);

                return (
                  <li
                    key={item.id}
                    className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => onItemClick && onItemClick(item)}
                  >
                    <div className="flex justify-between items-start">
                      <h5 className="font-medium">{item.title}</h5>
                      <span className={`text-xs font-medium ${confidence.color}`}>
                        Confianza: {confidence.text} ({Math.round(item.confidence * 100)}%)
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>

                    {item.relatedTerms && item.relatedTerms.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.relatedTerms.map((term, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {term}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.sources && item.sources.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        <span>Fuentes: {item.sources.length}</span>
                      </div>
                    )}
                  </li>
    null
  );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
    null
  );
});

AnalysisResults.displayName = 'AnalysisResults';

export default AnalysisResults;
