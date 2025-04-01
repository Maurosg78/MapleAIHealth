import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Spinner } from '../components/common/Spinner';
import { aiHistoryService, AIHistoryEntry } from '../services/ai/aiHistoryService';
import { useAuth } from '../hooks/useAuth';
import { ResponseFeedback } from '../components/ai/ResponseFeedback';

export const AIHistoryPage: React.FC = () => {
    const [history, setHistory] = useState<AIHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const data = await aiHistoryService.getHistory(user.id);
                setHistory(data);
            } catch (err) {
                setError('Error al cargar el historial');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center p-4">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Historial de Consultas IA</h1>

            {history.length === 0 ? (
                <Card className="p-4 text-center text-gray-500">
                    No hay consultas en el historial
                </Card>
            ) : (
                <div className="space-y-4">
                    {history.map((entry) => (
                        <Card key={entry.id} className="p-4">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium">Consulta:</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {entry.query.query}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-medium">Respuesta:</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {entry.response.response}
                                    </p>
                                    <div className="mt-2 text-xs text-gray-500">
                                        Fuente: {entry.response.provider}
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500">
                                    {new Date(entry.timestamp).toLocaleString()}
                                </div>

                                {!entry.feedback && (
                                    <ResponseFeedback
                                        entryId={entry.id}
                                        onFeedbackSubmitted={() => {
                                            setHistory(history.map(h =>
                                                h.id === entry.id
                                                    ? { ...h, feedback: { helpful: true } }
                                                    : h
                                            ));
                                        }}
                                    />
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
