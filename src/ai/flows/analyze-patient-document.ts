'use server';
/**
 * @fileOverview An AI flow to analyze a patient document image and extract details.
 *
 * - analyzePatientDocument - A function that handles the patient document analysis.
 * - AnalyzePatientDocumentInput - The input type for the analyzePatientDocument function.
 * - AnalyzePatientDocumentOutput - The return type for the analyzePatientDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePatientDocumentInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a patient document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePatientDocumentInput = z.infer<typeof AnalyzePatientDocumentInputSchema>;

const AnalyzePatientDocumentOutputSchema = z.object({
  name: z.string().optional().describe("The patient's full name."),
  age: z.number().optional().describe("The patient's age."),
  gender: z.enum(['male', 'female', 'other']).optional().describe("The patient's gender."),
  dob: z.string().optional().describe("The patient's date of birth in YYYY-MM-DD format."),
  chiefComplaint: z.string().optional().describe("The patient's chief complaint or reason for visit."),
  consciousnessLevel: z.enum(['Alert', 'Drowsy', 'Unresponsive']).optional().describe("The patient's level of consciousness."),
});
export type AnalyzePatientDocumentOutput = z.infer<typeof AnalyzePatientDocumentOutputSchema>;

export async function analyzePatientDocument(input: AnalyzePatientDocumentInput): Promise<AnalyzePatientDocumentOutput> {
  return analyzePatientDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePatientDocumentPrompt',
  input: {schema: AnalyzePatientDocumentInputSchema},
  output: {schema: AnalyzePatientDocumentOutputSchema},
  prompt: `You are an expert at analyzing medical documents and forms. Extract the patient's information from the provided image.

If a value is not present in the document, do not include the key in the output.

Image: {{media url=photoDataUri}}`,
});

const analyzePatientDocumentFlow = ai.defineFlow(
  {
    name: 'analyzePatientDocumentFlow',
    inputSchema: AnalyzePatientDocumentInputSchema,
    outputSchema: AnalyzePatientDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
