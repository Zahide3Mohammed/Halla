
import { Question } from './types';

export const QUESTIONS: Question[] = [
  { id: 1, text: "I am the life of the party.", category: 'Extraversion' },
  { id: 2, text: "I feel little concern for others.", category: 'Agreeableness' },
  { id: 3, text: "I am always prepared.", category: 'Conscientiousness' },
  { id: 4, text: "I get stressed out easily.", category: 'Emotional Stability' },
  { id: 5, text: "I have a rich vocabulary.", category: 'Openness' },
  { id: 6, text: "I don't talk a lot.", category: 'Extraversion' },
  { id: 7, text: "I am interested in people.", category: 'Agreeableness' },
  { id: 8, text: "I leave my belongings around.", category: 'Conscientiousness' },
  { id: 9, text: "I am relaxed most of the time.", category: 'Emotional Stability' },
  { id: 10, text: "I have difficulty understanding abstract ideas.", category: 'Openness' }
];

export const RESPONSE_LABELS = [
  { value: -3, label: "Strongly Disagree", sub: "Ghayr Motafiq", size: "size-16 md:size-20" },
  { value: -2, label: "Disagree", sub: "", size: "size-12 md:size-14" },
  { value: -1, label: "Inclined", sub: "", size: "size-10 md:size-11" },
  { value: 0, label: "Neutral", sub: "", size: "size-8 md:size-9" },
  { value: 1, label: "Inclined", sub: "", size: "size-10 md:size-11" },
  { value: 2, label: "Agree", sub: "", size: "size-12 md:size-14" },
  { value: 3, label: "Strongly Agree", sub: "Motafiq", size: "size-16 md:size-20" },
];
