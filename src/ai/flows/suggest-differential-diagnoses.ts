// src/ai/flows/suggest-differential-diagnoses.ts
'use server';

/**
 * @fileOverview Generates a ranked list of potential differential diagnoses in Persian and English.
 *
 * - suggestDifferentialDiagnoses - A function that suggests differential diagnoses.
 * - SuggestDifferentialDiagnosesInput - The input type for the suggestDifferentialDiagnoses function.
 * - SuggestDifferentialDiagnosesOutput - The return type for the suggestDifferentialDiagnoses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDifferentialDiagnosesInputSchema = z.object({
  patientData: z
    .string()
    .describe('The available patient data, including symptoms, medical history, and examination findings.'),
});
export type SuggestDifferentialDiagnosesInput = z.infer<
  typeof SuggestDifferentialDiagnosesInputSchema
>;

const SuggestDifferentialDiagnosesOutputSchema = z.object({
  differentialDiagnoses: z.array(
    z.object({
      diagnosisEn: z.string().describe('The differential diagnosis in English.'),
      diagnosisFa: z.string().describe('The differential diagnosis in Persian.'),
      rank: z.number().describe('The rank of the differential diagnosis.'),
    })
  ).
describe('A ranked list of potential differential diagnoses in Persian and English.'),
});
export type SuggestDifferentialDiagnosesOutput = z.infer<
  typeof SuggestDifferentialDiagnosesOutputSchema
>;

export async function suggestDifferentialDiagnoses(
  input: SuggestDifferentialDiagnosesInput
): Promise<SuggestDifferentialDiagnosesOutput> {
  return suggestDifferentialDiagnosesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDifferentialDiagnosesPrompt',
  input: {schema: SuggestDifferentialDiagnosesInputSchema},
  output: {schema: SuggestDifferentialDiagnosesOutputSchema},
  prompt: `You are an AI assistant that generates a ranked list of potential differential diagnoses in Persian and English based on the available patient data.

  Patient Data: {{{patientData}}}

  Please provide the differential diagnoses, their translations, and their ranks. Ensure that the diagnoses are relevant to the patient data provided.

  The differentialDiagnoses array should contain objects with diagnosisEn, diagnosisFa, and rank fields.
  `,
});

const suggestDifferentialDiagnosesFlow = ai.defineFlow(
  {
    name: 'suggestDifferentialDiagnosesFlow',
    inputSchema: SuggestDifferentialDiagnosesInputSchema,
    outputSchema: SuggestDifferentialDiagnosesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
