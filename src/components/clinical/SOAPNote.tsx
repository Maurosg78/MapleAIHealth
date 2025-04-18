import React, { useState } from 'react';
import type { SOAPNote, SubjectiveData, ObjectiveData, AssessmentData, PlanData, SOAPSection } from '../../types/clinical';
import '../../styles/clinical/soap.css';

interface Props {
  initialData?: SOAPNote;
  onSave: (note: SOAPNote) => void;
  onCancel: () => void;
  readOnly?: boolean;
}

export const SOAPNoteForm: React.FC<Props> = ({
  initialData,
  onSave,
  onCancel,
  readOnly = false
}) => {
  const [activeSection, setActiveSection] = useState<'S' | 'O' | 'A' | 'P'>('S');
  const [note, setNote] = useState<SOAPNote>(initialData || {
    subjective: {
      chiefComplaint: '',
      painScale: 0,
      symptoms: [],
      onset: '',
      history: '',
      aggravatingFactors: [],
      relievingFactors: []
    },
    objective: {
      observation: '',
      palpation: '',
      rangeOfMotion: {},
      muscleStrength: {},
      specialTests: []
    },
    assessment: {
      diagnoses: {
        primary: '',
        differential: []
      },
      clinicalReasoning: '',
      functionalLimitations: [],
      prognosis: ''
    },
    plan: {
      shortTermGoals: [],
      longTermGoals: [],
      interventions: [],
      homeExercises: [],
      nextVisit: new Date(),
      recommendations: []
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      therapistId: '',
      patientId: '',
      visitNumber: 1
    }
  });

  const handleSubjectiveChange = (field: keyof SubjectiveData | 'painScale' | 'onset' | 'history', value: any) => {
    setNote({
      ...note,
      subjective: {
        ...note.subjective,
        [field]: value
      }
    });
  };

  const handleObjectiveChange = (field: keyof ObjectiveData, value: any) => {
    setNote({
      ...note,
      objective: {
        ...note.objective,
        [field]: value
      }
    });
  };

  const handleAssessmentChange = (field: keyof AssessmentData | 'diagnoses' | 'clinicalReasoning', value: any) => {
    setNote({
      ...note,
      assessment: {
        ...note.assessment,
        [field]: value
      }
    });
  };

  const handlePlanChange = (field: keyof PlanData | 'homeExercises' | 'nextVisit', value: any) => {
    setNote({
      ...note,
      plan: {
        ...note.plan,
        [field]: value
      }
    });
  };

  const handleArrayChange = (section: SOAPSection, field: string, index: number, value: string) => {
    // Comprobamos que la sección existe y tiene la propiedad field como array
    if (note[section] && Array.isArray((note[section] as any)[field])) {
      const updatedArray = [...((note[section] as any)[field] as any[])];
      updatedArray[index] = value;
      
      setNote({
        ...note,
        [section]: {
          ...note[section],
          [field]: updatedArray
        }
      });
    }
  };

  const addArrayItem = (section: SOAPSection, field: string, value: string = '') => {
    // Comprobamos que la sección existe y tiene la propiedad field como array
    if (note[section] && Array.isArray((note[section] as any)[field])) {
      setNote({
        ...note,
        [section]: {
          ...note[section],
          [field]: [...((note[section] as any)[field] as any[]), value]
        }
      });
    }
  };

  const removeArrayItem = (section: SOAPSection, field: string, index: number) => {
    // Comprobamos que la sección existe y tiene la propiedad field como array
    if (note[section] && Array.isArray((note[section] as any)[field])) {
      const updatedArray = [...((note[section] as any)[field] as any[])];
      updatedArray.splice(index, 1);
      
      setNote({
        ...note,
        [section]: {
          ...note[section],
          [field]: updatedArray
        }
      });
    }
  };

  const handleSave = () => {
    onSave(note);
  };

  return (
    <div className="soap-note-container">
      <div className="soap-navigation">
        <button
          className={`soap-tab ${activeSection === 'S' ? 'active' : ''}`}
          onClick={() => setActiveSection('S')}
          disabled={readOnly}
        >
          Subjetivo
        </button>
        <button
          className={`soap-tab ${activeSection === 'O' ? 'active' : ''}`}
          onClick={() => setActiveSection('O')}
          disabled={readOnly}
        >
          Objetivo
        </button>
        <button
          className={`soap-tab ${activeSection === 'A' ? 'active' : ''}`}
          onClick={() => setActiveSection('A')}
          disabled={readOnly}
        >
          Evaluación
        </button>
        <button
          className={`soap-tab ${activeSection === 'P' ? 'active' : ''}`}
          onClick={() => setActiveSection('P')}
          disabled={readOnly}
        >
          Plan
        </button>
      </div>

      <div className="soap-content">
        {activeSection === 'S' && (
          <div className="subjective-section">
            <div className="soap-section">
              <h3 className="soap-section-title">Motivo de Consulta</h3>
              <textarea
                className="soap-input soap-textarea"
                value={note.subjective.chiefComplaint}
                onChange={(e) => handleSubjectiveChange('chiefComplaint', e.target.value)}
                placeholder="Describa el motivo principal de consulta"
                disabled={readOnly}
              />
            </div>

            <div className="soap-section">
              <h3 className="soap-section-title">Escala de Dolor (0-10)</h3>
              <input
                type="range"
                min="0"
                max="10"
                className="soap-input"
                value={note.subjective.painScale}
                onChange={(e) => handleSubjectiveChange('painScale', parseInt(e.target.value))}
                disabled={readOnly}
                aria-label="Escala de Dolor"
                title="Escala de Dolor (0-10)"
              />
              <span>{note.subjective.painScale}/10</span>
            </div>

            <div className="soap-section">
              <h3 className="soap-section-title">Síntomas</h3>
              {note.subjective.symptoms.map((symptom, index) => (
                <div key={index} className="soap-array-item">
                  <input
                    type="text"
                    className="soap-input"
                    value={symptom}
                    onChange={(e) => handleArrayChange('subjective', 'symptoms', index, e.target.value)}
                    disabled={readOnly}
                    aria-label={`Síntoma ${index + 1}`}
                    placeholder="Describa el síntoma"
                  />
                  {!readOnly && (
                    <button
                      className="soap-button"
                      onClick={() => removeArrayItem('subjective', 'symptoms', index)}
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <button
                  className="soap-button"
                  onClick={() => addArrayItem('subjective', 'symptoms')}
                >
                  + Añadir Síntoma
                </button>
              )}
            </div>

            <div className="soap-section">
              <h3 className="soap-section-title">Fecha de Inicio</h3>
              <input
                type="date"
                className="soap-input"
                value={note.subjective.onset}
                onChange={(e) => handleSubjectiveChange('onset', e.target.value)}
                disabled={readOnly}
                aria-label="Fecha de Inicio"
                title="Fecha de Inicio de los Síntomas"
              />
            </div>

            <div className="soap-section">
              <h3 className="soap-section-title">Historia Médica Relevante</h3>
              <textarea
                className="soap-input soap-textarea"
                value={note.subjective.history}
                onChange={(e) => handleSubjectiveChange('history', e.target.value)}
                placeholder="Describa la historia médica relevante"
                disabled={readOnly}
              />
            </div>

            <div className="soap-section">
              <h3 className="soap-section-title">Factores Agravantes</h3>
              {note.subjective.aggravatingFactors.map((factor, index) => (
                <div key={index} className="soap-array-item">
                  <input
                    type="text"
                    className="soap-input"
                    value={factor}
                    onChange={(e) => handleArrayChange('subjective', 'aggravatingFactors', index, e.target.value)}
                    disabled={readOnly}
                    aria-label={`Factor Agravante ${index + 1}`}
                    placeholder="Describa el factor agravante"
                  />
                  {!readOnly && (
                    <button
                      className="soap-button"
                      onClick={() => removeArrayItem('subjective', 'aggravatingFactors', index)}
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <button
                  className="soap-button"
                  onClick={() => addArrayItem('subjective', 'aggravatingFactors')}
                >
                  + Añadir Factor Agravante
                </button>
              )}
            </div>

            <div className="soap-section">
              <h3 className="soap-section-title">Factores Aliviantes</h3>
              {note.subjective.relievingFactors.map((factor, index) => (
                <div key={index} className="soap-array-item">
                  <input
                    type="text"
                    className="soap-input"
                    value={factor}
                    onChange={(e) => handleArrayChange('subjective', 'relievingFactors', index, e.target.value)}
                    disabled={readOnly}
                    aria-label={`Factor Aliviante ${index + 1}`}
                    placeholder="Describa el factor aliviante"
                  />
                  {!readOnly && (
                    <button
                      className="soap-button"
                      onClick={() => removeArrayItem('subjective', 'relievingFactors', index)}
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <button
                  className="soap-button"
                  onClick={() => addArrayItem('subjective', 'relievingFactors')}
                >
                  + Añadir Factor Aliviante
                </button>
              )}
            </div>
          </div>
        )}
        
        {activeSection === 'O' && (
          <div className="objective-section">
            <div className="soap-section">
              <h3 className="soap-section-title">Observación</h3>
              <textarea
                className="soap-input soap-textarea"
                value={note.objective.observation}
                onChange={(e) => handleObjectiveChange('observation', e.target.value)}
                placeholder="Describa las observaciones generales del paciente"
                disabled={readOnly}
              />
            </div>

            <div className="soap-section">
              <h3 className="soap-section-title">Palpación</h3>
              <textarea
                className="soap-input soap-textarea"
                value={note.objective.palpation}
                onChange={(e) => handleObjectiveChange('palpation', e.target.value)}
                placeholder="Describa los hallazgos durante la palpación"
                disabled={readOnly}
              />
            </div>

            <div className="soap-section">
              <h3 className="soap-section-title">Pruebas Especiales</h3>
              {note.objective.specialTests.map((test, index) => (
                <div key={index} className="soap-test-item">
                  <input
                    type="text"
                    className="soap-input"
                    value={test.name}
                    onChange={(e) => {
                      const updatedTests = [...note.objective.specialTests];
                      updatedTests[index] = { ...test, name: e.target.value };
                      handleObjectiveChange('specialTests', updatedTests);
                    }}
                    placeholder="Nombre de la prueba"
                    disabled={readOnly}
                  />
                  <select
                    className="soap-input"
                    value={test.result}
                    onChange={(e) => {
                      const updatedTests = [...note.objective.specialTests];
                      updatedTests[index] = { ...test, result: e.target.value as 'positive' | 'negative' | 'inconclusive' };
                      handleObjectiveChange('specialTests', updatedTests);
                    }}
                    disabled={readOnly}
                    aria-label={`Resultado de la Prueba ${test.name || `Especial ${index + 1}`}`}
                    title={`Resultado de ${test.name || `Prueba Especial ${index + 1}`}`}
                  >
                    <option value="positive">Positivo</option>
                    <option value="negative">Negativo</option>
                    <option value="inconclusive">Inconcluso</option>
                  </select>
                  <input
                    type="text"
                    className="soap-input"
                    value={test.notes || ''}
                    onChange={(e) => {
                      const updatedTests = [...note.objective.specialTests];
                      updatedTests[index] = { ...test, notes: e.target.value };
                      handleObjectiveChange('specialTests', updatedTests);
                    }}
                    placeholder="Notas adicionales"
                    disabled={readOnly}
                  />
                  {!readOnly && (
                    <button
                      className="soap-button"
                      onClick={() => {
                        const updatedTests = [...note.objective.specialTests];
                        updatedTests.splice(index, 1);
                        handleObjectiveChange('specialTests', updatedTests);
                      }}
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <button
                  className="soap-button"
                  onClick={() => {
                    const updatedTests = [...note.objective.specialTests, { name: '', result: 'negative' as const, notes: '' }];
                    handleObjectiveChange('specialTests', updatedTests);
                  }}
                >
                  + Añadir Prueba Especial
                </button>
              )}
            </div>
          </div>
        )}
        
        {activeSection === 'A' && (
          <div className="assessment-section">
            <div className="soap-section">
              <h3 className="soap-section-title">Diagnóstico Principal</h3>
              <input
                type="text"
                className="soap-input"
                value={note.assessment.diagnoses.primary}
                onChange={(e) => {
                  const updatedDiagnoses = {
                    ...note.assessment.diagnoses,
                    primary: e.target.value
                  };
                  handleAssessmentChange('diagnoses', updatedDiagnoses);
                }}
                placeholder="Ingrese el diagnóstico principal"
                disabled={readOnly}
              />
            </div>

            <div className="soap-section">
              <h3 className="soap-section-title">Diagnósticos Diferenciales</h3>
              {note.assessment.diagnoses.differential.map((diagnosis, index) => (
                <div key={index} className="soap-array-item">
                  <input
                    type="text"
                    className="soap-input"
                    value={diagnosis}
                    onChange={(e) => {
                      const updatedDifferential = [...note.assessment.diagnoses.differential];
                      updatedDifferential[index] = e.target.value;
                      handleAssessmentChange('diagnoses', {
                        ...note.assessment.diagnoses,
                        differential: updatedDifferential
                      });
                    }}
                    disabled={readOnly}
                    aria-label={`Diagnóstico Diferencial ${index + 1}`}
                    placeholder="Describa el diagnóstico diferencial"
                  />
                  {!readOnly && (
                    <button
                      className="soap-button"
                      onClick={() => {
                        const updatedDifferential = [...note.assessment.diagnoses.differential];
                        updatedDifferential.splice(index, 1);
                        handleAssessmentChange('diagnoses', {
                          ...note.assessment.diagnoses,
                          differential: updatedDifferential
                        });
                      }}
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <button
                  className="soap-button"
                  onClick={() => {
                    handleAssessmentChange('diagnoses', {
                      ...note.assessment.diagnoses,
                      differential: [...note.assessment.diagnoses.differential, '']
                    });
                  }}
                >
                  + Añadir Diagnóstico Diferencial
                </button>
              )}
            </div>

            <div className="soap-section">
              <h3 className="soap-section-title">Razonamiento Clínico</h3>
              <textarea
                className="soap-input soap-textarea"
                value={note.assessment.clinicalReasoning}
                onChange={(e) => handleAssessmentChange('clinicalReasoning', e.target.value)}
                placeholder="Explique el razonamiento clínico que sustenta el diagnóstico"
                disabled={readOnly}
              />
            </div>

            <div className="soap-section">
              <h3 className="soap-section-title">Limitaciones Funcionales</h3>
              {note.assessment.functionalLimitations.map((limitation, index) => (
                <div key={index} className="soap-array-item">
                  <input
                    type="text"
                    className="soap-input"
                    value={limitation}
                    onChange={(e) => handleArrayChange('assessment', 'functionalLimitations', index, e.target.value)}
                    disabled={readOnly}
                    aria-label={`Limitación Funcional ${index + 1}`}
                    placeholder="Describa la limitación funcional"
                  />
                  {!readOnly && (
                    <button
                      className="soap-button"
                      onClick={() => removeArrayItem('assessment', 'functionalLimitations', index)}
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <button
                  className="soap-button"
                  onClick={() => addArrayItem('assessment', 'functionalLimitations')}
                >
                  + Añadir Limitación Funcional
                </button>
              )}
            </div>

            <div className="soap-section">
              <h3 className="soap-section-title">Pronóstico</h3>
              <textarea
                className="soap-input soap-textarea"
                value={note.assessment.prognosis}
                onChange={(e) => handleAssessmentChange('prognosis', e.target.value)}
                placeholder="Describa el pronóstico del paciente"
                disabled={readOnly}
              />
            </div>
          </div>
        )}
        
        {activeSection === 'P' && (
          <div className="plan-section">
            <div className="soap-section">
              <h3 className="soap-section-title">Objetivos a Corto Plazo</h3>
              {note.plan.shortTermGoals.map((goal, index) => (
                <div key={index} className="soap-array-item">
                  <input
                    type="text"
                    className="soap-input"
                    value={goal}
                    onChange={(e) => handleArrayChange('plan', 'shortTermGoals', index, e.target.value)}
                    disabled={readOnly}
                    aria-label={`Objetivo a Corto Plazo ${index + 1}`}
                    placeholder="Describa el objetivo a corto plazo"
                  />
                  {!readOnly && (
                    <button
                      className="soap-button"
                      onClick={() => removeArrayItem('plan', 'shortTermGoals', index)}
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <button
                  className="soap-button"
                  onClick={() => addArrayItem('plan', 'shortTermGoals')}
                >
                  + Añadir Objetivo a Corto Plazo
                </button>
              )}
            </div>

            <div className="soap-section">
              <h3 className="soap-section-title">Objetivos a Largo Plazo</h3>
              {note.plan.longTermGoals.map((goal, index) => (
                <div key={index} className="soap-array-item">
                  <input
                    type="text"
                    className="soap-input"
                    value={goal}
                    onChange={(e) => handleArrayChange('plan', 'longTermGoals', index, e.target.value)}
                    disabled={readOnly}
                    aria-label={`Objetivo a Largo Plazo ${index + 1}`}
                    placeholder="Describa el objetivo a largo plazo"
                  />
                  {!readOnly && (
                    <button
                      className="soap-button"
                      onClick={() => removeArrayItem('plan', 'longTermGoals', index)}
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <button
                  className="soap-button"
                  onClick={() => addArrayItem('plan', 'longTermGoals')}
                >
                  + Añadir Objetivo a Largo Plazo
                </button>
              )}
            </div>

            <div className="soap-section">
              <h3 className="soap-section-title">Intervenciones</h3>
              {note.plan.interventions.map((intervention, index) => (
                <div key={index} className="soap-intervention-item">
                  <input
                    type="text"
                    className="soap-input"
                    value={intervention.type}
                    onChange={(e) => {
                      const updatedInterventions = [...note.plan.interventions];
                      updatedInterventions[index] = { ...intervention, type: e.target.value };
                      handlePlanChange('interventions', updatedInterventions);
                    }}
                    placeholder="Tipo de intervención"
                    disabled={readOnly}
                  />
                  <input
                    type="text"
                    className="soap-input"
                    value={intervention.description}
                    onChange={(e) => {
                      const updatedInterventions = [...note.plan.interventions];
                      updatedInterventions[index] = { ...intervention, description: e.target.value };
                      handlePlanChange('interventions', updatedInterventions);
                    }}
                    placeholder="Descripción"
                    disabled={readOnly}
                  />
                  <input
                    type="text"
                    className="soap-input"
                    value={intervention.frequency}
                    onChange={(e) => {
                      const updatedInterventions = [...note.plan.interventions];
                      updatedInterventions[index] = { ...intervention, frequency: e.target.value };
                      handlePlanChange('interventions', updatedInterventions);
                    }}
                    placeholder="Frecuencia"
                    disabled={readOnly}
                  />
                  <input
                    type="text"
                    className="soap-input"
                    value={intervention.duration}
                    onChange={(e) => {
                      const updatedInterventions = [...note.plan.interventions];
                      updatedInterventions[index] = { ...intervention, duration: e.target.value };
                      handlePlanChange('interventions', updatedInterventions);
                    }}
                    placeholder="Duración"
                    disabled={readOnly}
                  />
                  {!readOnly && (
                    <button
                      className="soap-button"
                      onClick={() => {
                        const updatedInterventions = [...note.plan.interventions];
                        updatedInterventions.splice(index, 1);
                        handlePlanChange('interventions', updatedInterventions);
                      }}
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <button
                  className="soap-button"
                  onClick={() => {
                    handlePlanChange('interventions', [
                      ...note.plan.interventions,
                      { type: '', description: '', frequency: '', duration: '' }
                    ]);
                  }}
                >
                  + Añadir Intervención
                </button>
              )}
            </div>

            <div className="soap-section">
              <h3 className="soap-section-title">Ejercicios para Casa</h3>
              {note.plan.homeExercises.map((exercise, index) => (
                <div key={index} className="soap-exercise-item">
                  <input
                    type="text"
                    className="soap-input"
                    value={exercise.name}
                    onChange={(e) => {
                      const updatedExercises = [...note.plan.homeExercises];
                      updatedExercises[index] = { ...exercise, name: e.target.value };
                      handlePlanChange('homeExercises', updatedExercises);
                    }}
                    placeholder="Nombre del ejercicio"
                    disabled={readOnly}
                  />
                  <div className="soap-exercise-params">
                    <input
                      type="number"
                      className="soap-input"
                      value={exercise.sets}
                      onChange={(e) => {
                        const updatedExercises = [...note.plan.homeExercises];
                        updatedExercises[index] = { ...exercise, sets: parseInt(e.target.value) };
                        handlePlanChange('homeExercises', updatedExercises);
                      }}
                      placeholder="Series"
                      disabled={readOnly}
                    />
                    <input
                      type="number"
                      className="soap-input"
                      value={exercise.reps}
                      onChange={(e) => {
                        const updatedExercises = [...note.plan.homeExercises];
                        updatedExercises[index] = { ...exercise, reps: parseInt(e.target.value) };
                        handlePlanChange('homeExercises', updatedExercises);
                      }}
                      placeholder="Repeticiones"
                      disabled={readOnly}
                    />
                    <input
                      type="text"
                      className="soap-input"
                      value={exercise.frequency}
                      onChange={(e) => {
                        const updatedExercises = [...note.plan.homeExercises];
                        updatedExercises[index] = { ...exercise, frequency: e.target.value };
                        handlePlanChange('homeExercises', updatedExercises);
                      }}
                      placeholder="Frecuencia"
                      disabled={readOnly}
                    />
                  </div>
                  <textarea
                    className="soap-input soap-textarea"
                    value={exercise.instructions}
                    onChange={(e) => {
                      const updatedExercises = [...note.plan.homeExercises];
                      updatedExercises[index] = { ...exercise, instructions: e.target.value };
                      handlePlanChange('homeExercises', updatedExercises);
                    }}
                    placeholder="Instrucciones detalladas"
                    disabled={readOnly}
                  />
                  {!readOnly && (
                    <button
                      className="soap-button"
                      onClick={() => {
                        const updatedExercises = [...note.plan.homeExercises];
                        updatedExercises.splice(index, 1);
                        handlePlanChange('homeExercises', updatedExercises);
                      }}
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <button
                  className="soap-button"
                  onClick={() => {
                    handlePlanChange('homeExercises', [
                      ...note.plan.homeExercises,
                      { name: '', sets: 0, reps: 0, frequency: '', instructions: '' }
                    ]);
                  }}
                >
                  + Añadir Ejercicio
                </button>
              )}
            </div>

            <div className="soap-section">
              <h3 className="soap-section-title">Próxima Visita</h3>
              <input
                type="date"
                className="soap-input"
                value={note.plan.nextVisit instanceof Date ? note.plan.nextVisit.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  handlePlanChange('nextVisit', new Date(e.target.value));
                }}
                disabled={readOnly}
                aria-label="Fecha de Próxima Visita"
                title="Fecha de la Próxima Visita"
              />
            </div>

            <div className="soap-section">
              <h3 className="soap-section-title">Recomendaciones</h3>
              {note.plan.recommendations.map((recommendation, index) => (
                <div key={index} className="soap-array-item">
                  <input
                    type="text"
                    className="soap-input"
                    value={recommendation}
                    onChange={(e) => handleArrayChange('plan', 'recommendations', index, e.target.value)}
                    disabled={readOnly}
                    aria-label={`Recomendación ${index + 1}`}
                    placeholder="Describa la recomendación"
                  />
                  {!readOnly && (
                    <button
                      className="soap-button"
                      onClick={() => removeArrayItem('plan', 'recommendations', index)}
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <button
                  className="soap-button"
                  onClick={() => addArrayItem('plan', 'recommendations')}
                >
                  + Añadir Recomendación
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="soap-actions">
        <button 
          className="soap-button"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button 
          className="soap-button"
          onClick={handleSave}
          disabled={readOnly}
        >
          Guardar
        </button>
      </div>
    </div>
  );
};

export default SOAPNoteForm;