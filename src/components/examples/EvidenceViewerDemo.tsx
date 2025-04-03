import React, { useState, useEffect } from 'react';
import { EvidenceViewer } from '../evidence';
import {
  EvidenceEvaluationResult,
  Recommendation
} from '../../services/ai/types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { evidenceEvaluationService } from '../../services/ai/evidence';

/**
 * Componente de demostración para el visualizador de evidencia clínica
 */
const EvidenceViewerDemo: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [evaluationResult, setEvaluationResult] = useState<EvidenceEvaluationResult | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedExample, setSelectedExample] = useState<'hypertension' | 'diabetes' | 'arthritis'>('hypertension');

  // Cargar datos de ejemplo cuando cambia la selección
  useEffect(() => {
    const loadExampleData = async () => {
      setLoading(true);

      try {
        // En un caso real, estos datos vendrían de una llamada a la API
        // Simulamos el retardo de red
        await new Promise(resolve => setTimeout(resolve, 1000));

        const exampleContent = getExampleContent(selectedExample);

        // Usar el servicio real de evaluación si está disponible
        try {
          // Intentar usar el servicio de evaluación real
          const service = evidenceEvaluationService;
          const result = await service.evaluateEvidence(exampleContent);
          setEvaluationResult(result);

          // Evaluar recomendaciones de ejemplo
          const evalPromises = getExampleRecommendations(selectedExample).map(
            rec => service.evaluateRecommendation(rec)
          );

          setRecommendations(await Promise.all(evalPromises));
        } catch {
          // Si el servicio real falla, usar datos simulados
          console.log('Usando datos simulados para la demo');
          setEvaluationResult(getSimulatedEvaluationResult(selectedExample));
          setRecommendations(getExampleRecommendations(selectedExample));
        }
      } catch (error) {
        console.error('Error cargando datos de ejemplo:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExampleData();
  }, [selectedExample]);

  // Manejar clic en ejemplo
  const handleExampleClick = (example: 'hypertension' | 'diabetes' | 'arthritis') => {
    setSelectedExample(example);
  };

  // Renderizar contenido basado en estado de carga
  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-32 bg-slate-200 rounded mb-4"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Visualizador de Evidencia Clínica</h2>
        <p className="text-gray-600 mb-4">
          Este componente permite visualizar la evaluación de evidencia clínica y recomendaciones
          médicas basadas en evidencia.
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            onClick={() => handleExampleClick('hypertension')}
            className={selectedExample === 'hypertension' ? 'bg-blue-500 text-white' : ''}
          >
            Hipertensión
          </Button>
          <Button
            onClick={() => handleExampleClick('diabetes')}
            className={selectedExample === 'diabetes' ? 'bg-blue-500 text-white' : ''}
          >
            Diabetes
          </Button>
          <Button
            onClick={() => handleExampleClick('arthritis')}
            className={selectedExample === 'arthritis' ? 'bg-blue-500 text-white' : ''}
          >
            Artritis
          </Button>
        </div>
      </Card>

      {evaluationResult && (
        <EvidenceViewer
          result={evaluationResult}
          recommendations={recommendations}
          showLimitationsNotes={true}
          showAlternatives={true}
        />
      )}
    </div>
  );
};

// Funciones auxiliares para generar datos de ejemplo
const getExampleContent = (example: string): string => {
  switch (example) {
    case 'hypertension':
      return 'El tratamiento con inhibidores de la enzima convertidora de angiotensina (IECA) como el enalapril reduce efectivamente la presión arterial en pacientes con hipertensión esencial. Múltiples ensayos clínicos controlados con placebo han demostrado su eficacia y seguridad.';
    case 'diabetes':
      return 'La metformina es considerada la primera línea de tratamiento para pacientes con diabetes tipo 2, particularmente en pacientes con sobrepeso. Estudios observacionales sugieren beneficios cardiovasculares adicionales pero la evidencia de ensayos controlados es limitada.';
    case 'arthritis':
      return 'Algunos estudios de caso y serie de casos sugieren que los suplementos de glucosamina pueden aliviar el dolor en pacientes con osteoartritis, pero los ensayos clínicos controlados muestran resultados contradictorios. No hay consenso sobre su eficacia.';
    default:
      return '';
  }
};

// Función para generar resultados de evaluación simulados
const getSimulatedEvaluationResult = (example: string): EvidenceEvaluationResult => {
  const results: Record<string, EvidenceEvaluationResult> = {
    hypertension: {
      evidenceLevel: 'A',
      details: {
        level: 'A',
        description: 'Evidencia de alta calidad basada en múltiples ensayos clínicos controlados con placebo',
        criteria: 'Evidencia basada en al menos 2 ensayos clínicos de alta calidad metodológica publicados en revistas con revisión por pares',
        reliability: 'high',
        sources: [
          {
            id: 'pmid-12345678',
            title: 'Efficacy of ACE inhibitors in essential hypertension: a meta-analysis of randomized controlled trials',
            authors: ['Smith J', 'Johnson A', 'Williams B'],
            publication: 'Journal of Hypertension',
            year: 2018,
            doi: '10.1111/jht.12345',
            url: 'https://doi.org/10.1111/jht.12345',
            verified: true,
            verificationSource: 'pubmed',
            reliability: 'high'
          },
          {
            id: 'pmid-87654321',
            title: 'Long-term effects of enalapril on cardiovascular mortality and morbidity in patients with hypertension',
            authors: ['Garcia R', 'Martinez L', 'Cooper T'],
            publication: 'New England Journal of Medicine',
            year: 2020,
            doi: '10.1056/nejm.20.12345',
            url: 'https://doi.org/10.1056/nejm.20.12345',
            verified: true,
            verificationSource: 'pubmed',
            reliability: 'high'
          }
        ]
      },
      confidenceScore: 92,
      limitationsNotes: 'La mayoría de estudios no incluyeron pacientes con comorbilidades graves, por lo que los resultados podrían no ser generalizables a esta población',
      suggestedAlternatives: [
        'Para pacientes con intolerancia a IECA, considerar bloqueadores de receptores de angiotensina (BRA)',
        'En pacientes con comorbilidades específicas, evaluar combinaciones terapéuticas individualizadas'
      ]
    },
    diabetes: {
      evidenceLevel: 'B',
      details: {
        level: 'B',
        description: 'Evidencia de calidad moderada basada en estudios observacionales y ensayos clínicos limitados',
        criteria: 'Evidencia basada en estudios observacionales bien diseñados y ensayos clínicos con limitaciones metodológicas',
        reliability: 'moderate',
        sources: [
          {
            id: 'pmid-23456789',
            title: 'Metformin as first-line therapy in type 2 diabetes: a systematic review',
            authors: ['Johnson K', 'Lopez M'],
            publication: 'Diabetes Care',
            year: 2019,
            doi: '10.2337/dc.19.1234',
            url: 'https://doi.org/10.2337/dc.19.1234',
            verified: true,
            verificationSource: 'pubmed',
            reliability: 'moderate'
          },
          {
            id: 'pmid-34567890',
            title: 'Cardiovascular outcomes in patients with type 2 diabetes treated with metformin',
            authors: ['Chen Y', 'Wu Z', 'Patel S'],
            publication: 'Journal of Diabetes Research',
            year: 2017,
            doi: '10.1111/jdr.5678',
            url: 'https://doi.org/10.1111/jdr.5678',
            verified: true,
            verificationSource: 'pubmed',
            reliability: 'moderate'
          }
        ]
      },
      confidenceScore: 78,
      limitationsNotes: 'Faltan ensayos clínicos aleatorizados a largo plazo que evalúen específicamente los desenlaces cardiovasculares',
      suggestedAlternatives: [
        'Considerar inhibidores SGLT-2 en pacientes con riesgo cardiovascular elevado',
        'Agonistas GLP-1 son alternativas en pacientes con obesidad concomitante'
      ]
    },
    arthritis: {
      evidenceLevel: 'D',
      details: {
        level: 'D',
        description: 'Evidencia insuficiente y de baja calidad con resultados contradictorios',
        criteria: 'Estudios con serias limitaciones metodológicas, evidencia contradictoria o ausencia de ensayos clínicos adecuados',
        reliability: 'low',
        sources: [
          {
            id: 'pmid-45678901',
            title: 'Effects of glucosamine supplements on osteoarthritis: a case series',
            authors: ['Roberts L', 'Turner S'],
            publication: 'Journal of Alternative Medicine',
            year: 2020,
            doi: '10.1080/jalt.2020.789',
            url: 'https://doi.org/10.1080/jalt.2020.789',
            verified: false,
            reliability: 'low'
          }
        ]
      },
      confidenceScore: 35,
      limitationsNotes: 'Estudios existentes muestran resultados inconsistentes. Faltan ensayos clínicos bien diseñados con metodología estandarizada.',
      suggestedAlternatives: [
        'Considerar analgésicos convencionales con evidencia más sólida como paracetamol o AINE',
        'Terapia física y ejercicios de fortalecimiento tienen evidencia de mayor calidad para manejo de osteoartritis'
      ]
    }
  };

  return results[example] || results.hypertension;
};

// Función para generar recomendaciones de ejemplo
const getExampleRecommendations = (example: string): Recommendation[] => {
  const recommendations: Record<string, Recommendation[]> = {
    hypertension: [
      {
        type: 'medication',
        title: 'Iniciar tratamiento con IECA',
        description: 'Iniciar enalapril 5mg una vez al día, aumentando gradualmente hasta 20mg diarios según respuesta y tolerancia.',
        priority: 'high',
        timeframe: 'Iniciar en la próxima visita',
        rationale: 'Los IECA han demostrado eficacia en la reducción de la presión arterial y mortalidad cardiovascular en pacientes con hipertensión esencial.',
        evidenceLevel: 'A'
      },
      {
        type: 'lifestyle',
        title: 'Modificación de dieta DASH',
        description: 'Implementar dieta DASH (Dietary Approaches to Stop Hypertension) rica en frutas, verduras y lácteos bajos en grasa.',
        priority: 'medium',
        timeframe: 'Iniciar inmediatamente y mantener a largo plazo',
        rationale: 'La dieta DASH ha demostrado reducir la presión arterial en aproximadamente 8-14 mmHg sistólica.',
        evidenceLevel: 'B'
      },
      {
        type: 'follow-up',
        title: 'Monitoreo regular de presión arterial',
        description: 'Realizar mediciones domiciliarias de presión arterial dos veces al día y llevar registro para evaluación médica.',
        priority: 'medium',
        timeframe: 'Diariamente',
        rationale: 'El monitoreo frecuente permite ajustes terapéuticos oportunos y mejora el control a largo plazo.',
        evidenceLevel: 'B'
      }
    ],
    diabetes: [
      {
        type: 'medication',
        title: 'Iniciar tratamiento con metformina',
        description: 'Comenzar con metformina 500mg/día con las comidas, aumentando gradualmente a 1000mg dos veces al día después de 1-2 semanas si es bien tolerada.',
        priority: 'high',
        timeframe: 'Iniciar en la próxima visita',
        rationale: 'La metformina reduce efectivamente los niveles de glucosa sanguínea, particularmente la producción hepática de glucosa, y puede proporcionar beneficios cardiovasculares adicionales.',
        evidenceLevel: 'B'
      },
      {
        type: 'lifestyle',
        title: 'Plan alimentario para diabetes',
        description: 'Implementar plan de alimentación individualizado con restricción calórica moderada, bajo contenido de carbohidratos simples y alto contenido de fibra.',
        priority: 'high',
        timeframe: 'Iniciar inmediatamente',
        rationale: 'La modificación dietética puede reducir la HbA1c en aproximadamente 1-2% y mejorar la sensibilidad a la insulina.',
        evidenceLevel: 'B'
      },
      {
        type: 'test',
        title: 'Monitoreo de HbA1c',
        description: 'Realizar prueba de hemoglobina glicosilada cada 3 meses hasta alcanzar objetivo terapéutico.',
        priority: 'medium',
        timeframe: 'Cada 3 meses',
        rationale: 'El monitoreo regular permite evaluar la eficacia del tratamiento y realizar ajustes oportunos.',
        evidenceLevel: 'B'
      }
    ],
    arthritis: [
      {
        type: 'medication',
        title: 'Suplementos de glucosamina',
        description: 'Considerar suplemento de glucosamina sulfato 1500mg/día vía oral.',
        priority: 'low',
        timeframe: 'Opcional',
        rationale: 'Algunos estudios sugieren que la glucosamina puede proporcionar alivio sintomático del dolor articular en osteoartritis, pero la evidencia es contradictoria.',
        evidenceLevel: 'D'
      },
      {
        type: 'medication',
        title: 'Analgésicos convencionales',
        description: 'Iniciar paracetamol 500mg cada 8 horas según necesidad para dolor.',
        priority: 'medium',
        timeframe: 'Según necesidad',
        rationale: 'El paracetamol es un analgésico con perfil de seguridad favorable y eficacia moderada para el dolor de osteoartritis.',
        evidenceLevel: 'B'
      },
      {
        type: 'consultation',
        title: 'Referencia a fisioterapia',
        description: 'Derivar a fisioterapia para programa de ejercicios específicos y terapia manual.',
        priority: 'high',
        timeframe: 'Próximas 2 semanas',
        rationale: 'Los programas de ejercicio estructurado han demostrado reducir el dolor y mejorar la función articular en pacientes con osteoartritis.',
        evidenceLevel: 'A'
      }
    ]
  };

  return recommendations[example] || recommendations.hypertension;
};

export default EvidenceViewerDemo;
