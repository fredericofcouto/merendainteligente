// src/ai/flows/generate-menu-from-inventory.ts
'use server';
/**
 * @fileOverview Generates balanced menu suggestions based on current food inventory and nutritional guidelines.
 *
 * - generateMenuFromInventory - A function that handles the menu generation process.
 * - GenerateMenuFromInventoryInput - The input type for the generateMenuFromInventory function.
 * - GenerateMenuFromInventoryOutput - The return type for the generateMenuFromInventory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FoodItemSchema = z.object({
  name: z.string().describe('Name of the food item'),
  quantity: z.number().describe('Quantity of the food item in stock'),
  nutritionalInfo: z.string().describe('Nutritional information of the food item'),
});

const GenerateMenuFromInventoryInputSchema = z.object({
  inventory: z
    .array(FoodItemSchema)
    .describe('Current food inventory with quantities and nutritional information.'),
  mealType: z.enum(['breakfast', 'lunch', 'dinner']).describe('Type of meal to generate.'),
  nutritionalGuidelines: z
    .string()
    .describe('Nutritional guidelines to follow when generating the menu.'),
});
export type GenerateMenuFromInventoryInput = z.infer<
  typeof GenerateMenuFromInventoryInputSchema
>;

const MenuItemSchema = z.object({
  name: z.string().describe('Name of the menu item.'),
  ingredients: z.array(z.string()).describe('List of ingredients in the menu item.'),
  nutritionalValue: z.string().describe('Nutritional value of the menu item.'),
});

const GenerateMenuFromInventoryOutputSchema = z.object({
  menuSuggestions: z
    .array(MenuItemSchema)
    .describe('Suggested menu items based on inventory and guidelines.'),
  reasoning: z
    .string()
    .describe(
      'Explanation of why these menu items were suggested, considering inventory and nutritional guidelines.'
    ),
});
export type GenerateMenuFromInventoryOutput = z.infer<
  typeof GenerateMenuFromInventoryOutputSchema
>;

export async function generateMenuFromInventory(
  input: GenerateMenuFromInventoryInput
): Promise<GenerateMenuFromInventoryOutput> {
  return generateMenuFromInventoryFlow(input);
}

const generateMenuPrompt = ai.definePrompt({
  name: 'generateMenuPrompt',
  input: {schema: GenerateMenuFromInventoryInputSchema},
  output: {schema: GenerateMenuFromInventoryOutputSchema},
  prompt: `You are a nutritionist creating a school menu based on available inventory and nutritional guidelines.

    Available Inventory:
    {{#each inventory}}
    - {{this.name}} (Quantity: {{this.quantity}}, Nutritional Info: {{this.nutritionalInfo}})
    {{/each}}

    Meal Type: {{mealType}}

    Nutritional Guidelines: {{nutritionalGuidelines}}

    Suggest menu items using only the available inventory and adhering to the nutritional guidelines. Provide a reasoning for your suggestions.
    `,
});

const generateMenuFromInventoryFlow = ai.defineFlow(
  {
    name: 'generateMenuFromInventoryFlow',
    inputSchema: GenerateMenuFromInventoryInputSchema,
    outputSchema: GenerateMenuFromInventoryOutputSchema,
  },
  async input => {
    const {output} = await generateMenuPrompt(input);
    return output!;
  }
);
