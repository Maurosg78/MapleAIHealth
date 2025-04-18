import { SoapData, SpecialtyType, SOAPSection as SoapSection } from '../types/clinical';

// Niveles de evidencia para las reglas clínicas
export enum EvidenceLevel {
  HIGH = 0.9,    // Evidencia de alta calidad (ensayos clínicos, revisiones sistemáticas)
  MODERATE = 0.7, // Evidencia moderada (estudios observacionales)
  LOW = 0.5,     // Evidencia baja (consenso de expertos)
  VERY_LOW = 0.3 // Evidencia muy baja (opinión de expertos)
}

// Factores de relevancia clínica
export enum ClinicalRelevance {
  CRITICAL = 1.0,    // Crítico para el diagnóstico o tratamiento
  IMPORTANT = 0.8,   // Importante pero no crítico
  SUPPORTIVE = 0.6,  // De apoyo al diagnóstico
  OPTIONAL = 0.4     // Opcional o complementario
}

export interface ClinicalRule {
  id: string;
  condition: (data: SoapData) => boolean;
  suggestion: {
    type: 'required' | 'warning' | 'recommendation';
    title: string;
    description: string;
    section: SoapSection;
    field?: string;
    priority: 'high' | 'medium' | 'low';
    confidence: number;
    evidenceLevel: EvidenceLevel;
    clinicalRelevance: ClinicalRelevance;
    specialtySpecific: boolean;
    contextFactors?: {
      age?: number[];
      gender?: string[];
      conditions?: string[];
    };
  };
}

export const clinicalRules: Record<SpecialtyType, ClinicalRule[]> = {
  physiotherapy: [
    {
      id: 'pain_assessment_required',
      condition: (data) => {
        const subjective = data.subjective;
        return Boolean(
          subjective?.chiefComplaint?.toLowerCase().includes('dolor') &&
          (!subjective?.painDescription || !subjective?.painIntensity)
        );
      },
      suggestion: {
        type: 'required',
        title: 'Evaluación del dolor incompleta',
        description: 'Se requiere documentar características e intensidad del dolor para una evaluación completa.',
        section: 'subjective',
        field: 'painDescription',
        priority: 'high',
        confidence: 0.95,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['musculoskeletal', 'pain']
        }
      }
    },
    {
      id: 'red_flags_assessment',
      condition: (data) => {
        const subjective = data.subjective;
        return Boolean(
          subjective?.chiefComplaint?.toLowerCase().includes('dolor') &&
          !subjective?.medicalHistory?.toLowerCase().includes('banderas rojas')
        );
      },
      suggestion: {
        type: 'required',
        title: 'Evaluación de banderas rojas requerida',
        description: 'Se requiere evaluar la presencia de banderas rojas en pacientes con dolor musculoesquelético.',
        section: 'subjective',
        field: 'medicalHistory',
        priority: 'high',
        confidence: 0.95,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['musculoskeletal', 'pain']
        }
      }
    },
    {
      id: 'strength_assessment_required',
      condition: (data) => {
        const objective = data.objective;
        return Boolean(
          objective?.observation?.toLowerCase().includes('debilidad') &&
          !objective?.strength
        );
      },
      suggestion: {
        type: 'required',
        title: 'Evaluación de fuerza requerida',
        description: 'Se requiere evaluar la fuerza muscular en pacientes con debilidad reportada.',
        section: 'objective',
        field: 'strength',
        priority: 'high',
        confidence: 0.9,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['musculoskeletal', 'weakness']
        }
      }
    },
    {
      id: 'special_tests_required',
      condition: (data) => {
        const subjective = data.subjective;
        const objective = data.objective;
        return Boolean(
          subjective?.chiefComplaint?.toLowerCase().includes('rodilla') &&
          !objective?.specialTests
        );
      },
      suggestion: {
        type: 'required',
        title: 'Pruebas especiales requeridas',
        description: 'Se requieren pruebas especiales para evaluar la integridad de estructuras específicas de la rodilla.',
        section: 'objective',
        field: 'specialTests',
        priority: 'high',
        confidence: 0.9,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['rodilla', 'injury']
        }
      }
    },
    {
      id: 'special_tests_shoulder',
      condition: (data) => {
        const subjective = data.subjective;
        const objective = data.objective;
        return Boolean(
          subjective?.chiefComplaint?.toLowerCase().includes('hombro') &&
          objective?.specialTests &&
          !(
            objective.specialTests['neer'] && 
            objective.specialTests['hawkins'] && 
            objective.specialTests['empty_can']
          )
        );
      },
      suggestion: {
        type: 'required',
        title: 'Pruebas especiales de hombro requeridas',
        description: 'Se recomienda realizar las pruebas de Neer, Hawkins y Empty Can para evaluar el manguito rotador y el espacio subacromial.',
        section: 'objective',
        field: 'specialTests',
        priority: 'high',
        confidence: 0.9,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['tendinitis', 'bursitis', 'pinzamiento']
        }
      }
    },
    {
      id: 'special_tests_knee',
      condition: (data) => {
        const subjective = data.subjective;
        const objective = data.objective;
        return Boolean(
          subjective?.chiefComplaint?.toLowerCase().includes('rodilla') &&
          objective?.specialTests &&
          !(
            objective.specialTests['lachman'] && 
            objective.specialTests['mcmurray'] && 
            objective.specialTests['patellar_grind']
          )
        );
      },
      suggestion: {
        type: 'required',
        title: 'Pruebas especiales de rodilla requeridas',
        description: 'Se recomienda realizar las pruebas de Lachman, McMurray y Patellar Grind para evaluar LCA, meniscos y articulación patelofemoral.',
        section: 'objective',
        field: 'specialTests',
        priority: 'high',
        confidence: 0.9,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['rodilla', 'injury']
        }
      }
    },
    {
      id: 'special_tests_lumbar',
      condition: (data) => {
        const subjective = data.subjective;
        const objective = data.objective;
        return Boolean(
          subjective?.chiefComplaint?.toLowerCase().includes('lumbar') &&
          objective?.specialTests &&
          !(
            objective.specialTests['slr'] && 
            objective.specialTests['faber'] && 
            objective.specialTests['centralization']
          )
        );
      },
      suggestion: {
        type: 'required',
        title: 'Pruebas especiales de columna lumbar requeridas',
        description: 'Se recomienda realizar las pruebas de SLR, FABER y Centralización para evaluar radiculopatía, articulación sacroilíaca y discopatía.',
        section: 'objective',
        field: 'specialTests',
        priority: 'high',
        confidence: 0.9,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['lumbar', 'back']
        }
      }
    },
    {
      id: 'gait_analysis_required',
      condition: (data) => {
        const subjective = data.subjective;
        const objective = data.objective;
        return Boolean(
          (subjective?.chiefComplaint?.toLowerCase().includes('marcha') ||
           subjective?.chiefComplaint?.toLowerCase().includes('caminar')) &&
          !objective?.gait
        );
      },
      suggestion: {
        type: 'required',
        title: 'Análisis de marcha requerido',
        description: 'Se requiere un análisis detallado de la marcha para evaluar patrones de movimiento y compensaciones.',
        section: 'objective',
        field: 'gait',
        priority: 'high',
        confidence: 0.9,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['gait', 'walking']
        }
      }
    },
    {
      id: 'special_tests_cervical',
      condition: (data) => {
        const subjective = data.subjective;
        const objective = data.objective;
        return Boolean(
          subjective?.chiefComplaint?.toLowerCase().includes('cervical') &&
          objective?.specialTests &&
          !(
            objective.specialTests['spurling'] && 
            objective.specialTests['upper_limb_tension'] && 
            objective.specialTests['vertebral_artery']
          )
        );
      },
      suggestion: {
        type: 'required',
        title: 'Pruebas especiales cervicales requeridas',
        description: 'Se recomienda realizar las pruebas de Spurling, Upper Limb Tension y Vertebral Artery para evaluar radiculopatía cervical y compromiso vascular.',
        section: 'objective',
        field: 'specialTests',
        priority: 'high',
        confidence: 0.9,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['cervical', 'vascular']
        }
      }
    },
    {
      id: 'special_tests_elbow',
      condition: (data) => {
        const subjective = data.subjective;
        const objective = data.objective;
        return Boolean(
          (subjective?.chiefComplaint?.toLowerCase().includes('codo') ||
           subjective?.chiefComplaint?.toLowerCase().includes('epicondilitis')) &&
          objective?.specialTests &&
          !(
            objective.specialTests['cozens'] && 
            objective.specialTests['mill'] && 
            objective.specialTests['chair_test']
          )
        );
      },
      suggestion: {
        type: 'required',
        title: 'Pruebas especiales de codo requeridas',
        description: 'Se recomienda realizar las pruebas de Cozens, Mill y Chair Test para evaluar epicondilitis lateral y medial.',
        section: 'objective',
        field: 'specialTests',
        priority: 'high',
        confidence: 0.9,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['elbow', 'injury']
        }
      }
    },
    {
      id: 'special_tests_ankle',
      condition: (data) => {
        const subjective = data.subjective;
        const objective = data.objective;
        return Boolean(
          (subjective?.chiefComplaint?.toLowerCase().includes('tobillo') ||
           subjective?.chiefComplaint?.toLowerCase().includes('esguince')) &&
          objective?.specialTests &&
          !(
            objective.specialTests['anterior_drawer'] && 
            objective.specialTests['talar_tilt'] && 
            objective.specialTests['squeeze_test']
          )
        );
      },
      suggestion: {
        type: 'required',
        title: 'Pruebas especiales de tobillo requeridas',
        description: 'Se recomienda realizar las pruebas de Anterior Drawer, Talar Tilt y Squeeze Test para evaluar estabilidad ligamentaria y fracturas de estrés.',
        section: 'objective',
        field: 'specialTests',
        priority: 'high',
        confidence: 0.9,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['ankle', 'injury']
        }
      }
    },
    {
      id: 'myofascial_assessment',
      condition: (data) => {
        const subjective = data.subjective;
        const objective = data.objective;
        return Boolean(
          (subjective?.chiefComplaint?.toLowerCase().includes('punto gatillo') ||
           subjective?.chiefComplaint?.toLowerCase().includes('tensión muscular')) &&
          !objective?.palpation
        );
      },
      suggestion: {
        type: 'required',
        title: 'Evaluación miofascial requerida',
        description: 'Se requiere una evaluación detallada de puntos gatillo y patrones de dolor referido según los mapas de dolor miofascial.',
        section: 'objective',
        field: 'palpation',
        priority: 'high',
        confidence: 0.9,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['muscle', 'pain']
        }
      }
    },
    {
      id: 'functional_movement_assessment',
      condition: (data) => {
        const subjective = data.subjective;
        const objective = data.objective;
        return Boolean(
          (subjective?.chiefComplaint?.toLowerCase().includes('movimiento') ||
           subjective?.chiefComplaint?.toLowerCase().includes('funcional')) &&
          !objective?.functionalTests
        );
      },
      suggestion: {
        type: 'required',
        title: 'Evaluación de movimiento funcional requerida',
        description: 'Se recomienda realizar una evaluación de patrones de movimiento funcional (FMS) para identificar disfunciones y asimetrías.',
        section: 'objective',
        field: 'functionalTests',
        priority: 'high',
        confidence: 0.9,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['movement', 'function']
        }
      }
    },
    {
      id: 'impingement_syndrome_assessment',
      condition: (data) => {
        const subjective = data.subjective;
        const objective = data.objective;
        return Boolean(
          (subjective?.chiefComplaint?.toLowerCase().includes('pinzamiento') ||
           subjective?.chiefComplaint?.toLowerCase().includes('impingement')) &&
          objective?.specialTests &&
          !(
            objective.specialTests['neer'] && 
            objective.specialTests['hawkins'] && 
            objective.specialTests['painful_arc']
          )
        );
      },
      suggestion: {
        type: 'required',
        title: 'Evaluación de síndrome de pinzamiento requerida',
        description: 'Se recomienda realizar las pruebas de Neer, Hawkins y Arco Doloroso para evaluar el síndrome de pinzamiento subacromial.',
        section: 'objective',
        field: 'specialTests',
        priority: 'high',
        confidence: 0.9,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['impingement', 'pain']
        }
      }
    },
    {
      id: 'hip_special_tests',
      condition: (data) => {
        const subjective = data.subjective;
        const objective = data.objective;
        return Boolean(
          (subjective?.chiefComplaint?.toLowerCase().includes('cadera') ||
           subjective?.chiefComplaint?.toLowerCase().includes('coxofemoral')) &&
          objective?.specialTests &&
          !(
            objective.specialTests['faber'] && 
            objective.specialTests['thomas'] && 
            objective.specialTests['trendelenburg']
          )
        );
      },
      suggestion: {
        type: 'required',
        title: 'Pruebas especiales de cadera requeridas',
        description: 'Se recomienda realizar las pruebas de FABER, Thomas y Trendelenburg para evaluar disfunción de cadera y debilidad del glúteo medio.',
        section: 'objective',
        field: 'specialTests',
        priority: 'high',
        confidence: 0.9,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['hip', 'weakness']
        }
      }
    },
    {
      id: 'postural_assessment',
      condition: (data) => {
        const subjective = data.subjective;
        const objective = data.objective;
        return Boolean(
          (subjective?.chiefComplaint?.toLowerCase().includes('postura') ||
           subjective?.chiefComplaint?.toLowerCase().includes('desequilibrio postural')) &&
          !objective?.posture
        );
      },
      suggestion: {
        type: 'required',
        title: 'Evaluación postural requerida',
        description: 'Se requiere una evaluación postural completa incluyendo alineación anterior, posterior y lateral, así como evaluación de curvas vertebrales.',
        section: 'objective',
        field: 'posture',
        priority: 'high',
        confidence: 0.9,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['posture', 'alignment']
        }
      }
    },
    {
      id: 'balance_assessment',
      condition: (data) => {
        const subjective = data.subjective;
        const objective = data.objective;
        return Boolean(
          (subjective?.chiefComplaint?.toLowerCase().includes('equilibrio') ||
           subjective?.chiefComplaint?.toLowerCase().includes('inestabilidad')) &&
          !objective?.balanceTests
        );
      },
      suggestion: {
        type: 'required',
        title: 'Evaluación de equilibrio requerida',
        description: 'Se recomienda realizar pruebas de equilibrio estático y dinámico, incluyendo Romberg, Tandem Stance y pruebas de alcance funcional.',
        section: 'objective',
        field: 'balanceTests',
        priority: 'high',
        confidence: 0.9,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['balance', 'stability']
        }
      }
    },
    {
      id: 'functional_strength_assessment',
      condition: (data) => {
        const subjective = data.subjective;
        const objective = data.objective;
        return Boolean(
          (subjective?.chiefComplaint?.toLowerCase().includes('fuerza') ||
           subjective?.chiefComplaint?.toLowerCase().includes('debilidad')) &&
          !objective?.strengthTests
        );
      },
      suggestion: {
        type: 'required',
        title: 'Evaluación de fuerza funcional requerida',
        description: 'Se recomienda realizar pruebas de fuerza funcional incluyendo sentadillas, flexiones y pruebas específicas por grupo muscular.',
        section: 'objective',
        field: 'strengthTests',
        priority: 'high',
        confidence: 0.9,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['strength', 'weakness']
        }
      }
    }
  ],
  pediatrics: [
    {
      id: 'growth_assessment_required',
      condition: (data) => {
        const objective = data.objective;
        return Boolean(
          objective?.observation?.toLowerCase().includes('desarrollo') &&
          !objective?.vitalSigns?.height &&
          !objective?.vitalSigns?.weight
        );
      },
      suggestion: {
        type: 'required',
        title: 'Evaluación de crecimiento requerida',
        description: 'Se requiere medir talla y peso para evaluar el desarrollo del paciente pediátrico.',
        section: 'objective',
        field: 'vitalSigns',
        priority: 'high',
        confidence: 0.95,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [0, 18],
          conditions: ['growth', 'pediatric']
        }
      }
    },
    {
      id: 'vaccination_check',
      condition: (data) => {
        const subjective = data.subjective;
        return Boolean(
          subjective?.medicalHistory?.toLowerCase().includes('vacuna') &&
          !subjective?.currentMedications?.toLowerCase().includes('vacuna')
        );
      },
      suggestion: {
        type: 'recommendation',
        title: 'Verificación de esquema de vacunación',
        description: 'Se recomienda verificar y actualizar el esquema de vacunación del paciente.',
        section: 'subjective',
        field: 'currentMedications',
        priority: 'high',
        confidence: 0.9,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [0, 18],
          conditions: ['vaccination', 'pediatric']
        }
      }
    }
  ],
  nutrition: [
    {
      id: 'dietary_assessment_required',
      condition: (data) => {
        const subjective = data.subjective;
        return Boolean(
          subjective?.chiefComplaint?.toLowerCase().includes('peso') &&
          !subjective?.currentMedications?.toLowerCase().includes('dieta')
        );
      },
      suggestion: {
        type: 'required',
        title: 'Evaluación dietética requerida',
        description: 'Se requiere una evaluación completa de hábitos alimentarios y patrones de consumo.',
        section: 'subjective',
        field: 'currentMedications',
        priority: 'high',
        confidence: 0.95,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['nutrition', 'diet']
        }
      }
    },
    {
      id: 'anthropometric_measurements',
      condition: (data) => {
        const objective = data.objective;
        return Boolean(
          objective?.observation?.toLowerCase().includes('nutricional') &&
          !objective?.vitalSigns?.weight &&
          !objective?.vitalSigns?.height
        );
      },
      suggestion: {
        type: 'required',
        title: 'Mediciones antropométricas requeridas',
        description: 'Se requieren mediciones antropométricas completas para la evaluación nutricional.',
        section: 'objective',
        field: 'vitalSigns',
        priority: 'high',
        confidence: 0.9,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['nutrition', 'anthropometry']
        }
      }
    }
  ],
  psychology: [
    {
      id: 'mental_status_exam',
      condition: (data) => {
        const objective = data.objective;
        return Boolean(
          objective?.observation?.toLowerCase().includes('estado mental') &&
          !objective?.neurologicalTests
        );
      },
      suggestion: {
        type: 'required',
        title: 'Examen del estado mental requerido',
        description: 'Se requiere un examen completo del estado mental para la evaluación psicológica.',
        section: 'objective',
        field: 'neurologicalTests',
        priority: 'high',
        confidence: 0.95,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['psychology', 'mental']
        }
      }
    },
    {
      id: 'suicide_risk_assessment',
      condition: (data) => {
        const subjective = data.subjective;
        const objective = data.objective;
        return Boolean(
          subjective?.chiefComplaint?.toLowerCase().includes('depresión') &&
          objective?.neurologicalTests &&
          !Object.values(objective.neurologicalTests).some(test => 
            test.toLowerCase().includes('suicidio')
          )
        );
      },
      suggestion: {
        type: 'required',
        title: 'Evaluación de riesgo suicida requerida',
        description: 'Se requiere una evaluación específica del riesgo suicida en pacientes con síntomas depresivos.',
        section: 'objective',
        field: 'neurologicalTests',
        priority: 'high',
        confidence: 0.9,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['psychology', 'depression']
        }
      }
    }
  ],
  general: [
    {
      id: 'vitals_required',
      condition: (data) => {
        const objective = data.objective;
        return Boolean(
          objective?.observation?.toLowerCase().includes('fiebre') &&
          !objective?.vitalSigns
        );
      },
      suggestion: {
        type: 'required',
        title: 'Signos vitales requeridos',
        description: 'Se requieren los signos vitales del paciente para una evaluación completa.',
        section: 'objective',
        field: 'vitalSigns',
        priority: 'high',
        confidence: 0.95,
        evidenceLevel: EvidenceLevel.HIGH,
        clinicalRelevance: ClinicalRelevance.CRITICAL,
        specialtySpecific: true,
        contextFactors: {
          age: [18, 65],
          conditions: ['vital', 'general']
        }
      }
    }
  ]
}; 