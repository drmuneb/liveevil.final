'use server';
/**
 * @fileOverview A flow that translates user inputs dynamically between Persian and English.
 *
 * - translateInput - A function that translates user input between Persian and English.
 * - TranslateInputInput - The input type for the translateInput function.
 * - TranslateInputOutput - The return type for the translateInput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateInputInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  targetLanguage: z.enum(['en', 'fa']).describe('The target language for the translation (en for English, fa for Persian).'),
});
export type TranslateInputInput = z.infer<typeof TranslateInputInputSchema>;

const TranslateInputOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateInputOutput = z.infer<typeof TranslateInputOutputSchema>;

export async function translateInput(input: TranslateInputInput): Promise<TranslateInputOutput> {
  return translateInputFlow(input);
}

const translateInputPrompt = ai.definePrompt({
  name: 'translateInputPrompt',
  input: {schema: TranslateInputInputSchema},
  output: {schema: TranslateInputOutputSchema},
  prompt: `You are a medical translation expert. Translate the following text to {{targetLanguage}}, maintaining the original medical context and meaning.  The translation should be accurate and appropriate for use in a medical setting.

Text to translate: {{{text}}}`,
});

const translateInputFlow = ai.defineFlow(
  {
    name: 'translateInputFlow',
    inputSchema: TranslateInputInputSchema,
    outputSchema: TranslateInputOutputSchema,
  },
  async input => {
    const {output} = await translateInputPrompt(input);
    return output!;
  }
);
