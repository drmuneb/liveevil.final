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
import type {ApiKeyInput} from '@/lib/types';

const FormulateBilingualTreatmentPlanInputSchema = z.object({
  patientInformation: z.string().describe(
    'Comprehensive details of the patient including medical history, current symptoms, and examination findings.'
  ),
  answers: z
    .string()
    .describe(
      'A summary of the questions and answers from the patient interview.'
    ),
  diagnosis: z.string().describe('The confirmed or suspected diagnosis.'),
});
export type FormulateBilingualTreatmentPlanInput = z.infer<
  typeof FormulateBilingualTreatmentPlanInputSchema
>;

const FormulateBilingualTreatmentPlanOutputSchema = z.object({
  treatmentPlanEnglish: z.string().describe(
    'The treatment plan in English, including medications, dosage adjustments, and test recommendations, formatted in Markdown.'
  ),
  treatmentPlanPersian: z.string().describe(
    'The treatment plan in Persian, including medications, dosage adjustments, and test recommendations, formatted in Markdown.'
  ),
});
export type FormulateBilingualTreatmentPlanOutput = z.infer<
  typeof FormulateBilingualTreatmentPlanOutputSchema
>;

export async function formulateBilingualTreatmentPlan(
  input: FormulateBilingualTreatmentPlanInput & ApiKeyInput
): Promise<FormulateBilingualTreatmentPlanOutput> {
  const formulateBilingualTreatmentPlanPrompt = ai({
    apiKey: input.apiKey,
  }).definePrompt({
    name: 'formulateBilingualTreatmentPlanPrompt',
    input: {schema: FormulateBilingualTreatmentPlanInputSchema},
    output: {schema: FormulateBilingualTreatmentPlanOutputSchema},
    prompt: `You are an expert medical professional formulating a treatment plan.

  Based on the patient details, interview, and diagnosis, create a comprehensive treatment plan in both English and Persian.

  **Patient Information**: {{{patientInformation}}}
  **Interview Answers**: {{{answers}}}
  **Diagnosis**: {{{diagnosis}}}

  Structure the output for each language using Markdown with clear headings for each section. Use headings, lists, and bold text to make it readable and aesthetically pleasing.

  **Example English Format**:
  ### Medications
  *   **Aspirin**: 81mg daily
  *   **Lisinopril**: 10mg daily

  ### Recommended Tests
  *   **ECG**: To be performed today.
  *   **Lipid Panel**: Fasting, scheduled for tomorrow morning.

  ### Lifestyle Adjustments
  *   Follow a low-sodium diet.
  *   Engage in 30 minutes of moderate exercise, 3 times a week.
  
  **Example Persian Format**:
  ### داروها
  *   **آسپرین**: ۸۱ میلی گرم روزانه
  *   **لیزینوپریل**: ۱۰ میلی گرم روزانه

  ### آزمایشات توصیه شده
  *   **نوار قلب**: امروز انجام شود.
  *   **پنل چربی**: ناشتا، برای فردا صبح برنامه ریزی شده است.

  ### اصلاح سبک زندگی
  *   رژیم غذایی کم سدیم را دنبال کنید.
  *   ۳ بار در هفته به مدت ۳۰ دقیقه ورزش متوسط داشته باشید.
  
  Provide the full, well-structured treatment plan for each language in the specified Markdown format.`,
  });
  const {output} = await formulateBilingualTreatmentPlanPrompt(input);
  return output!;
}
