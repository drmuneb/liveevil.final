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
  soapNoteEnglish: z.string().describe('The generated SOAP note in English, formatted using Markdown.'),
  soapNotePersian: z.string().describe('The generated SOAP note in Persian, formatted using Markdown.'),
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

  Given the following patient information and their answers to medical questions, synthesize a comprehensive SOAP note in both languages. Use Markdown for formatting (headings, lists, bold text).

  **Patient Information**: {{{patientInformation}}}
  **Interview Answers**: {{{answers}}}

  Structure the output for each language with clear Subjective (S), Objective (O), Assessment (A), and Plan (P) sections using ### headers.

  - **S (Subjective)**: The patient's chief complaint and history of present illness.
  - **O (Objective)**: Measurable findings like vital signs, and physical exam results.
  - **A (Assessment)**: The primary diagnosis or differential diagnoses.
  - **P (Plan)**: The treatment plan, including tests, medications, and follow-up.

  **Example English Format**:
  ### Subjective (S)
  * Patient reports chest pain that started 2 hours ago...
  * Denies shortness of breath.

  ### Objective (O)
  * **Vitals**: BP 140/90, HR 88
  * **Exam**: Lungs clear to auscultation.

  ### Assessment (A)
  1.  Suspected Angina
  2.  Hypertension

  ### Plan (P)
  * Recommend EKG and cardiac enzyme test.
  * Start Aspirin 81mg daily.

  **Example Persian Format**:
  ### Subjective (S)
  * بیمار از درد قفسه سینه که از ۲ ساعت پیش شروع شده شکایت دارد...
  * تنگی نفس را انکار می کند.

  ### Objective (O)
  * **علائم حیاتی**: فشار خون 140/90، ضربان قلب 88
  * **معاینه**: ریه ها در سمع شفاف هستند.

  ### Assessment (A)
  1.  مشکوک به آنژین
  2.  فشار خون بالا

  ### Plan (P)
  * توصیه به انجام نوار قلب و آزمایش آنزیم قلبی.
  * شروع آسپرین ۸۱ میلی گرم روزانه.

  Ensure your response provides a complete SOAP note in each language with the specified Markdown formatting.
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
