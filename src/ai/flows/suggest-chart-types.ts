'use server';

/**
 * @fileOverview AI-powered chart type suggestion flow.
 *
 * - suggestChartTypes - A function that suggests chart types and data relationships for a given dataset.
 * - SuggestChartTypesInput - The input type for the suggestChartTypes function.
 * - SuggestChartTypesOutput - The return type for the suggestChartTypes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestChartTypesInputSchema = z.object({
  dataSummary: z
    .string()
    .describe("A summary of the data in the uploaded file, including column names and example values."),
});
export type SuggestChartTypesInput = z.infer<typeof SuggestChartTypesInputSchema>;

const SuggestChartTypesOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe("A list of suggested chart types and data relationships, tailored to the provided dataset."),
});
export type SuggestChartTypesOutput = z.infer<typeof SuggestChartTypesOutputSchema>;

export async function suggestChartTypes(input: SuggestChartTypesInput): Promise<SuggestChartTypesOutput> {
  return suggestChartTypesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestChartTypesPrompt',
  input: {schema: SuggestChartTypesInputSchema},
  output: {schema: SuggestChartTypesOutputSchema},
  prompt: `You are an expert data visualization consultant.  A user has uploaded a dataset, and you need to suggest suitable chart types and data relationships for their data.  The user is not sure where to start, so your suggestions should be helpful and insightful.

Here's a summary of the data:

{{dataSummary}}

Based on this data, suggest at least three different chart types and the corresponding data relationships that would be effective for visualizing the data.  Explain why each suggestion is appropriate.

Format your response as a JSON array of strings, where each string is a chart type and data relationship suggestion.

For example:

[
  "Line chart: Show the trend of sales over time.",
  "Bar chart: Compare the sales performance of different product categories.",
  "Scatter plot: Identify the correlation between advertising spend and sales revenue."
]
`,
});

const suggestChartTypesFlow = ai.defineFlow(
  {
    name: 'suggestChartTypesFlow',
    inputSchema: SuggestChartTypesInputSchema,
    outputSchema: SuggestChartTypesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
