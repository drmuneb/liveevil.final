import type { GenerateBilingualQuestionsOutput } from '@/ai/flows/generate-bilingual-questions';
import type { SuggestDifferentialDiagnosesOutput } from '@/ai/flows/suggest-differential-diagnoses';
import type { SynthesizeBilingualSOAPNoteOutput } from '@/ai/flows/synthesize-bilingual-soap-note';
import type { FormulateBilingualTreatmentPlanOutput } from '@/ai/flows/formulate-bilingual-treatment-plan';
import { z } from 'genkit';

export type PatientDetails = {
  name: string;
  familyName: string;
  fatherName: string;
  dob: string;
  age?: number;
  gender: 'male' | 'female' | 'other';
  
  ward: string;
  room: string;
  bed: string;
  dateOfAdmission: string;
  attendingPhysician: string;

  chiefComplaint: string;

  bp: string;
  rr: string;
  pr: string;
  spo2: string;
  
  eyeColor: string;
  skinColor: string;
  bruises: string;
  rashUlcers: string;

  pastMedicalHistory: string;
  pastSurgicalHistory: string;
  medication: string;
  familyHistory: string;
};

const ConversationHistorySchema = z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
}));

export const GenerateNextQuestionInputSchema = z.object({
  patientInformation: z.string().describe('Comprehensive patient details including history, demographics, and relevant medical background.'),
  conversationHistory: ConversationHistorySchema.describe('The history of the conversation so far.'),
});
export type GenerateNextQuestionInput = z.infer<typeof GenerateNextQuestionInputSchema>;

export const GenerateNextQuestionOutputSchema = z.object({
  nextQuestion: z.object({
      english: z.string().describe('The next question in English.'),
      persian: z.string().describe('The next question in Persian (Farsi).'),
      options: z.array(z.object({
          english: z.string().describe('An option in English'),
          persian: z.string().describe('The same option in Persian'),
      })).optional().describe('An optional list of multiple-choice answers.'),
  }).optional(),
  isComplete: z.boolean().describe('Set to true when you have enough information to make a diagnosis.'),
});
export type GenerateNextQuestionOutput = z.infer<typeof GenerateNextQuestionOutputSchema>;

export type Question = GenerateNextQuestionOutput['nextQuestion'] & { id: string };

export type Answer = {
  questionId: string;
  text: string;
};

export type SoapNote = SynthesizeBilingualSOAPNoteOutput;
export type DifferentialDiagnoses = SuggestDifferentialDiagnosesOutput;
export type TreatmentPlan = FormulateBilingualTreatmentPlanOutput;
