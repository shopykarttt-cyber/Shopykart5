'use server';
/**
 * @fileOverview A Smart Basket Assistant that suggests optimized grocery bundles and recipes.
 *
 * - smartBasketAssistant - A function that handles the grocery suggestion process.
 * - SmartBasketAssistantInput - The input type for the smartBasketAssistant function.
 * - SmartBasketAssistantOutput - The return type for the smartBasketAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartBasketAssistantInputSchema = z.object({
  userSearchIntent: z
    .string()
    .describe(
      "The user's current search intent, e.g., 'quick weeknight meals', 'summer BBQ ideas', 'vegan meal prep'."
    ),
});
export type SmartBasketAssistantInput = z.infer<
  typeof SmartBasketAssistantInputSchema
>;

const SmartBasketAssistantOutputSchema = z.object({
  groceryBundles: z
    .array(
      z.object({
        name: z.string().describe('The name of the grocery bundle.'),
        description: z
          .string()
          .describe('A description or list of items in the grocery bundle.'),
      })
    )
    .describe('A list of optimized grocery bundles.'),
  recipes: z
    .array(
      z.object({
        name: z.string().describe('The name of the recipe.'),
        description: z
          .string()
          .describe('A short description of the recipe.'),
        ingredients: z
          .array(z.string())
          .describe('A list of ingredients required for the recipe.'),
        instructions: z
          .array(z.string())
          .describe('A list of step-by-step instructions for the recipe.'),
      })
    )
    .describe('A list of relevant recipes.'),
});
export type SmartBasketAssistantOutput = z.infer<
  typeof SmartBasketAssistantOutputSchema
>;

export async function smartBasketAssistant(
  input: SmartBasketAssistantInput
): Promise<SmartBasketAssistantOutput> {
  return smartBasketAssistantFlow(input);
}

const smartBasketAssistantPrompt = ai.definePrompt({
  name: 'smartBasketAssistantPrompt',
  input: {schema: SmartBasketAssistantInputSchema},
  output: {schema: SmartBasketAssistantOutputSchema},
  prompt: `You are a smart grocery basket assistant. Your goal is to help users plan their meals and shopping lists by suggesting optimized grocery bundles and relevant recipes based on their search intent and seasonal trends.

Consider current seasonal trends when generating suggestions for grocery items and recipes. Aim for practical, easy-to-shop bundles and clear, concise recipes.

User's search intent: {{{userSearchIntent}}}

Please provide a few optimized grocery bundles and a couple of relevant recipes that can be made using items from these bundles.`,
});

const smartBasketAssistantFlow = ai.defineFlow(
  {
    name: 'smartBasketAssistantFlow',
    inputSchema: SmartBasketAssistantInputSchema,
    outputSchema: SmartBasketAssistantOutputSchema,
  },
  async input => {
    const {output} = await smartBasketAssistantPrompt(input);
    return output!;
  }
);
