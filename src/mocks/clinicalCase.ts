import { ClinicalContext, SOAPData, SpecialtyType } from '../types/clinical';

export const mockPatientHistory = {
  conditions: [
    'Osteoartritis de rodilla bilateral',
    'Hipertensión arterial',
    'Diabetes tipo 2',
    'Osteoporosis',
    'Depresión leve'
  ],
  medications: [
    'Metformina 850mg 2x/día',
    'Losartán 50mg 1x/día',
    'Alendronato 70mg 1x/semana',
    'Paracetamol 1g según necesidad',
    'Sertralina 50mg 1x/día'
  ],
  allergies: ['Ibuprofeno', 'Penicilina'],
  previousSurgeries: [
    'Reemplazo de cadera derecha (2018)',
    'Cataratas (2020)'
  ],
  familyHistory: [
    'Madre: Diabetes tipo 2',
    'Padre: Enfermedad cardiovascular'
  ]
};

export const mockSOAPData: SOAPData = {
  patientId: 'P67890',
  visitId: 'V12345',
  date: new Date().toISOString(),
  clinicianId: 'D54321',
  specialty: 'physiotherapy' as SpecialtyType,
  subjective: {
    chiefComplaint: 'Dolor y rigidez en ambas rodillas, mayor en la derecha',
    painScale: 6,
    symptoms: [
      'Dolor en rodillas al subir/bajar escaleras',
      'Rigidez matutina de 30 minutos',
      'Limitación para caminar más de 15 minutos',
      'Inestabilidad ocasional al caminar'
    ],
    onset: 'Progresivo en los últimos 6 meses',
    history: 'El dolor ha empeorado significativamente en el último mes, afectando su independencia',
    aggravatingFactors: [
      'Subir/bajar escaleras',
      'Caminar largas distancias',
      'Permanecer de pie por tiempo prolongado'
    ],
    relievingFactors: [
      'Reposo',
      'Aplicación de calor local',
      'Uso de bastón'
    ],
    functionalLimitations: [
      'Dificultad para subir escaleras',
      'Limitación para caminar al supermercado',
      'Problemas para levantarse de sillas bajas'
    ]
  },
  objective: {
    observation: 'Paciente con marcha antálgica, uso de bastón en mano derecha',
    rangeOfMotion: {
      knee: {
        right: {
          flexion: 100,
          extension: -5
        },
        left: {
          flexion: 110,
          extension: 0
        }
      }
    },
    muscleStrength: {
      'Cuádriceps derecho': 4,
      'Cuádriceps izquierdo': 4,
      'Isquiotibiales derecho': 4,
      'Isquiotibiales izquierdo': 4
    },
    specialTests: [
      {
        name: 'Test de McMurray',
        result: 'negative',
        notes: 'Sin dolor ni clic'
      },
      {
        name: 'Test de Lachman',
        result: 'negative',
        notes: 'Estabilidad ligamentaria conservada'
      }
    ],
    balanceTests: {
      'Timed Up and Go': '15 segundos',
      'Single Leg Stance': 'Derecho: 5 segundos, Izquierdo: 8 segundos'
    }
  },
  assessment: {
    diagnoses: {
      primary: 'Osteoartritis bilateral de rodilla, mayor compromiso derecho',
      differential: [
        'Bursitis prepatelar',
        'Tendinitis rotuliana',
        'Artritis reumatoide'
      ]
    },
    clinicalReasoning: 'El cuadro clínico y los hallazgos objetivos son consistentes con osteoartritis. La limitación funcional es significativa y afecta la independencia del paciente',
    functionalLimitations: [
      'Limitación para deambulación prolongada',
      'Dificultad para subir escaleras',
      'Riesgo de caídas'
    ],
    prognosis: 'Reservado a corto plazo, favorable a mediano plazo con tratamiento adecuado'
  },
  plan: {
    shortTermGoals: [
      'Reducir dolor a escala 3/10',
      'Mejorar rango de movimiento de rodillas',
      'Aumentar tiempo de marcha a 20 minutos continuos'
    ],
    longTermGoals: [
      'Independencia para actividades de la vida diaria',
      'Prevención de caídas',
      'Manejo autónomo del dolor'
    ],
    interventions: [
      {
        type: 'Terapia manual',
        description: 'Movilizaciones articulares y estiramientos',
        frequency: '2 veces por semana',
        duration: '6 semanas'
      },
      {
        type: 'Ejercicios terapéuticos',
        description: 'Fortalecimiento de cuádriceps e isquiotibiales',
        frequency: '3 veces por semana',
        duration: '8 semanas'
      },
      {
        type: 'Entrenamiento de marcha',
        description: 'Técnicas de marcha y uso de bastón',
        frequency: '2 veces por semana',
        duration: '4 semanas'
      }
    ],
    homeExercises: [
      {
        name: 'Elevaciones de pierna recta',
        sets: 3,
        reps: 10,
        frequency: '2 veces al día',
        instructions: 'Mantener 5 segundos en elevación'
      },
      {
        name: 'Mini sentadillas',
        sets: 3,
        reps: 8,
        frequency: '2 veces al día',
        instructions: 'No bajar más de 45 grados'
      }
    ],
    nextVisit: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    recommendations: [
      'Uso de bastón para deambulación prolongada',
      'Aplicación de calor local 2 veces al día',
      'Modificación de actividades de alto impacto',
      'Control de peso',
      'Seguimiento con reumatología'
    ]
  }
};

export const mockClinicalContext: ClinicalContext = {
  patientId: 'P67890',
  visitId: 'V12345',
  specialty: 'physiotherapy',
  activeSection: 'subjective',
  documentation: 'Paciente de 72 años con dolor y rigidez en ambas rodillas, mayor en la derecha. El dolor ha empeorado en el último mes, afectando su independencia. Refiere dificultad para subir escaleras y caminar más de 15 minutos.',
  previousNotes: [
    'Primera consulta: Evaluación inicial',
    'Seguimiento: Persiste dolor y limitación funcional'
  ],
  patientHistory: mockPatientHistory
}; 