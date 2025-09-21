'use server';
/**
 * @fileOverview Generates a bilingual (Persian/English) SOAP note from patient information and answers.
 *
 * - synthesizeBilingualSOAPNote - A function that synthesizes the SOAP note.
 * - SynthesizeBilingualSOAPNoteInput - The input type for the synthesizeBilingualSOAPNote function.
 * - SynthesizeBilingualSOAPNoteOutput - The return type for the synthesizeBilingualSOAPNote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SynthesizeBilingualSOAPNoteInputSchema = z.object({
  patientInformation: z.string().describe('Comprehensive patient details including history, demographics, and relevant medical background.'),
  answers: z.string().describe('The answers provided by the patient during the medical interview.'),
});

export type SynthesizeBilingualSOAPNoteInput = z.infer<typeof SynthesizeBilingualSOAPNoteInputSchema>;

const SynthesizeBilingualSOAPNoteOutputSchema = z.object({
  soapNoteEnglish: z.string().describe('The generated SOAP note in English.'),
  soapNotePersian: z.string().describe('The generated SOAP note in Persian.'),
});

export type SynthesizeBilingualSOAPNoteOutput = z.infer<typeof SynthesizeBilingualSOAPNoteOutputSchema>;

export async function synthesizeBilingualSOAPNote(input: SynthesizeBilingualSOAPNoteInput): Promise<SynthesizeBilingualSOAPNoteOutput> {
  return synthesizeBilingualSOAPNoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'synthesizeBilingualSOAPNotePrompt',
  input: {schema: SynthesizeBilingualSOAPNoteInputSchema},
  output: {schema: SynthesizeBilingualSOAPNoteOutputSchema},
  prompt: `You are an AI assistant specialized in generating medical SOAP notes in both English and Persian.

  Given the following patient information and their answers to medical questions, synthesize a comprehensive SOAP note in both languages.

  Patient Information: {{{patientInformation}}}
  Answers: {{{answers}}}

  Ensure that the SOAP note is well-structured, with clear separation between the Subjective, Objective, Assessment, and Plan sections in both languages.
  Provide the output in JSON format.

  English SOAP Note:
  SOAP Note:

  Persian SOAP Note:
  SOAP Note:
  `,
});

const synthesizeBilingualSOAPNoteFlow = ai.defineFlow(
  {
    name: 'synthesizeBilingualSOAPNoteFlow',
    inputSchema: SynthesizeBilingualSOAPNoteInputSchema,
    outputSchema: SynthesizeBilingualSOAPNoteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
