
'use server';
/**
 * @fileOverview An AI flow to generate smart financial alerts for a user.
 *
 * - generateSmartAlerts - A function that analyzes financial data and produces actionable alerts.
 * - SmartAlertsRequest - The input type for the generateSmartAlerts function.
 * - SmartAlertsResponse - The return type for the generateSmartAlerts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TransactionSchema = z.object({
  id: z.string(),
  description: z.string(),
  amount: z.number(),
  date: z.string(),
  category: z.string(),
  goalId: z.string().optional(),
});

const RecurringTransactionSchema = z.object({
  id: z.string(),
  description: z.string(),
  amount: z.number(),
  category: z.string(),
  frequency: z.enum(['weekly', 'monthly', 'yearly']),
  startDate: z.string(),
});

const GoalSchema = z.object({
  id: z.string(),
  title: z.string(),
  current: z.number(),
  target: z.number(),
  status: z.enum(['active', 'archived']),
});

const BudgetSchema = z.object({
  id: z.string(),
  category: z.string(),
  limit: z.number(),
  spent: z.number(),
});

const SmartAlertsRequestSchema = z.object({
  transactions: z.array(TransactionSchema),
  recurringTransactions: z.array(RecurringTransactionSchema),
  goals: z.array(GoalSchema),
  budgets: z.array(BudgetSchema),
});
export type SmartAlertsRequest = z.infer<typeof SmartAlertsRequestSchema>;

const ActionableLinkSchema = z.object({
    text: z.string().describe("The user-facing text for the link, e.g., 'View Budget'"),
    href: z.string().describe("The relative URL for the link, e.g., '/dashboard/budgets'")
});

const SmartAlertSchema = z.object({
  title: z.string().describe('A short, clear title for the alert.'),
  description: z.string().describe('A detailed but concise explanation of the alert, including specific numbers where helpful.'),
  severity: z.enum(['High', 'Medium', 'Low']).describe("The severity of the alert. 'High' for urgent issues (like overspending), 'Medium' for warnings, 'Low' for opportunities."),
  actionableLink: ActionableLinkSchema.optional().describe("An optional link to a relevant page in the app."),
});

const SmartAlertsResponseSchema = z.object({
  alerts: z.array(SmartAlertSchema),
});
export type SmartAlertsResponse = z.infer<typeof SmartAlertsResponseSchema>;

export async function generateSmartAlerts(
  request: SmartAlertsRequest
): Promise<SmartAlertsResponse> {
  return smartAlertsFlow(request);
}

const prompt = ai.definePrompt({
  name: 'generateSmartAlertsPrompt',
  input: { schema: SmartAlertsRequestSchema },
  output: { schema: SmartAlertsResponseSchema },
  prompt: `You are an expert financial analyst AI. Your task is to analyze a user's financial data and generate a list of helpful "smart alerts". Be insightful, proactive, and clear.

Analyze the provided transactions, recurring payments, goals, and budgets.
Identify potential issues, upcoming events, or opportunities for improvement.

Here are some examples of what to look for:
- **High Severity (Urgent):** User is about to exceed a budget; A large recurring payment is due soon but their spending is high.
- **Medium Severity (Warnings):** Unusually high spending in a category compared to the average; A large one-time expense that might impact goals.
- **Low Severity (Opportunities):** A large deposit was made that could be allocated to a goal; A budget has a significant surplus that could be swept to savings.

Generate a list of alerts. If there are no noteworthy items, return an empty list.

**Financial Data:**

**Transactions (recent):**
{{#each transactions}}
- {{date}}: {{description}} ({{amount}}, {{category}})
{{else}}
(No transactions)
{{/each}}

**Recurring Transactions:**
{{#each recurringTransactions}}
- {{description}} ({{amount}}, {{category}}, {{frequency}}, starts {{startDate}})
{{else}}
(No recurring transactions)
{{/each}}

**Active Goals:**
{{#each goals}}
- {{title}} (Target: {{target}}, Current: {{current}})
{{else}}
(No active goals)
{{/each}}

**Budgets:**
{{#each budgets}}
- {{category}} (Limit: {{limit}}, Spent: {{spent}})
{{else}}
(No budgets)
{{/each}}

Generate the list of smart alerts now.`,
});

const smartAlertsFlow = ai.defineFlow(
  {
    name: 'smartAlertsFlow',
    inputSchema: SmartAlertsRequestSchema,
    outputSchema: SmartAlertsResponseSchema,
  },
  async (input) => {
    const { output } = await prompt(input, { model: 'googleai/gemini-1.5-flash' });
    return output!;
  }
);
