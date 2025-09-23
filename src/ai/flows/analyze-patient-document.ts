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
  name: z.string().optional().describe("The patient's first name."),
  familyName: z.string().optional().describe("The patient's family name or surname."),
  fatherName: z.string().optional().describe("The patient's father's name."),
  age: z.number().optional().describe("The patient's age in years."),
  gender: z.enum(['male', 'female', 'other']).optional().describe("The patient's gender."),
  dob: z.string().optional().describe("The patient's date of birth in YYYY-MM-DD format."),
  
  ward: z.string().optional().describe("The admission ward."),
  room: z.string().optional().describe("The room number."),
  bed: z.string().optional().describe("The bed number."),
  dateOfAdmission: z.string().optional().describe("The date of admission in YYYY-MM-DD format."),
  attendingPhysician: z.string().optional().describe("The name of the attending physician."),

  bp: z.string().optional().describe("Blood Pressure (e.g., '120/80')."),
  rr: z.string().optional().describe("Respiratory Rate (e.g., '18')."),
  pr: z.string().optional().describe("Pulse Rate (e.g., '72')."),
  spo2: z.string().optional().describe("Oxygen Saturation (e.g., '98%')."),

  eyeColor: z.string().optional().describe("Patient's eye color."),
  skinColor: z.string().optional().describe("Patient's skin color."),
  bruises: z.string().optional().describe("Description of any bruises."),
  rashUlcers: z.string().optional().describe("Description of any rashes or ulcers."),

  pastMedicalHistory: z.string().optional().describe("Patient's past medical history."),
  pastSurgicalHistory: z.string().optional().describe("Patient's past surgical history."),
  medication: z.string().optional().describe("Patient's current or past medication."),
  familyHistory: z.string().optional().describe("Patient's family medical history."),
});
export type AnalyzePatientDocumentOutput = z.infer<typeof AnalyzePatientDocumentOutputSchema>;

export async function analyzePatientDocument(input: AnalyzePatientDocumentInput): Promise<AnalyzePatientDocumentOutput> {
  return analyzePatientDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePatientDocumentPrompt',
  input: {schema: AnalyzePatientDocumentInputSchema},
  output: {schema: AnalyzePatientDocumentOutputSchema},
  prompt: `You are an expert at analyzing medical documents and forms, including handwritten notes. Extract the patient's information from the provided image.

If a value is not present in the document, do not include the key in the output. Translate Persian names or terms to their English equivalent where appropriate (e.g., for field names), but keep the original data as is.

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
