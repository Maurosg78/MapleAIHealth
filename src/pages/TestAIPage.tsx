import React, { useState } from 'react';
import { useAIQuery } from '../hooks/useAIQuery';
import ResponseFeedback from '../components/ai/ResponseFeedback';
import { AIResponse } from '../services/ai';

const TestAIPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [patientId, setPatientId] = useState('P12345');
  const { loading, error, result, executeQuery, reset } = useAIQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    await executeQuery({
      query,
      patientId,
      context: {
        type: 'general',
        data: {}
      }
    });
  };

  const handleFeedback = (feedback: { helpful: boolean; comments: string }) => {
    console.log('Feedback recibido:', feedback);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Prueba del Servicio de IA</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="patientId" className="block text-sm font-medium mb-1">ID del Paciente</label>
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

        <div className="mb-4">
          <label htmlFor="queryText" className="block text-sm font-medium mb-1">Consulta Médica</label>
          <textarea
            id="queryText"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Escribe tu consulta médica aquí..."
            aria-label="Consulta Médica"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >
            {loading ? 'Procesando...' : 'Enviar Consulta'}
          </button>

          {result && (
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 border rounded"
            >
              Nueva Consulta
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
          <h2 className="text-xl font-medium mb-4">Respuesta</h2>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Resumen</h3>
            <p className="text-gray-700">{result.summary}</p>
          </div>

          {result.insights && result.insights.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Insights</h3>
              <ul className="space-y-2">
                {result.insights.map((insight, index) => (
                  <li key={index} className="p-2 bg-blue-50 rounded">
                    <p className="font-medium">{insight.title}</p>
                    <p className="text-sm">{insight.description}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      insight.severity === 'high' ? 'bg-red-100 text-red-700' :
                      insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {insight.severity}
                    </span>
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
                  <li key={index} className="p-2 bg-green-50 rounded">
                    <p className="font-medium">{rec.title}</p>
                    <p className="text-sm">{rec.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ResponseFeedback
            response={result as AIResponse}
            onFeedbackSubmit={handleFeedback}
          />
        </div>
      )}
    </div>
  );
};

export default TestAIPage;
