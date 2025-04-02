import React from "react";import {
import { useState, useEffect } from "react";  UnstructuredNote,
  AIResponse,
  aiService,
} from '../services/ai/aiService';

interface NoteWithId extends UnstructuredNote {
  id: string;
}

export const TestAIPage: React.FC = () => {
  const [notes, setNotes] = useState<NoteWithId[]>([]);
  const [analysis, setAnalysis] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNoteSubmit = async (note: UnstructuredNote) => {
    try {
      setLoading(true);
      setError(null);

      // Agregar la nueva nota al estado con un ID único
      const noteWithId: NoteWithId = {
        ...note,
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      };
      const updatedNotes = [...notes, noteWithId];
      setNotes(updatedNotes);

      // Analizar todas las notas (enviando solo la parte UnstructuredNote)
      const notesForAnalysis = updatedNotes.map(({ ...rest }) => rest);
      const results = await aiService.analyzeUnstructuredNotes(
        'test-patient',
        notesForAnalysis
      );
      setAnalysis(results);
    } catch (err) {
      setError('Error al procesar la nota médica');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">
        Prueba del Asistente Virtual Médico
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel de Entrada */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Ingresar Nota Médica</h2>
          <NoteInput onSubmit={handleNoteSubmit} />
        </div>

        {/* Panel de Resultados */}
        <div className="space-y-6">
          {loading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
          )}

          {analysis && <AnalysisResults results={analysis} />}

          {/* Historial de Notas */}
          {notes.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Historial de Notas</h2>
              <div className="space-y-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="border-l-4 border-blue-500 pl-4"
                  >
                    <div className="text-sm text-gray-500">
                      {new Date(note.timestamp).toLocaleString()}
                    </div>
                    <div className="font-medium">{note.type}</div>
                    <div className="text-sm">{note.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
