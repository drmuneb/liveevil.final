import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {Config} from 'genkit';

type AiConfig = {
  apiKey: string | undefined;
};

// Redefine genkit to use a dynamic config based on the provided API key.
export const ai = (config: Config) =>
  genkit({
    plugins: [googleAI({apiKey: (config as AiConfig).apiKey})],
    model: 'googleai/gemini-2.5-flash',
  });
