import React, { useState, useEffect, useCallback } from 'react';
import { Card, Spinner } from '../common';
import { aiService, UnstructuredNote, AIResponse } from '../../services/ai/aiService';
import { NoteInput } from './NoteInput';
import AnalysisResults from './AnalysisResults';

interface AIAssistantProps {
    patientId: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ patientId }) => {
    const [notes, setNotes] = useState<UnstructuredNote[]>([]);
    const [analysis, setAnalysis] = useState<AIResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const analyzeNotes = useCallback(async (notesToAnalyze: UnstructuredNote[]) => {
        try {
            setLoading(true);
            setError(null);
            const results = await aiService.analyzeUnstructuredNotes(patientId, notesToAnalyze);
            setAnalysis(results);
        } catch (err) {
            setError('Error al analizar las notas médicas');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    // Cargar notas de ejemplo
    useEffect(() => {
        const loadExampleNotes = async () => {
            const exampleNotes: UnstructuredNote[] = [
                {
                    content: "Paciente llega a urgencias con fiebre de 39.2°C, tos seca y dificultad respiratoria. Presión arterial 160/95, frecuencia cardíaca 120 bpm, saturación de O2 92%. Refiere que hace 5 días comenzó con malestar general y dolor de cabeza. Se administra paracetamol 1g y se inicia oxígeno nasal a 2L/min.",
                    type: 'emergency',
                    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    author: 'Dr. Urgencias',
                    symptoms: ['fiebre', 'tos seca', 'dificultad respiratoria', 'malestar general', 'dolor de cabeza'],
                    medications: ['paracetamol 1g', 'oxígeno nasal 2L/min'],
                    vitalSigns: {
                        temperature: 39.2,
                        bloodPressure: '160/95',
                        heartRate: 120,
                        oxygenSaturation: 92
                    }
                },
                {
                    content: "Paciente presenta mejoría de síntomas respiratorios. Temperatura 37.8°C, presión 140/90, FC 95 bpm, SatO2 96%. Se mantiene tratamiento con paracetamol y se agrega amoxicilina 500mg cada 8 horas. El paciente menciona que tiene antecedentes de hipertensión pero no recuerda qué medicamentos toma.",
                    type: 'consultation',
                    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                    author: 'Dr. Internista',
                    symptoms: ['síntomas respiratorios'],
                    medications: ['paracetamol', 'amoxicilina 500mg'],
                    vitalSigns: {
                        temperature: 37.8,
                        bloodPressure: '140/90',
                        heartRate: 95,
                        oxygenSaturation: 96
                    }
                },
                {
                    content: "Resultados de laboratorio: Leucocitos: 15,000 (elevados), Neutrófilos: 85% (elevados), PCR: 45 mg/L (elevado), Hemoglobina: 13.2 g/dL, Plaquetas: 250,000, Creatinina: 1.2 mg/dL (elevada), Urea: 45 mg/dL (elevada), Glicemia: 126 mg/dL (elevada)",
                    type: 'lab-result',
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    author: 'Laboratorio'
                },
                {
                    content: "Paciente refiere dolor en el pecho y fatiga. Signos vitales: TA 150/92, FC 110 bpm, SatO2 94%. Se suspende amoxicilina por sospecha de reacción alérgica. Se indica reposo y se mantiene paracetamol.",
                    type: 'consultation',
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    author: 'Dr. Internista',
                    symptoms: ['dolor en el pecho', 'fatiga'],
                    medications: ['paracetamol'],
                    vitalSigns: {
                        bloodPressure: '150/92',
                        heartRate: 110,
                        oxygenSaturation: 94
                    }
                },
                {
                    content: "Paciente regresa a urgencias con empeoramiento de síntomas. Temperatura 38.5°C, TA 165/98, FC 125 bpm, SatO2 90%. Se inicia tratamiento con ceftriaxona 1g IV cada 24 horas. El paciente menciona que tiene diabetes tipo 2 pero no está en control.",
                    type: 'emergency',
                    timestamp: new Date().toISOString(),
                    author: 'Dr. Urgencias',
                    symptoms: ['empeoramiento de síntomas'],
                    medications: ['ceftriaxona 1g IV'],
                    vitalSigns: {
                        temperature: 38.5,
                        bloodPressure: '165/98',
                        heartRate: 125,
                        oxygenSaturation: 90
                    }
                }
            ];

            setNotes(exampleNotes);
            await analyzeNotes(exampleNotes);
        };

        loadExampleNotes();
    }, [analyzeNotes]);

    const handleNoteSubmit = async (note: UnstructuredNote) => {
        const updatedNotes = [...notes, note];
        setNotes(updatedNotes);
        await analyzeNotes(updatedNotes);
    };

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-xl font-semibold mb-4">Asistente Virtual Médico</h2>
                <p className="text-gray-600 mb-4">
                    Ingresa las notas médicas y el asistente virtual organizará la información,
                    identificará puntos de atención y generará recomendaciones.
                </p>
                <NoteInput onSubmit={handleNoteSubmit} />
            </Card>

            {loading && (
                <div className="flex justify-center">
                    <Spinner />
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {analysis && <AnalysisResults response={analysis} />}
        </div>
    );
};
