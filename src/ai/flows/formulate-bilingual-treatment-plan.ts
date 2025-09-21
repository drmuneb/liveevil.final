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
  patientDetails: z
    .string()
    .describe('Comprehensive details of the patient including medical history, current symptoms, and examination findings.'),
  diagnosis: z.string().describe('The confirmed or suspected diagnosis.'),
  patientLanguagePreference: z
    .enum(['english', 'persian'])
    .describe('The patient preferred language for the treatment plan.'),
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

  Based on the following patient details and diagnosis, create a comprehensive treatment plan in both English and Persian.
  The treatment plan should include medications, dosage adjustments, and test recommendations.
  Pay close attention to the patient's language preference and tailor the language output accordingly.

  Patient Details: {{{patientDetails}}}
  Diagnosis: {{{diagnosis}}}
  Patient Language Preference: {{{patientLanguagePreference}}}

  English Treatment Plan:
  Persian Treatment Plan: `,
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
