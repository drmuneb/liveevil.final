'use server';
/**
 * @fileOverview This file defines a Genkit flow for formulating a comprehensive treatment plan in both Persian and English.
 *
 * - formulateBilingualTreatmentPlan - A function that takes patient information and generates a bilingual treatment plan.
 * - FormulateBilingualTreatmentPlanInput - The input type for the formulateBilingualTreatmentPlan function.
 * - FormulateBilingualTreatmentPlanOutput - The return type for the formulateBilingualTreatmentPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormulateBilingualTreatmentPlanInputSchema = z.object({
  patientInformation: z
    .string()
    .describe('Comprehensive details of the patient including medical history, current symptoms, and examination findings.'),
  answers: z.string().describe('A summary of the questions and answers from the patient interview.'),
  diagnosis: z.string().describe('The confirmed or suspected diagnosis.'),
});
export type FormulateBilingualTreatmentPlanInput = z.infer<
  typeof FormulateBilingualTreatmentPlanInputSchema
>;

const FormulateBilingualTreatmentPlanOutputSchema = z.object({
  treatmentPlanEnglish: z
    .string()
    .describe('The treatment plan in English, including medications, dosage adjustments, and test recommendations.'),
  treatmentPlanPersian: z
    .string()
    .describe('The treatment plan in Persian, including medications, dosage adjustments, and test recommendations.'),
});
export type FormulateBilingualTreatmentPlanOutput = z.infer<
  typeof FormulateBilingualTreatmentPlanOutputSchema
>;

export async function formulateBilingualTreatmentPlan(
  input: FormulateBilingualTreatmentPlanInput
): Promise<FormulateBilingualTreatmentPlanOutput> {
  return formulateBilingualTreatmentPlanFlow(input);
}

const formulateBilingualTreatmentPlanPrompt = ai.definePrompt({
  name: 'formulateBilingualTreatmentPlanPrompt',
  input: {schema: FormulateBilingualTreatmentPlanInputSchema},
  output: {schema: FormulateBilingualTreatmentPlanOutputSchema},
  prompt: `You are an expert medical professional formulating a treatment plan for a patient.

  Based on the following patient details, interview answers, and diagnosis, create a comprehensive treatment plan in both English and Persian.
  The treatment plan should include medications, dosage adjustments, and test recommendations.

  Patient Information: {{{patientInformation}}}
  Interview Answers: {{{answers}}}
  Diagnosis: {{{diagnosis}}}

  Provide the full treatment plan for each language.`,
});

const formulateBilingualTreatmentPlanFlow = ai.defineFlow(
  {
    name: 'formulateBilingualTreatmentPlanFlow',
    inputSchema: FormulateBilingualTreatmentPlanInputSchema,
    outputSchema: FormulateBilingualTreatmentPlanOutputSchema,
  },
  async input => {
    const {output} = await formulateBilingualTreatmentPlanPrompt(input);
    return output!;
  }
);
