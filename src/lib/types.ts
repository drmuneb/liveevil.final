import type { GenerateBilingualQuestionsOutput } from '@/ai/flows/generate-bilingual-questions';
import type { SuggestDifferentialDiagnosesOutput } from '@/ai/flows/suggest-differential-diagnoses';
import type { SynthesizeBilingualSOAPNoteOutput } from '@/ai/flows/synthesize-bilingual-soap-note';
import type { FormulateBilingualTreatmentPlanOutput } from '@/ai/flows/formulate-bilingual-treatment-plan';

export type PatientDetails = {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  dob: Date;
  chiefComplaint: string;
  consciousnessLevel: 'Alert' | 'Drowsy' | 'Unresponsive';
};

export type Question = GenerateBilingualQuestionsOutput['questions'][0] & { id: string };

export type Answer = {
  questionId: string;
  text: string;
};

export type SoapNote = SynthesizeBilingualSOAPNoteOutput;
export type DifferentialDiagnoses = SuggestDifferentialDiagnosesOutput;
export type TreatmentPlan = FormulateBilingualTreatmentPlanOutput;
