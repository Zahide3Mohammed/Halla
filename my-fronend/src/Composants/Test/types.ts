
export interface Question {
  id: number;
  text: string;
  category: 'Extraversion' | 'Agreeableness' | 'Conscientiousness' | 'Emotional Stability' | 'Openness';
}

export interface UserAnswer {
  questionId: number;
  value: number; // -3 to 3
}

export interface PersonalityResult {
  title: string;
  summary: string;
  traits: {
    name: string;
    description: string;
    score: number;
  }[];
  advice: string;
}

export enum AppState {
  LANDING = 'LANDING',
  QUIZ = 'QUIZ',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT'
}