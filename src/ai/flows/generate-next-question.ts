'use server';
/**
 * @fileOverview A flow that generates the next medical question based on conversation history.
 *
 * - generateNextQuestion - A function that generates the next question.
 * - GenerateNextQuestionInput - The input type for the generateNextQuestion function.
 * - GenerateNextQuestionOutput - The return type for the generateNextQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {ApiKeyInput} from '@/lib/types';

const ConversationHistorySchema = z.array(
  z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })
);

const GenerateNextQuestionInputSchema = z.object({
  patientInformation: z
    .string()
    .describe(
      'Comprehensive patient details including history, demographics, and relevant medical background.'
    ),
  conversationHistory: ConversationHistorySchema.describe(
    'The history of the conversation so far.'
  ),
  perspective: z
    .enum(['first-person', 'third-person'])
    .describe(
      "The perspective for asking questions. 'first-person' for talking to the patient, 'third-person' for talking to a caregiver."
    )
    .optional(),
});
export type GenerateNextQuestionInput = z.infer<
  typeof GenerateNextQuestionInputSchema
>;

const GenerateNextQuestionOutputSchema = z.object({
  nextQuestion: z
    .object({
      english: z.string().describe('The next question in English.'),
      persian: z.string().describe('The next question in Persian (Farsi).'),
      options: z
        .array(
          z.object({
            english: z.string().describe('An option in English'),
            persian: z.string().describe('The same option in Persian'),
          })
        )
        .optional()
        .describe('An optional list of multiple-choice answers.'),
    })
    .optional(),
  isComplete: z
    .boolean()
    .describe(
      'Set to true when you have enough information to make a diagnosis.'
    ),
});
export type GenerateNextQuestionOutput = z.infer<
  typeof GenerateNextQuestionOutputSchema
>;

export async function generateNextQuestion(
  input: GenerateNextQuestionInput & ApiKeyInput
): Promise<GenerateNextQuestionOutput> {
  const prompt = ai({apiKey: input.apiKey}).definePrompt({
    name: 'generateNextQuestionPrompt',
    input: {schema: GenerateNextQuestionInputSchema},
    output: {schema: GenerateNextQuestionOutputSchema},
    prompt: `You are a helpful medical AI assistant conducting a consultation. Your goal is to gather enough information through a series of questions to suggest a diagnosis.

- You will be given the patient's initial details.
- You will be given a 'perspective' which tells you who you are talking to.
  - If perspective is 'first-person', address the patient directly (e.g., "How are you feeling?").
  - If perspective is 'third-person', you are talking to a caregiver, so refer to the patient in the third person (e.g., "How is the patient feeling?").
- You will also be given the conversation history between you (model) and the user.
- If the history is empty, your first question should be based on the 'Chief Complaint' from the patient information.
- Your task is to generate the *next logical question* to ask based on the provided perspective.
- All questions and options must be in both English and Persian (Farsi).
- You should provide multiple-choice options for the user where it makes sense. This helps guide the conversation.
- Review the entire conversation. Do not ask questions that have already been answered.
- If you believe you have sufficient information to make a differential diagnosis, set 'isComplete' to true and do not provide a 'nextQuestion'. Otherwise, set 'isComplete' to false.
- Keep questions relatively simple and focused.

Initial Patient Information:
{{{patientInformation}}}

Perspective: {{perspective}}

Conversation History:
{{#if conversationHistory}}
{{#each conversationHistory}}
  **{{role}}**: {{content}}
{{/each}}
{{else}}
No conversation history yet. Start with a question about the chief complaint.
{{/if}}
`,
  });

  const {output} = await prompt(input);
  return output!;
}
