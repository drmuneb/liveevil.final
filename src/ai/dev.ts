'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-bilingual-questions.ts';
import '@/ai/flows/formulate-bilingual-treatment-plan.ts';
import '@/ai/flows/synthesize-bilingual-soap-note.ts';
import '@/ai/flows/translate-user-inputs-dynamically.ts';
import '@/ai/flows/suggest-differential-diagnoses.ts';
import '@/ai/flows/analyze-patient-document.ts';
