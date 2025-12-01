
export enum AppStep {
  DIAGNOSIS = 'DIAGNOSIS',
  INPUT_TOPIC = 'INPUT_TOPIC',
  SELECT_PILLAR = 'SELECT_PILLAR',
  SELECT_VARIATION = 'SELECT_VARIATION',
  COURSE_VIEW = 'COURSE_VIEW',
}

export interface CourseContent {
  title: string;
  markdown: string;
}

export type UserLevel = 'Principiante' | 'Intermedio' | 'Avanzado';

export interface DiagnosisQuestion {
  id: number;
  question: string;
  options: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface StepState {
  currentStep: AppStep;
  userLevel: UserLevel | null;
  topic: string;
  selectedPillar: string;
  selectedVariation: string;
  pillars: string[];
  variations: string[];
  course: CourseContent | null;
  isLoading: boolean;
  error: string | null;
  diagnosisQuestions: DiagnosisQuestion[];
}
