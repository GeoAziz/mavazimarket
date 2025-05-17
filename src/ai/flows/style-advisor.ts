'use server';
/**
 * @fileOverview AI Style Advisor Flow.
 *
 * This flow provides personalized style recommendations based on a user's purchase history.
 * - styleAdvisor - A function that takes a user's purchase history and returns style recommendations.
 * - StyleAdvisorInput - The input type for the styleAdvisor function.
 * - StyleAdvisorOutput - The return type for the styleAdvisor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StyleAdvisorInputSchema = z.object({
  purchaseHistory: z
    .string()
    .describe(
      'A string containing the user purchase history, each purchase should be separated by commas.'
    ),
});
export type StyleAdvisorInput = z.infer<typeof StyleAdvisorInputSchema>;

const StyleAdvisorOutputSchema = z.object({
  recommendations: z
    .string()
    .describe('Personalized style recommendations based on purchase history.'),
});
export type StyleAdvisorOutput = z.infer<typeof StyleAdvisorOutputSchema>;

export async function styleAdvisor(input: StyleAdvisorInput): Promise<StyleAdvisorOutput> {
  return styleAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'styleAdvisorPrompt',
  input: {schema: StyleAdvisorInputSchema},
  output: {schema: StyleAdvisorOutputSchema},
  prompt: `Based on the user's purchase history, provide personalized style recommendations.

    Purchase History: {{{purchaseHistory}}}

    Recommendations: `,
});

const styleAdvisorFlow = ai.defineFlow(
  {
    name: 'styleAdvisorFlow',
    inputSchema: StyleAdvisorInputSchema,
    outputSchema: StyleAdvisorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
