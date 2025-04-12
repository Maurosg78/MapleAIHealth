import React, { useState } from 'react';
import { ShieldCheckIcon, ExclamationCircleIcon, DocumentDownloadIcon } from '@heroicons/react/solid';
import { VerificationResponse } from '../services/ClinicalBlindSpotService';

interface LegalProtectionPanelProps {
  verificationResult: VerificationResponse;
  onAddRecommendedFields: (fields: string[]) => void;
  onGenerateDocumentation: () => void;
}

/**
 * Componente que muestra los puntos ciegos identificados y el nivel de protección legal
 * 
 * ADVERTENCIA DE SEGURIDAD MÉDICA - PRIORIDAD ALTA
 * Este componente NO sugiere diagnósticos o tratamientos.
 * Solo identifica posibles puntos débiles en la documentación clínica
 * para mejorar la calidad de la atención y la protección legal del profesional.
 */
export const LegalProtectionPanel: React.FC<LegalProtectionPanelProps> = ({
  verificationResult,
  onAddRecommendedFields,
  onGenerateDocumentation
}) => {
  const [expandedBlindSpot, setExpandedBlindSpot] = useState<string | null>(null);
  
  const getScoreColorClass = (score: number): string => {
    if (score >= 90) return 'text-green-700 bg-green-100';
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 65) return 'text-yellow-600 bg-yellow-50';
    if (score >= 50) return 'text-orange-600 bg-orange-50';
    return 'text-red-700 bg-red-100';
  };
  
  const getCategoryIcon = (category: string): React.ReactNode => {
    switch (category) {
      case 'anamnesis':
        return <span className="text-blue-500">📋</span>;
      case 'examen_fisico':
        return <span className="text-purple-500">🔍</span>;
      case 'diagnostico':
        return <span className="text-orange-500">🔬</span>;
      case 'tratamiento':
        return <span className="text-green-500">💊</span>;
      case 'seguimiento':
        return <span className="text-indigo-500">📆</span>;
      default:
        return <span className="text-gray-500">❓</span>;
    }
  };
  
  const toggleBlindSpot = (id: string) => {
    if (expandedBlindSpot === id) {
      setExpandedBlindSpot(null);
    } else {
      setExpandedBlindSpot(id);
    }
  };
  
  const handleAddRecommendedFields = () => {
    onAddRecommendedFields([
      ...verificationResult.requiredFields,
      ...verificationResult.recommendedFields
    ]);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Protección Legal y Puntos Ciegos Clínicos
          </h2>
          <div className="flex items-center">
            <button
              type="button"
              onClick={onGenerateDocumentation}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <DocumentDownloadIcon className="mr-1.5 h-4 w-4 text-gray-500" />
              Generar documentación
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <ShieldCheckIcon className="h-10 w-10 text-gray-400 mr-3" />
          <div>
            <div 
              className={`px-2.5 py-0.5 inline-flex text-sm font-medium rounded-full ${getScoreColorClass(verificationResult.legalProtectionScore)}`}
            >
              Protección legal: {verificationResult.legalProtectionScore}/100
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {verificationResult.legalProtectionSummary}
            </p>
          </div>
        </div>
      </div>
      
      {verificationResult.blindSpots.length > 0 && (
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Puntos ciegos identificados ({verificationResult.blindSpots.length})
          </h3>
          <ul className="space-y-3">
            {verificationResult.blindSpots.map((blindSpot) => (
              <li key={blindSpot.id} className="bg-gray-50 rounded-md p-3">
                <div 
                  className="flex items-start cursor-pointer"
                  onClick={() => toggleBlindSpot(blindSpot.id)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getCategoryIcon(blindSpot.category)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {blindSpot.description}
                      </p>
                      <div 
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          blindSpot.importance === 'alta' ? 'bg-red-100 text-red-800' :
                          blindSpot.importance === 'media' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {blindSpot.importance === 'alta' ? 'ALTA' :
                         blindSpot.importance === 'media' ? 'MEDIA' : 'BAJA'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {expandedBlindSpot === blindSpot.id && (
                  <div className="mt-3 pl-7 text-xs text-gray-600 border-t border-gray-200 pt-2">
                    {blindSpot.clinicalEvidence && (
                      <div className="mb-2">
                        <p className="font-semibold mb-1">Evidencia clínica:</p>
                        <p>{blindSpot.clinicalEvidence.recommendation}</p>
                        <p className="mt-1">
                          <span className="font-medium">Fuente:</span> {blindSpot.clinicalEvidence.guidelineSource}
                          <span className="ml-2 font-medium">Nivel de evidencia:</span> {blindSpot.clinicalEvidence.evidenceLevel}
                        </p>
                      </div>
                    )}
                    <p className="font-semibold mb-1">Implicación legal:</p>
                    <p>{blindSpot.legalImplication}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {(verificationResult.requiredFields.length > 0 || verificationResult.recommendedFields.length > 0) && (
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              Información faltante o recomendada
            </h3>
            <button
              type="button"
              onClick={handleAddRecommendedFields}
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Añadir campos
            </button>
          </div>
          
          {verificationResult.requiredFields.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-red-800 mb-1">
                Campos obligatorios:
              </p>
              <ul className="ml-5 list-disc text-xs text-gray-600 space-y-1">
                {verificationResult.requiredFields.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
            </div>
          )}
          
          {verificationResult.recommendedFields.length > 0 && (
            <div>
              <p className="text-xs font-medium text-blue-800 mb-1">
                Campos recomendados:
              </p>
              <ul className="ml-5 list-disc text-xs text-gray-600 space-y-1">
                {verificationResult.recommendedFields.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-blue-50 px-4 py-3">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
          </div>
          <div className="ml-3 flex-1 md:flex md:justify-between">
            <p className="text-xs text-blue-700">
              Este análisis se basa en guías clínicas y estándares legales actualizados, pero no sustituye el criterio profesional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 