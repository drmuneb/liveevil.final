'use server';

import {
  generateBilingualQuestions,
  type GenerateBilingualQuestionsInput,
} from '@/ai/flows/generate-bilingual-questions';
import {
  formulateBilingualTreatmentPlan
} from '@/ai/flows/formulate-bilingual-treatment-plan';
import {
  suggestDifferentialDiagnoses
} from '@/ai/flows/suggest-differential-diagnoses';
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
import { generateNextQuestion, type GenerateNextQuestionInput } from '@/ai/flows/generate-next-question';


export async function handleGenerateQuestions(
  input: GenerateBilingualQuestionsInput
) {
  try {
    const output = await generateBilingualQuestions(input);
    return { success: true, data: output };
  } catch (error) {
    console.error('Error generating questions:', error);
    return { success: false, error: 'Failed to generate questions.' };
  }
}

export async function handleGenerateNextQuestion(input: GenerateNextQuestionInput) {
    try {
        const output = await generateNextQuestion(input);
        return { success: true, data: output };
    } catch (error) {
        console.error('Error generating next question:', error);
        return { success: false, error: 'Failed to generate next question.' };
    }
}

export async function handleTranslate(input: TranslateInputInput) {
  try {
    const output = await translateInput(input);
    return { success: true, data: output };
  } catch (error) {
    console.error('Error translating text:', error);
    return { success: false, error: 'Failed to translate text.' };
  }
}

export async function handleGenerateReport(input: SynthesizeBilingualSOAPNoteInput) {
    try {
        const [soapNoteResult, ddxResult, treatmentPlanResult] = await Promise.all([
            synthesizeBilingualSOAPNote(input),
            suggestDifferentialDiagnoses({ 
              patientInformation: input.patientInformation, 
              answers: input.answers 
            }),
            formulateBilingualTreatmentPlan({
                patientInformation: input.patientInformation,
                answers: input.answers,
                diagnosis: "Based on provided info.",
            })
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
        console.error('Error generating report:', error);
        return { success: false, error: 'Failed to generate one or more report sections.' };
    }
}

export async function handleAnalyzeDocument(input: AnalyzePatientDocumentInput) {
    try {
      const output = await analyzePatientDocument(input);
      return { success: true, data: output };
    } catch (error) {
      console.error('Error analyzing document:', error);
      return { success: false, error: 'Failed to analyze document.' };
    }
  }
