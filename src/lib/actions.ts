'use server';

import {
  generateBilingualQuestions,
  type GenerateBilingualQuestionsInput,
} from '@/ai/flows/generate-bilingual-questions';
import {formulateBilingualTreatmentPlan} from '@/ai/flows/formulate-bilingual-treatment-plan';
import {suggestDifferentialDiagnoses} from '@/ai/flows/suggest-differential-diagnoses';
import {
  synthesizeBilingualSOAPNote,
  type SynthesizeBilingualSOAPNoteInput,
} from '@/ai/flows/synthesize-bilingual-soap-note';
import {
  translateInput,
  type TranslateInputInput,
} from '@/ai/flows/translate-user-inputs-dynamically';
import {
  analyzePatientDocument,
  type AnalyzePatientDocumentInput,
} from '@/ai/flows/analyze-patient-document';
import {
  generateNextQuestion,
  type GenerateNextQuestionInput,
} from '@/ai/flows/generate-next-question';
import type {ApiKeyInput} from '@/lib/types';

function handleError(error: any): { success: false; error: string } {
    console.error('An AI action failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('API key not valid')) {
        return { success: false, error: 'Invalid API key. Please check your key and try again.' };
    }
    
    return { success: false, error: 'An unexpected error occurred.' };
}


export async function handleGenerateQuestions(
  input: GenerateBilingualQuestionsInput & ApiKeyInput
) {
  try {
    const output = await generateBilingualQuestions(input);
    return {success: true, data: output};
  } catch (error) {
    return handleError(error);
  }
}

export async function handleGenerateNextQuestion(
  input: GenerateNextQuestionInput & ApiKeyInput
) {
  try {
    const output = await generateNextQuestion(input);
    return {success: true, data: output};
  } catch (error) {
    return handleError(error);
  }
}

export async function handleTranslate(input: TranslateInputInput & ApiKeyInput) {
  try {
    const output = await translateInput(input);
    return {success: true, data: output};
  } catch (error) {
    return handleError(error);
  }
}

export async function handleGenerateReport(
  input: SynthesizeBilingualSOAPNoteInput & ApiKeyInput
) {
  try {
    const [soapNoteResult, ddxResult, treatmentPlanResult] = await Promise.all([
      synthesizeBilingualSOAPNote(input),
      suggestDifferentialDiagnoses({
        apiKey: input.apiKey,
        patientInformation: input.patientInformation,
        answers: input.answers,
      }),
      formulateBilingualTreatmentPlan({
        apiKey: input.apiKey,
        patientInformation: input.patientInformation,
        answers: input.answers,
        diagnosis: 'Based on provided info.',
      }),
    ]);

    return {
      success: true,
      data: {
        soapNote: soapNoteResult,
        ddx: ddxResult,
        treatmentPlan: treatmentPlanResult,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function handleAnalyzeDocument(
  input: AnalyzePatientDocumentInput & ApiKeyInput
) {
  try {
    const output = await analyzePatientDocument(input);
    return {success: true, data: output};
  } catch (error) {
    return handleError(error);
  }
}
