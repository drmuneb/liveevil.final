'use server';
/**
 * @fileOverview A flow that generates the next medical question based on conversation history.
 *
 * - generateNextQuestion - A function that generates the next question.
 * - GenerateNextQuestionInput - The input type for the generateNextQuestion function.
 * - GenerateNextQuestionOutput - The return type for the generateNextQuestion function.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateNextQuestionInputSchema,
  GenerateNextQuestionOutputSchema,
  type GenerateNextQuestionInput,
  type GenerateNextQuestionOutput
} from '@/lib/types';


export async function generateNextQuestion(input: GenerateNextQuestionInput): Promise<GenerateNextQuestionOutput> {
  return generateNextQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNextQuestionPrompt',
  input: {schema: GenerateNextQuestionInputSchema},
  output: {schema: GenerateNextQuestionOutputSchema},
  prompt: `You are a helpful medical AI assistant conducting a consultation. Your goal is to gather enough information through a series of questions to suggest a diagnosis.

  - You will be given the patient's initial details.
  - You will also be given the conversation history between you (model) and the patient (user).
  - Your task is to generate the *next logical question* to ask.
  - All questions and options must be in both English and Persian (Farsi).
  - You should provide multiple-choice options for the user where it makes sense. This helps guide the conversation.
  - Review the entire conversation. Do not ask questions that have already been answered.
  - If you believe you have sufficient information to make a differential diagnosis, set 'isComplete' to true and do not provide a 'nextQuestion'. Otherwise, set 'isComplete' to false.
  - Keep questions relatively simple and focused.

  Initial Patient Information:
  {{{patientInformation}}}

  Conversation History:
  {{#each conversationHistory}}
    **{{role}}**: {{content}}
  {{/each}}
  `,
});

const generateNextQuestionFlow = ai.defineFlow(
  {
    name: 'generateNextQuestionFlow',
    inputSchema: GenerateNextQuestionInputSchema,
    outputSchema: GenerateNextQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
