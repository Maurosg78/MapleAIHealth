import React, { useState } from 'react';
import { useAIQuery } from '../hooks/useAIQuery';
import { UnstructuredNote } from '../services/ai';
import ResponseFeedback from '../components/ai/ResponseFeedback';

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
      return 'px-2 py-0.5 rounded bg-red-100 text-red-700';
    case 'medium':
      return 'px-2 py-0.5 rounded bg-yellow-100 text-yellow-700';
    case 'low':
      return 'px-2 py-0.5 rounded bg-green-100 text-green-700';
    default:
      return 'px-2 py-0.5 rounded bg-gray-100 text-gray-700';
  }
};

const EMRPage: React.FC = () => {
  const [patientId, setPatientId] = useState('P12345');
  const [notes, setNotes] = useState<UnstructuredNote[]>([
    {
      id: 'note-1',
      date: new Date().toISOString().split('T')[0],
      provider: 'Dr. García',
      content: 'Paciente masculino de 45 años acude por dolor en región lumbar de 2 semanas de evolución. Refiere que empeora con el movimiento y mejora parcialmente con antiinflamatorios.',
      type: 'progress'
    }
  ]);
  const [noteContent, setNoteContent] = useState('');
  const [provider, setProvider] = useState('Dr. García');
  const { loading, error, result, analyzeNotes, reset } = useAIQuery();

  const handleAddNote = () => {
    if (!noteContent.trim()) return;

    const newNote: UnstructuredNote = {
      id: `note-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      provider,
      content: noteContent,
      type: 'progress'
    };

    setNotes([...notes, newNote]);
    setNoteContent('');
  };

  const handleAnalyze = async () => {
    if (notes.length === 0) return;
    await analyzeNotes(patientId, notes);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Historial Médico Electrónico</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1 bg-white p-5 rounded-md shadow-sm border">
          <h2 className="text-lg font-medium mb-4">Información del Paciente</h2>

          <div className="mb-4">
            <label htmlFor="patientIdInput" className="block text-sm font-medium mb-1">ID del Paciente</label>
            <input
              id="patientIdInput"
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="ID del paciente"
              aria-label="ID del Paciente"
            />
          </div>

          <div className="py-2 border-t border-b">
            <h3 className="font-medium text-sm mb-2">Datos Demográficos</h3>
            <p className="text-sm">Nombre: Juan Ejemplo</p>
            <p className="text-sm">Edad: 45 años</p>
            <p className="text-sm">Género: Masculino</p>
          </div>

          <div className="py-2 border-b">
            <h3 className="font-medium text-sm mb-2">Condiciones</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>Hipertensión</li>
              <li>Diabetes tipo 2</li>
              <li>Obesidad</li>
            </ul>
          </div>

          <div className="py-2">
            <h3 className="font-medium text-sm mb-2">Medicaciones</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>Metformina 850mg BID</li>
              <li>Lisinopril 10mg QD</li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-5 rounded-md shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Notas Médicas</h2>
            <button
              onClick={handleAnalyze}
              disabled={notes.length === 0 || loading}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:bg-gray-400"
            >
              {loading ? 'Analizando...' : 'Analizar con IA'}
            </button>
          </div>

          <div className="mb-6 max-h-60 overflow-y-auto border rounded p-3">
            {notes.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No hay notas disponibles</p>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{note.provider}</span>
                      <span className="text-gray-600">{note.date}</span>
                    </div>
                    <p className="mt-1 text-sm">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium text-sm mb-2">Agregar Nota</h3>

            <div className="mb-3">
              <label htmlFor="providerInput" className="block text-sm mb-1">Proveedor</label>
              <input
                id="providerInput"
                type="text"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Nombre del médico"
                aria-label="Nombre del proveedor"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="noteContentInput" className="block text-sm mb-1">Contenido</label>
              <textarea
                id="noteContentInput"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full p-2 border rounded"
                rows={4}
                placeholder="Escribe la nota médica aquí..."
                aria-label="Contenido de la nota"
              />
            </div>

            <button
              onClick={handleAddNote}
              disabled={!noteContent.trim()}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm disabled:bg-gray-400"
            >
              Agregar Nota
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-6">
          <p className="text-red-600">{error.message}</p>
        </div>
      )}

      {result && (
        <div className="bg-white p-5 rounded-md shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Análisis de IA</h2>
            <button
              onClick={reset}
              className="px-3 py-1 border rounded text-sm"
            >
              Cerrar
            </button>
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Resumen</h3>
            <p className="text-gray-700">{result.summary}</p>
          </div>

          {result.timeline && result.timeline.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Línea de Tiempo</h3>
              <div className="relative border-l-2 border-blue-200 ml-4 pl-4">
                {result.timeline.map((event, index) => (
                  <div key={`timeline-${event.date}-${index}`} className="mb-3 relative">
                    <div className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-blue-500"></div>
                    <p className="text-sm text-gray-500">{event.date}</p>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.insights && result.insights.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.insights.map((insight, index) => (
                  <div key={`insight-${insight.title}-${index}`} className="p-3 bg-blue-50 rounded">
                    <p className="font-medium">{insight.title}</p>
                    <p className="text-sm mb-1">{insight.description}</p>
                    <span className={getSeverityClassName(insight.severity)}>
                      {insight.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.recommendations && result.recommendations.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Recomendaciones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.recommendations.map((rec, index) => (
                  <div key={`recommendation-${rec.title}-${index}`} className="p-3 bg-green-50 rounded">
                    <p className="font-medium">{rec.title}</p>
                    <p className="text-sm mb-1">{rec.description}</p>
                    <div className="flex justify-between text-xs">
                      <span className={getPriorityClassName(rec.priority)}>
                        {rec.priority}
                      </span>
                      {rec.timeframe && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded">
                          {rec.timeframe}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ResponseFeedback
            response={result}
            onFeedbackSubmit={(feedback) => console.log('Feedback EMR:', feedback)}
          />
        </div>
      )}
    </div>
  );
};

export default EMRPage;
