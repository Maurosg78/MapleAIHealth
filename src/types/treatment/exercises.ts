import { SpecialtyType } from '../clinical';;;;;

/**
 * Categorías de ejercicios terapéuticos
 */
export enum ExerciseCategoryType {
  STRENGTH = 'strength',
  FLEXIBILITY = 'flexibility',
  BALANCE = 'balance',
  COORDINATION = 'coordination',
  AEROBIC = 'aerobic',
  FUNCTIONAL = 'functional',
  POSTURAL = 'postural',
  NEUROMUSCULAR = 'neuromuscular',
  PROPRIOCEPTION = 'proprioception',
  RANGE_OF_MOTION = 'range_of_motion',
  STABILITY = 'stability'
}

/**
 * Niveles de dificultad de ejercicios
 */
export enum ExerciseDifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

/**
 * Modalidades de ejecución de ejercicios
 */
export enum ExerciseExecutionType {
  ACTIVE = 'active',
  PASSIVE = 'passive',
  ACTIVE_ASSISTED = 'active_assisted',
  ISOMETRIC = 'isometric',
  ECCENTRIC = 'eccentric',
  CONCENTRIC = 'concentric',
  PLYOMETRIC = 'plyometric'
}

/**
 * Regiones anatómicas para organizar ejercicios
 */
export enum AnatomicalRegion {
  CERVICAL = 'cervical',
  THORACIC = 'thoracic',
  LUMBAR = 'lumbar',
  SHOULDER = 'shoulder',
  ELBOW = 'elbow',
  WRIST_HAND = 'wrist_hand',
  HIP = 'hip',
  KNEE = 'knee',
  ANKLE_FOOT = 'ankle_foot',
  GLOBAL = 'global'
}

/**
 * Dirección de movimiento del ejercicio
 */
export enum MovementDirection {
  FLEXION = 'flexion',
  EXTENSION = 'extension',
  ABDUCTION = 'abduction',
  ADDUCTION = 'adduction',
  ROTATION_INTERNAL = 'rotation_internal',
  ROTATION_EXTERNAL = 'rotation_external',
  SUPINATION = 'supination',
  PRONATION = 'pronation',
  ELEVATION = 'elevation',
  DEPRESSION = 'depression',
  RETRACTION = 'retraction',
  PROTRACTION = 'protraction',
  INVERSION = 'inversion',
  EVERSION = 'eversion',
  DORSIFLEXION = 'dorsiflexion',
  PLANTARFLEXION = 'plantarflexion',
  LATERAL_FLEXION = 'lateral_flexion',
  CIRCUMDUCTION = 'circumduction'
}

/**
 * Equipamiento necesario para realizar el ejercicio
 */
export enum ExerciseEquipment {
  NONE = 'none',
  RESISTANCE_BAND = 'resistance_band',
  WEIGHTS = 'weights',
  SWISS_BALL = 'swiss_ball',
  FOAM_ROLLER = 'foam_roller',
  BOSU = 'bosu',
  TRX = 'trx',
  BALANCE_BOARD = 'balance_board',
  MAT = 'mat',
  MEDICINE_BALL = 'medicine_ball',
  KETTLEBELL = 'kettlebell',
  WALL = 'wall',
  CHAIR = 'chair',
  PILLOW = 'pillow',
  BAR = 'bar',
  STEP = 'step'
}

/**
 * Interfaz para un ejercicio terapéutico
 */
export interface TherapeuticExercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  bodyRegion: AnatomicalRegion;
  category: ExerciseCategoryType;
  difficulty: ExerciseDifficultyLevel;
  executionType: ExerciseExecutionType;
  movementDirection: MovementDirection[];
  equipment: ExerciseEquipment[];
  contraindications?: string[];
  precautions?: string[];
  imagePath?: string;
  videoUrl?: string;
  specialties: SpecialtyType[];
  tags: string[];
  evidenceLevel?: string;
  evidenceReference?: string;
}

/**
 * Interfaz para la configuración de un ejercicio en un plan de tratamiento
 */
export interface ExercisePrescription {
  exerciseId: string;
  sets: number;
  reps: number;
  duration?: number; // En segundos
  frequency: string;
  intensity?: string;
  notes?: string;
  progression?: string;
  modification?: string;
}

/**
 * Interfaz para un plan de ejercicios
 */
export interface ExercisePlan {
  id: string;
  patientId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  exercises: ExercisePrescription[];
  frequency: string;
  duration: string;
  notes?: string;
  goals: string[];
}

/**
 * Interfaz para filtrar ejercicios
 */
export interface ExerciseFilter {
  bodyRegion?: AnatomicalRegion[];
  category?: ExerciseCategoryType[];
  difficulty?: ExerciseDifficultyLevel[];
  executionType?: ExerciseExecutionType[];
  equipment?: ExerciseEquipment[];
  specialty?: SpecialtyType[];
  searchTerm?: string;
  tags?: string[];
} 