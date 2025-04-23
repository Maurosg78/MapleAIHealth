import { TherapeuticExercise, ExerciseFilter, ExercisePlan, AnatomicalRegion, ExerciseCategoryType, ExerciseDifficultyLevel, ExerciseExecutionType, MovementDirection, ExerciseEquipment } from '../types/treatment/exercises';;;;;

// Clave para almacenar los ejercicios en localStorage
const EXERCISES_STORAGE_KEY = 'mapleHealth_exercises';
const EXERCISE_PLANS_STORAGE_KEY = 'mapleHealth_exercisePlans';

/**
 * Servicio para gestionar la biblioteca de ejercicios terapéuticos
 */
export const exerciseService = {
  /**
   * Obtener todos los ejercicios terapéuticos
   */
  getAllExercises(): TherapeuticExercise[] {
    try {
      const storedData = localStorage.getItem(EXERCISES_STORAGE_KEY);
      if (!storedData) return mockExercises;
      
      return JSON.parse(storedData);
    } catch (error) {
      console.error('Error al obtener ejercicios:', error);
      return mockExercises;
    }
  },

  /**
   * Obtener un ejercicio específico por su ID
   */
  getExerciseById(id: string): TherapeuticExercise | null {
    try {
      const exercises = this.getAllExercises();
      return exercises.find(exercise => exercise.id === id) || null;
    } catch (error) {
      console.error(`Error al obtener el ejercicio con ID ${id}:`, error);
      return null;
    }
  },

  /**
   * Guardar un nuevo ejercicio
   */
  saveExercise(exerciseData: Omit<TherapeuticExercise, 'id'>): TherapeuticExercise {
    try {
      const exercises = this.getAllExercises();
      
      const newExercise: TherapeuticExercise = {
        ...exerciseData,
        id: Date.now().toString(), // ID único basado en timestamp
      };
      
      const updatedExercises = [...exercises, newExercise];
      localStorage.setItem(EXERCISES_STORAGE_KEY, JSON.stringify(updatedExercises));
      
      return newExercise;
    } catch (error) {
      console.error('Error al guardar ejercicio:', error);
      throw new Error('No se pudo guardar el ejercicio');
    }
  },

  /**
   * Actualizar un ejercicio existente
   */
  updateExercise(id: string, updates: Partial<TherapeuticExercise>): TherapeuticExercise {
    try {
      const exercises = this.getAllExercises();
      const exerciseIndex = exercises.findIndex(exercise => exercise.id === id);
      
      if (exerciseIndex === -1) {
        throw new Error(`No se encontró ningún ejercicio con ID ${id}`);
      }
      
      const updatedExercise: TherapeuticExercise = {
        ...exercises[exerciseIndex],
        ...updates,
      };
      
      exercises[exerciseIndex] = updatedExercise;
      localStorage.setItem(EXERCISES_STORAGE_KEY, JSON.stringify(exercises));
      
      return updatedExercise;
    } catch (error) {
      console.error(`Error al actualizar ejercicio con ID ${id}:`, error);
      throw new Error('No se pudo actualizar el ejercicio');
    }
  },

  /**
   * Eliminar un ejercicio
   */
  deleteExercise(id: string): boolean {
    try {
      const exercises = this.getAllExercises();
      const updatedExercises = exercises.filter(exercise => exercise.id !== id);
      
      if (updatedExercises.length === exercises.length) {
        return false;
      }
      
      localStorage.setItem(EXERCISES_STORAGE_KEY, JSON.stringify(updatedExercises));
      return true;
    } catch (error) {
      console.error(`Error al eliminar ejercicio con ID ${id}:`, error);
      return false;
    }
  },

  /**
   * Filtrar ejercicios según criterios
   */
  filterExercises(filters: ExerciseFilter): TherapeuticExercise[] {
    try {
      let exercises = this.getAllExercises();
      
      // Aplicar filtros
      if (filters.bodyRegion && filters.bodyRegion.length > 0) {
        exercises = exercises.filter(exercise => 
          filters.bodyRegion?.includes(exercise.bodyRegion)
        );
      }
      
      if (filters.category && filters.category.length > 0) {
        exercises = exercises.filter(exercise => 
          filters.category?.includes(exercise.category)
        );
      }
      
      if (filters.difficulty && filters.difficulty.length > 0) {
        exercises = exercises.filter(exercise => 
          filters.difficulty?.includes(exercise.difficulty)
        );
      }
      
      if (filters.executionType && filters.executionType.length > 0) {
        exercises = exercises.filter(exercise => 
          filters.executionType?.includes(exercise.executionType)
        );
      }
      
      if (filters.equipment && filters.equipment.length > 0) {
        exercises = exercises.filter(exercise => 
          exercise.equipment.some(equip => filters.equipment?.includes(equip))
        );
      }
      
      if (filters.specialty && filters.specialty.length > 0) {
        exercises = exercises.filter(exercise => 
          exercise.specialties.some(spec => filters.specialty?.includes(spec))
        );
      }
      
      if (filters.tags && filters.tags.length > 0) {
        exercises = exercises.filter(exercise => 
          exercise.tags.some(tag => filters.tags?.includes(tag))
        );
      }
      
      if (filters.searchTerm && filters.searchTerm.trim() !== '') {
        const searchTermLower = filters.searchTerm.toLowerCase().trim();
        exercises = exercises.filter(exercise => 
          exercise.name.toLowerCase().includes(searchTermLower) ||
          exercise.description.toLowerCase().includes(searchTermLower) ||
          exercise.tags.some(tag => tag.toLowerCase().includes(searchTermLower))
        );
      }
      
      return exercises;
    } catch (error) {
      console.error('Error al filtrar ejercicios:', error);
      return [];
    }
  },

  /**
   * Obtener todos los planes de ejercicios
   */
  getAllExercisePlans(): ExercisePlan[] {
    try {
      const storedData = localStorage.getItem(EXERCISE_PLANS_STORAGE_KEY);
      if (!storedData) return [];
      
      return JSON.parse(storedData);
    } catch (error) {
      console.error('Error al obtener planes de ejercicios:', error);
      return [];
    }
  },

  /**
   * Obtener planes de ejercicios para un paciente específico
   */
  getPatientExercisePlans(patientId: string): ExercisePlan[] {
    try {
      const plans = this.getAllExercisePlans();
      return plans.filter(plan => plan.patientId === patientId);
    } catch (error) {
      console.error(`Error al obtener planes para el paciente ${patientId}:`, error);
      return [];
    }
  },

  /**
   * Obtener un plan de ejercicios específico por su ID
   */
  getExercisePlanById(id: string): ExercisePlan | null {
    try {
      const plans = this.getAllExercisePlans();
      return plans.find(plan => plan.id === id) || null;
    } catch (error) {
      console.error(`Error al obtener el plan con ID ${id}:`, error);
      return null;
    }
  },

  /**
   * Guardar un nuevo plan de ejercicios
   */
  saveExercisePlan(planData: Omit<ExercisePlan, 'id' | 'createdAt' | 'updatedAt'>): ExercisePlan {
    try {
      const plans = this.getAllExercisePlans();
      
      const now = new Date().toISOString();
      const newPlan: ExercisePlan = {
        ...planData,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now
      };
      
      const updatedPlans = [...plans, newPlan];
      localStorage.setItem(EXERCISE_PLANS_STORAGE_KEY, JSON.stringify(updatedPlans));
      
      return newPlan;
    } catch (error) {
      console.error('Error al guardar plan de ejercicios:', error);
      throw new Error('No se pudo guardar el plan de ejercicios');
    }
  },

  /**
   * Actualizar un plan de ejercicios existente
   */
  updateExercisePlan(id: string, updates: Partial<ExercisePlan>): ExercisePlan {
    try {
      const plans = this.getAllExercisePlans();
      const planIndex = plans.findIndex(plan => plan.id === id);
      
      if (planIndex === -1) {
        throw new Error(`No se encontró ningún plan con ID ${id}`);
      }
      
      const updatedPlan: ExercisePlan = {
        ...plans[planIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      plans[planIndex] = updatedPlan;
      localStorage.setItem(EXERCISE_PLANS_STORAGE_KEY, JSON.stringify(plans));
      
      return updatedPlan;
    } catch (error) {
      console.error(`Error al actualizar plan con ID ${id}:`, error);
      throw new Error('No se pudo actualizar el plan de ejercicios');
    }
  },

  /**
   * Eliminar un plan de ejercicios
   */
  deleteExercisePlan(id: string): boolean {
    try {
      const plans = this.getAllExercisePlans();
      const updatedPlans = plans.filter(plan => plan.id !== id);
      
      if (updatedPlans.length === plans.length) {
        return false;
      }
      
      localStorage.setItem(EXERCISE_PLANS_STORAGE_KEY, JSON.stringify(updatedPlans));
      return true;
    } catch (error) {
      console.error(`Error al eliminar plan con ID ${id}:`, error);
      return false;
    }
  }
};

// Datos de ejemplo para la biblioteca de ejercicios
const mockExercises: TherapeuticExercise[] = [
  {
    id: '1',
    name: 'Puente de cadera',
    description: 'Ejercicio para fortalecer los glúteos y estabilizadores lumbares',
    instructions: [
      'Acuéstese boca arriba con las rodillas dobladas y los pies apoyados en el suelo',
      'Contraiga los músculos abdominales y glúteos',
      'Levante las caderas del suelo creando una línea recta desde los hombros hasta las rodillas',
      'Mantenga la posición 3-5 segundos y baje lentamente'
    ],
    bodyRegion: AnatomicalRegion.LUMBAR,
    category: ExerciseCategoryType.STRENGTH,
    difficulty: ExerciseDifficultyLevel.BEGINNER,
    executionType: ExerciseExecutionType.ACTIVE,
    movementDirection: [MovementDirection.EXTENSION],
    equipment: [ExerciseEquipment.MAT],
    contraindications: ['Hernia discal aguda', 'Dolor lumbar agudo'],
    precautions: ['Evitar hiperextensión lumbar'],
    imagePath: '/images/exercises/bridge.jpg',
    specialties: ['physiotherapy'],
    tags: ['lumbar', 'estabilidad', 'core', 'glúteos'],
    evidenceLevel: 'A - Evidencia fuerte',
    evidenceReference: 'Hides, J.A., et al. (2001). Long-term effects of specific stabilizing exercises for first-episode low back pain. Spine, 26(11), E243-E248.'
  },
  {
    id: '2',
    name: 'Ejercicio McKenzie - Extensión en prono',
    description: 'Ejercicio de extensión lumbar para centralización del dolor',
    instructions: [
      'Acuéstese boca abajo con las manos apoyadas a nivel de los hombros',
      'Manteniendo la pelvis en contacto con el suelo, extienda los codos gradualmente levantando el tronco',
      'Mantenga la posición final 1-2 segundos y vuelva lentamente a la posición inicial',
      'Repita el movimiento de forma progresiva'
    ],
    bodyRegion: AnatomicalRegion.LUMBAR,
    category: ExerciseCategoryType.RANGE_OF_MOTION,
    difficulty: ExerciseDifficultyLevel.BEGINNER,
    executionType: ExerciseExecutionType.ACTIVE,
    movementDirection: [MovementDirection.EXTENSION],
    equipment: [ExerciseEquipment.MAT],
    contraindications: ['Estenosis lumbar', 'Espondilolistesis'],
    precautions: ['Dolor irradiado que aumenta', 'Sensación de pinzamiento'],
    imagePath: '/images/exercises/mckenzie.jpg',
    specialties: ['physiotherapy'],
    tags: ['lumbar', 'McKenzie', 'extensión', 'hernia'],
    evidenceLevel: 'A - Evidencia fuerte',
    evidenceReference: 'Garcia AN, et al. (2018). McKenzie Method of Mechanical Diagnosis and Therapy was slightly more effective than placebo for pain, but not for disability, in patients with chronic non-specific low back pain: a randomised placebo controlled trial. J Physiother, 64(2), 94-100.'
  },
  {
    id: '3',
    name: 'Ejercicios de control cervical profundo',
    description: 'Ejercicio para fortalecer los flexores cervicales profundos',
    instructions: [
      'Acuéstese boca arriba con una toalla pequeña bajo la cabeza',
      'Realice un movimiento suave de "sí" con la cabeza, llevando el mentón ligeramente hacia el pecho',
      'Mantenga la contracción 10 segundos respirando normalmente',
      'Relaje y repita sin compensar con musculatura superficial'
    ],
    bodyRegion: AnatomicalRegion.CERVICAL,
    category: ExerciseCategoryType.STABILITY,
    difficulty: ExerciseDifficultyLevel.INTERMEDIATE,
    executionType: ExerciseExecutionType.ISOMETRIC,
    movementDirection: [MovementDirection.FLEXION],
    equipment: [ExerciseEquipment.PILLOW],
    precautions: ['Evitar usar esternocleidomastoideo', 'Dolor irradiado'],
    imagePath: '/images/exercises/deep_neck_flexors.jpg',
    specialties: ['physiotherapy'],
    tags: ['cervical', 'cefalea', 'control motor', 'flexores profundos'],
    evidenceLevel: 'A - Evidencia fuerte',
    evidenceReference: 'Jull G, et al. (2009). Cervical spine physiotherapy: approaches to the neck. Grieve\'s Modern Manual Therapy, 291-301.'
  }
];

export default exerciseService; 