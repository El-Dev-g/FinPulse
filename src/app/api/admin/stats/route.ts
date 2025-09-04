
// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { getTransactions, getGoals, getBudgets, getRecurringTransactions, getTasks } from '@/lib/db';
import { headers } from 'next/headers';

// This function handles GET requests to /api/admin/stats
export async function GET() {
  const headersList = headers();
  const apiKey = headersList.get('x-api-key');
  const secretKey = headersList.get('x-secret-key');

  // --- Security Check ---
  // Compare the keys from the request with the ones in your environment variables
  if (
    !process.env.ADMIN_API_KEY ||
    !process.env.ADMIN_SECRET_KEY ||
    apiKey !== process.env.ADMIN_API_KEY ||
    secretKey !== process.env.ADMIN_SECRET_KEY
  ) {
    // If the keys don't match, or are missing, deny access
    return NextResponse.json({ error: 'Unauthorized: Invalid API credentials' }, { status: 401 });
  }

  try {
    // --- Fetch Data ---
    // We can assume a single user for now, as this is a prototype.
    // In a real multi-user app, you would perform these fetches across all users.
    const [
        transactions,
        goals,
        budgets,
        recurring,
        tasks
    ] = await Promise.all([
      getTransactions(),
      getGoals('all'),
      getBudgets(),
      getRecurringTransactions(),
      getTasks()
    ]);

    // --- Format Response ---
    const stats = {
      totalUsers: 1, // Hardcoded to 1 for this single-user prototype
      totalTransactions: transactions.length,
      totalGoals: goals.length,
      totalBudgets: budgets.length,
      totalRecurring: recurring.length,
      totalTasks: tasks.length,
    };

    return NextResponse.json(stats, { status: 200 });

  } catch (error) {
    console.error('Admin API Error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
