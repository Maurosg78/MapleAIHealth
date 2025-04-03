import React, { useState, useEffect } from 'react';
import { useEMRAI } from '../hooks/useEMRAI';
import { EMRSystem } from '../services/emr';
import { emrConfigService } from '../services/emr';
import ResponseFeedback from '../components/ai/ResponseFeedback';
import { AIResponse } from '../services/ai';

// Función de utilidad para obtener las clases CSS según la severidad
const getSeverityClassName = (severity: 'high' | 'medium' | 'low'): string => {
  switch (severity) {
    case 'high':
      return 'text-xs px-2 py-0.5 rounded bg-red-100 text-red-700';
    case 'medium':
      return 'text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700';
    case 'low':
      return 'text-xs px-2 py-0.5 rounded bg-green-100 text-green-700';
    default:
      return 'text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700';
  }
};

// Función de utilidad para obtener las clases CSS según la prioridad
const getPriorityClassName = (priority: 'high' | 'medium' | 'low'): string => {
  switch (priority) {
    case 'high':
      return 'text-xs px-2 py-0.5 rounded bg-red-100 text-red-700';
    case 'medium':
      return 'text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700';
    case 'low':
      return 'text-xs px-2 py-0.5 rounded bg-green-100 text-green-700';
    default:
      return 'text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700';
  }
};

const EMRAIPage: React.FC = () => {
  // Estado para el ID del paciente y sistema EMR
  const [patientId, setPatientId] = useState('P12345');
  const [emrSystem, setEmrSystem] = useState<EMRSystem>('Generic');
  const [availableSystems, setAvailableSystems] = useState<EMRSystem[]>([]);
  const [query, setQuery] = useState('');
  const [analysisType, setAnalysisType] = useState<'notes' | 'complete' | 'custom'>('notes');

  // Hook de integración EMR-AI
  const {
    loading,
    error,
    result,
    analyzePatientNotes,
    getCompleteAnalysis,
    executeCustomPatientQuery,
    reset
  } = useEMRAI();

  // Cargar sistemas EMR disponibles
  useEffect(() => {
    setAvailableSystems(emrConfigService.getConfiguredSystems());
  }, []);

  // Manejar cambio de sistema EMR
  const handleSystemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSystem = e.target.value as EMRSystem;
    setEmrSystem(selectedSystem);
    emrConfigService.setCurrentSystem(selectedSystem);
  };

  // Manejar envío de formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientId.trim()) return;

    switch (analysisType) {
      case 'notes':
        await analyzePatientNotes(patientId, emrSystem);
        break;
      case 'complete':
        await getCompleteAnalysis(patientId, emrSystem);
        break;
      case 'custom':
        if (!query.trim()) return;
        await executeCustomPatientQuery(patientId, query, true, emrSystem);
        break;
    }
  };

  // Manejar retroalimentación de la respuesta
  const handleFeedback = (feedback: { helpful: boolean; comments: string }) => {
    console.log('Feedback recibido:', feedback);
    // Aquí podríamos enviar esta retroalimentación a un servicio
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Integración EMR-IA</h1>
      <p className="mb-6 text-gray-600">
        Esta página demuestra la integración entre sistemas EMR (Registro Médico Electrónico)
        y servicios de IA para análisis médico.
      </p>

      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="patientId" className="block text-sm font-medium mb-1">
              ID del Paciente
            </label>
            <input
              id="patientId"
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Ingresa el ID del paciente"
              aria-label="ID del Paciente"
            />
          </div>

          <div>
            <label htmlFor="emrSystem" className="block text-sm font-medium mb-1">
              Sistema EMR
            </label>
            <select
              id="emrSystem"
              value={emrSystem}
              onChange={handleSystemChange}
              className="w-full p-2 border rounded"
              aria-label="Sistema EMR"
            >
              {availableSystems.map((system) => (
                <option key={system} value={system}>
                  {system}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Tipo de Análisis</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="notes"
                checked={analysisType === 'notes'}
                onChange={() => setAnalysisType('notes')}
                className="form-radio"
              />
              <span className="ml-2">Analizar Notas</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="radio"
                value="complete"
                checked={analysisType === 'complete'}
                onChange={() => setAnalysisType('complete')}
                className="form-radio"
              />
              <span className="ml-2">Análisis Completo</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="radio"
                value="custom"
                checked={analysisType === 'custom'}
                onChange={() => setAnalysisType('custom')}
                className="form-radio"
              />
              <span className="ml-2">Consulta Personalizada</span>
            </label>
          </div>
        </div>

        {analysisType === 'custom' && (
          <div className="mb-4">
            <label htmlFor="queryText" className="block text-sm font-medium mb-1">
              Consulta Personalizada
            </label>
            <textarea
              id="queryText"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Escribe tu consulta médica específica aquí..."
              aria-label="Consulta Personalizada"
            />
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !patientId.trim() || (analysisType === 'custom' && !query.trim())}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >
            {loading ? 'Procesando...' : 'Analizar Datos'}
          </button>

          {result && (
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 border rounded"
            >
              Nuevo Análisis
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-6">
          <p className="text-red-600">{error.message}</p>
        </div>
      )}

      {result && (
        <div className="border rounded-md p-6 bg-white shadow-sm">
          <h2 className="text-xl font-medium mb-4">Resultado del Análisis</h2>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Resumen</h3>
            <p className="text-gray-700">{result.summary}</p>
          </div>

          {result.insights && result.insights.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Insights</h3>
              <ul className="space-y-2">
                {result.insights.map((insight, index) => (
                  <li key={`insight-${insight.title}-${index}`} className="p-3 bg-blue-50 rounded">
                    <p className="font-medium">{insight.title}</p>
                    <p className="text-sm">{insight.description}</p>
                    <div className="flex items-center mt-2">
                      <span className={getSeverityClassName(insight.severity)}>
                        {insight.severity}
                      </span>
                      {insight.type && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 rounded">
                          {insight.type}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.recommendations && result.recommendations.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Recomendaciones</h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={`recommendation-${rec.title}-${index}`} className="p-3 bg-green-50 rounded">
                    <p className="font-medium">{rec.title}</p>
                    <p className="text-sm">{rec.description}</p>
                    <div className="flex items-center mt-2">
                      <span className={getPriorityClassName(rec.priority)}>
                        {rec.priority}
                      </span>
                      {rec.timeframe && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                          {rec.timeframe}
                        </span>
                      )}
                      {rec.type && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 rounded">
                          {rec.type}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.timeline && result.timeline.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Línea de Tiempo</h3>
              <div className="border-l-2 border-blue-300 pl-4 py-2 space-y-4">
                {result.timeline.map((event, index) => (
                  <div key={`timeline-${event.date}-${event.title}-${index}`} className="relative">
                    <div className="absolute -left-6 w-4 h-4 rounded-full bg-blue-500"></div>
                    <p className="text-sm text-gray-500">{event.date}</p>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm">{event.description}</p>
                    {event.category && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                        {event.category}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.followUpQuestions && result.followUpQuestions.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Preguntas de Seguimiento</h3>
              <ul className="list-disc pl-5 space-y-1">
                {result.followUpQuestions.map((question, index) => (
                  <li key={`question-${index}`} className="text-blue-600 hover:underline cursor-pointer">
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <ResponseFeedback
              response={result as AIResponse}
              onFeedbackSubmit={handleFeedback}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EMRAIPage;
