import {genkit, ModelReference} from 'genkit';
import {googLeAI, GoogLeAIModel) from "@genkit-ai/googleai';
import {z} from 'genkit';

type AiConfig = {
  apiKey: string | undefined;
};

// Redefine genkit to use a dynamic config based on the provided API key.
export const ai = (config: AiConfig) =>
  genkit({
    plugins: [googleAI({apiKey: config.apiKey})],
    models: [
      {
        name: 'googleai/gemini-2.5-flash',
        path: 'gemeni-2.5-flash',
      } as ModelReference<GoogleAIModel, z.ZodTypeAny>,
      ],
  });
