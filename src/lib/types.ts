
import type { GenerateBilingualQuestionsOutput, GenerateBilingualQuestionsInput } from '@/ai/flows/generate-bilingual-questions';
import type { SuggestDifferentialDiagnosesOutput, SuggestDifferentialDiagnosesInput } from '@/ai/flows/suggest-differential-diagnoses';
import type { SynthesizeBilingualSOAPNoteOutput, SynthesizeBilingualSOAPNoteInput } from '@/ai/flows/synthesize-bilingual-soap-note';
import type { FormulateBilingualTreatmentPlanOutput, FormulateBilingualTreatmentPlanInput } from '@/ai/flows/formulate-bilingual-treatment-plan';
import { z } from 'genkit';
import type { GenerateNextQuestionOutput, GenerateNextQuestionInput } from '@/ai/flows/generate-next-question';

export type ApiKeyInput = {
  apiKey: string;
};

export type PatientDetails = {
  name: string;
  familyName?: string;
  fatherName?: string;
  dob: string;
  age?: number;
  gender: 'male' | 'female' | 'other';
  perspective: 'first-person' | 'third-person';
  
  ward?: string;
  room?: string;
  bed?: string;
  dateOfAdmission: string;
  attendingPhysician?: string;

  chiefComplaint: string;

  bp?: string;
  rr?: string;
  pr?: string;
  spo2?: string;
  
  eyeColor?: string;
  skinColor?: string;
  bruises?: string;
  rashUlcers?: string;

  pastMedicalHistory?: string;
  pastSurgicalHistory?: string;
  medication?: string;
  familyHistory?: string;
};

export type Message = {
    id: string;
    type: 'question' | 'answer';
    english: string;
    persian?: string;
    translation?: string;
    options?: { english: string; persian: string }[];
};


export type Question = GenerateNextQuestionOutput['nextQuestion'] & { id: string };

export type Answer = {
  questionId: string;
  text: string;
};

export type SoapNote = SynthesizeBilingualSOAPNoteOutput;
export type DifferentialDiagnoses = SuggestDifferentialDiagnosesOutput;
export type TreatmentPlan = FormulateBilingualTreatmentPlanOutput;

export type HistoryEntry = {
  id: string;
  timestamp: string;
  patientDetails: PatientDetails;
  soapNote: SoapNote;
  ddx: DifferentialDiagnoses;
  treatmentPlan: TreatmentPlan;
};

    