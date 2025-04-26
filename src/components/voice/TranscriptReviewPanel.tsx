import React, { useState, useEffect } from 'react';
import { TranscriptManager } from '../../services/voice/TranscriptManager';
import { PendingTranscript, TranscriptReview } from '../../types/voice';
import { TranscriptVisualizer } from './TranscriptVisualizer';

interface TranscriptReviewPanelProps {
  patientId: string;
  visitId: string;
  onTranscriptApproved?: (transcript: PendingTranscript) => void;
  onTranscriptRejected?: (transcript: PendingTranscript) => void;
  className?: string;
}

export const TranscriptReviewPanel: React.FC<TranscriptReviewPanelProps> = ({
  patientId,
  visitId,
  onTranscriptApproved,
  onTranscriptRejected,
  className = ''
}) => {
  const [pendingTranscripts, setPendingTranscripts] = useState<PendingTranscript[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<PendingTranscript | null>(null);
  const [comments, setComments] = useState('');
  const transcriptManager = new TranscriptManager();

  useEffect(() => {
    const transcripts = transcriptManager.getPendingTranscripts(patientId);
    setPendingTranscripts(transcripts);
  }, [patientId]);

  const handleApprove = () => {
    if (!selectedTranscript) return;

    const review: TranscriptReview = {
      transcriptId: selectedTranscript.id,
      status: 'approved',
      reviewedBy: 'current_user', // Esto debería venir del contexto de autenticación
      reviewedAt: new Date(),
      comments
    };

    const updatedTranscript = transcriptManager.reviewTranscript(review);
    if (updatedTranscript) {
      setPendingTranscripts(prev => prev.filter(t => t.id !== updatedTranscript.id));
      setSelectedTranscript(null);
      setComments('');
      if (onTranscriptApproved) {
        onTranscriptApproved(updatedTranscript);
      }
    }
  };

  const handleReject = () => {
    if (!selectedTranscript) return;

    const review: TranscriptReview = {
      transcriptId: selectedTranscript.id,
      status: 'rejected',
      reviewedBy: 'current_user', // Esto debería venir del contexto de autenticación
      reviewedAt: new Date(),
      comments
    };

    const updatedTranscript = transcriptManager.reviewTranscript(review);
    if (updatedTranscript) {
      setPendingTranscripts(prev => prev.filter(t => t.id !== updatedTranscript.id));
      setSelectedTranscript(null);
      setComments('');
      if (onTranscriptRejected) {
        onTranscriptRejected(updatedTranscript);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-medium mb-4">Transcripciones Pendientes</h2>
        
        {pendingTranscripts.length === 0 ? (
          <p className="text-gray-500">No hay transcripciones pendientes de revisión</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {pendingTranscripts.map(transcript => (
                  <div
                    key={transcript.id}
                    className={`p-3 rounded-lg cursor-pointer ${
                      selectedTranscript?.id === transcript.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedTranscript(transcript)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {new Date(transcript.createdAt).toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {transcript.transcript.speaker?.name || 'Sin identificar'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedTranscript && (
                <div className="space-y-4">
                  <TranscriptVisualizer
                    transcript={selectedTranscript.transcript}
                    className="bg-white"
                  />
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Comentarios
                    </label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Añade comentarios sobre la transcripción..."
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleApprove}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={handleReject}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 