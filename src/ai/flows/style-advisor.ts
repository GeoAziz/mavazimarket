
'use server';
/**
 * @fileOverview AI Style Advisor Flow.
 *
 * This flow provides personalized style recommendations based on a user's purchase history and preferences.
 * - styleAdvisor - A function that takes a style profile and returns heritage recommendations.
 * - StyleAdvisorInput - The input type for the styleAdvisor function.
 * - StyleAdvisorOutput - The return type for the styleAdvisor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StyleAdvisorInputSchema = z.object({
  purchaseHistory: z
    .string()
    .describe(
      'A description of the user style preferences, past purchases, and heritage interests.'
    ),
});
export type StyleAdvisorInput = z.infer<typeof StyleAdvisorInputSchema>;

const StyleAdvisorOutputSchema = z.object({
  recommendations: z
    .string()
    .describe('A high-fidelity heritage consultation report with style recommendations.'),
});
export type StyleAdvisorOutput = z.infer<typeof StyleAdvisorOutputSchema>;

export async function styleAdvisor(input: StyleAdvisorInput): Promise<StyleAdvisorOutput> {
  return styleAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'styleAdvisorPrompt',
  input: {schema: StyleAdvisorInputSchema},
  output: {schema: StyleAdvisorOutputSchema},
  prompt: `You are the Mavazi Market Heritage Stylist, an expert in modern Afrocentric fashion and Kenyan craftsmanship.

    Based on the user's provided style profile, provide a premium consultation report. 
    Focus on how different textures (like Kitenge or Mud Cloth), silhouettes, and earthy tones can speak to their unique path.
    
    Structure your response with clear headings and a bold, encouraging tone.

    User Profile: {{{purchaseHistory}}}

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
