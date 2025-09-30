'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating medical questions in both Persian and English.
 *
 * - generateBilingualQuestions - A function that generates medical questions in Persian and English.
 * - GenerateBilingualQuestionsInput - The input type for the generateBilingualQuestions function.
 * - GenerateBilingualQuestionsOutput - The return type for the generateBilingualQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {ApiKeyInput} from '@/lib/types';

const GenerateBilingualQuestionsInputSchema = z.object({
  patientDetails: z
    .string()
    .describe(
      'Details about the patient, including name, age, and medical history.'
    ),
  consciousnessLevel: z
    .string()
    .describe(
      "The patient's level of consciousness (e.g., alert, drowsy, unresponsive)."
    ),
});
export type GenerateBilingualQuestionsInput = z.infer<
  typeof GenerateBilingualQuestionsInputSchema
>;

const GenerateBilingualQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      english: z.string().describe('The question in English.'),
      persian: z.string().describe('The question in Persian (Farsi).'),
      options: z
        .array(
          z.object({
            english: z.string(),
            persian: z.string(),
          })
        )
        .optional()
        .describe('An optional list of multiple-choice answers.'),
    })
  ),
});
export type GenerateBilingualQuestionsOutput = z.infer<
  typeof GenerateBilingualQuestionsOutputSchema
>;

export async function generateBilingualQuestions(
  input: GenerateBilingualQuestionsInput & ApiKeyInput
): Promise<GenerateBilingualQuestionsOutput> {
  const prompt = ai({apiKey: input.apiKey}).definePrompt({
    name: 'generateBilingualQuestionsPrompt',
    input: {schema: GenerateBilingualQuestionsInputSchema},
    output: {schema: GenerateBilingualQuestionsOutputSchema},
    prompt: `You are a medical AI assistant that generates relevant medical questions in both Persian and English, tailored to the patient's condition and level of consciousness.

  Patient Details: {{{patientDetails}}}
  Consciousness Level: {{{consciousnessLevel}}}

  Generate a series of questions (3-5) that would be helpful in gathering information about the patient's current condition.  Make sure the questions are appropriate for the described level of consciousness. For some questions, provide a few multiple choice options.

  The questions should be in both English and Persian. Persian is also known as Farsi.

  Example:
  {
    "questions": [
      {
        "english": "Can you describe the pain you are experiencing?",
        "persian": "میتوانید دردی را که تجربه میکنید، شرح دهید؟"
      },
      {
        "english": "What is the nature of the pain?",
        "persian": "ماهیت درد چگونه است؟",
        "options": [
          { "english": "Sharp", "persian": "تیز" },
          { "english": "Dull", "persian": "کند" },
          { "english": "Throbbing", "persian": "ضربان دار" },
          { "english": "Burning", "persian": "سوزناک" }
        ]
      },
      {
        "english": "Do you have any allergies to medications?",
        "persian": "آیا به داروهای خاصی حساسیت دارید؟"
      }
    ]
  }
  `,
  });

  const {output} = await prompt(input);
  return output!;
}
