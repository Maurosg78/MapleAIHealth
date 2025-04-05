import * as React from 'react';
import { useState, useCallback, useEffect, memo } from 'react';
import {
  AIAssistantActivityIndicator,
  VirtualizedPatientList
} from './index';

// Tipos para los datos de demostración
interface PatientInfo {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  mrn: string;
  lastVisit: string;
  conditions?: string[];
}

export const EMRDemoPage: React.FC = memo(() => {
  const [selectedPatient, setSelectedPatient] = useState<PatientInfo | null>(null);
  const [assistantState, setAssistantState] = useState<'idle' | 'thinking' | 'writing' | 'analyzing' | 'complete'>('idle');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [assistantTask, setAssistantTask] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  const mockPatients: PatientInfo[] = [
    {
      id: 'p1',
      name: 'Juan Pérez',
      age: 45,
      gender: 'M',
      mrn: 'MRN-001',
      lastVisit: '2023-12-15',
      conditions: ['Hipertensión', 'Diabetes tipo 2']
    },
    {
      id: 'p2',
      name: 'María González',
      age: 36,
      gender: 'F',
      mrn: 'MRN-002',
      lastVisit: '2024-01-05',
      conditions: ['Migraña', 'Ansiedad']
    },
    {
      id: 'p3',
      name: 'Carlos Rodríguez',
      age: 62,
      gender: 'M',
      mrn: 'MRN-003',
      lastVisit: '2023-11-20',
      conditions: ['Artritis', 'EPOC', 'Hipertensión']
    },
    {
      id: 'p4',
      name: 'Ana Martínez',
      age: 28,
      gender: 'F',
      mrn: 'MRN-004',
      lastVisit: '2024-02-10',
      conditions: ['Asma']
    },
    {
      id: 'p5',
      name: 'Roberto Sánchez',
      age: 54,
      gender: 'M',
      mrn: 'MRN-005',
      lastVisit: '2023-12-05',
      conditions: ['Fibrilación auricular', 'Insuficiencia cardíaca']
    }
  ];

  useEffect(() => {
    if (assistantState !== 'idle' && assistantState !== 'complete') {
      const interval = setInterval(() => {
        setCompletionPercentage(prev => {
          const newValue = prev + Math.random() * 5;
          return newValue > 95 ? 95 : newValue;
        });
        setElapsedTime(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    } else if (assistantState === 'complete') {
      setCompletionPercentage(100);
    }
  }, [assistantState]);

  const handlePatientSelect = useCallback((patient: PatientInfo) => {
    setSelectedPatient(patient);
    setAssistantState('thinking');
    setAssistantTask(`Cargando información del paciente ${patient.name}`);
    setCompletionPercentage(0);
    setElapsedTime(0);

    setTimeout(() => {
      setAssistantState('complete');
      setTimeout(() => {
        setAssistantState('idle');
      }, 1000);
    }, 3000);
  }, []);

  return React.createElement('div',
    { className: "flex flex-col space-y-4 p-4 max-w-6xl mx-auto" },
    [
      React.createElement('h1',
        {
          key: 'title',
          className: "text-2xl font-bold text-gray-800 mb-4"
        },
        "Sistema EMR con Asistente IA"
      ),
      React.createElement(AIAssistantActivityIndicator, {
        key: 'activity-indicator',
        state: assistantState,
        completionPercentage: completionPercentage,
        taskDescription: assistantTask,
        elapsedTime: elapsedTime,
        className: "mb-4"
      }),
      React.createElement('div',
        {
          key: 'grid',
          className: "grid grid-cols-1 md:grid-cols-3 gap-4"
        },
        [
          React.createElement('div',
            {
              key: 'patient-list',
              className: "bg-white rounded-lg shadow p-4"
            },
            [
              React.createElement('h2',
                {
                  key: 'patient-list-title',
                  className: "text-lg font-medium mb-3"
                },
                "Pacientes"
              ),
              React.createElement(VirtualizedPatientList, {
                key: 'patient-list-component',
                patients: mockPatients,
                onPatientSelect: handlePatientSelect,
                selectedPatientId: selectedPatient?.id
              })
            ]
          )
        ]
      )
    ]
  );
});

export default EMRDemoPage;
