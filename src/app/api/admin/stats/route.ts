
// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { getTransactions, getGoals, getBudgets, getRecurringTransactions, getTasks, getAIPlans, getUserProfile } from '@/lib/db';
import { headers } from 'next/headers';
import { auth } from '@/lib/firebase';
import { subDays, format, startOfToday } from 'date-fns';
import fs from 'fs/promises';
import path from 'path';

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
    // We can assume a single user for now. In a real app, you'd iterate through all users.
    const uid = auth.currentUser?.uid;

    // --- Fetch All Data Concurrently ---
    const [
        transactions,
        goals,
        budgets,
        recurring,
        tasks,
        aiPlans,
        profile,
        termsContent,
        policyContent,
        aboutContent,
        contactContent,
    ] = await Promise.all([
      getTransactions(),
      getGoals('all'),
      getBudgets(),
      getRecurringTransactions(),
      getTasks(),
      getAIPlans(),
      uid ? getUserProfile(uid) : Promise.resolve(null),
      fs.readFile(path.join(process.cwd(), 'src/app/(info)/policy/terms/page.tsx'), 'utf-8'),
      fs.readFile(path.join(process.cwd(), 'src/app/(info)/policy/privacy/page.tsx'), 'utf-8'),
      fs.readFile(path.join(process.cwd(), 'src/app/(info)/about/page.tsx'), 'utf-8'),
      fs.readFile(path.join(process.cwd(), 'src/app/(info)/contact/page.tsx'), 'utf-8'),
    ]);

    // --- Process Data for Admin Dashboard ---

    const kpis = [
        { title: 'Total Users', value: 1, change: 0 },
        { title: 'Total Transactions', value: transactions.length, change: 0 },
        { title: 'Total Goals', value: goals.length, change: 0 },
        { title: 'Total Budgets', value: budgets.length, change: 0 },
    ];
    
    // Create some sample user growth data for the last 7 days
    const userGrowth = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(startOfToday(), i);
        return {
            date: format(date, 'MMM d'),
            // Mocking user growth for prototype
            count: i === 6 ? 1 : 0 
        }
    }).reverse();
    
    const engagementMetrics = [
        { name: 'AI Plans Generated', value: aiPlans.length },
        { name: 'Tasks Created', value: tasks.length },
        { name: 'Recurring Transactions', value: recurring.length },
    ];

    const recentActivities = transactions.slice(0, 5).map(t => ({
        id: t.id,
        user: auth.currentUser?.displayName || 'User',
        description: `New transaction: ${t.description}`,
        timestamp: t.createdAt.toDate().toISOString(),
    }));
    
    const users = auth.currentUser ? [{
        id: auth.currentUser.uid,
        name: auth.currentUser.displayName,
        email: auth.currentUser.email,
        signUpDate: auth.currentUser.metadata.creationTime,
        lastLogin: auth.currentUser.metadata.lastSignInTime,
        currency: profile?.currency || 'USD',
    }] : [];

    const stats = {
      kpis,
      userGrowth,
      engagementMetrics,
      recentActivities,
      content: {
        hero: {},
        features: { features: [] },
        cta: {},
        footerLinks: {},
        terms: { content: termsContent },
        policy: { content: policyContent },
        about: { content: aboutContent },
        contact: { content: contactContent },
      },
      users,
      monitoring: {
        aiUsageStats: aiPlans.map(plan => ({
            id: plan.id,
            planTitle: plan.advice.title,
            linkedGoal: plan.goalId || 'None',
            timestamp: plan.createdAt.toDate().toISOString()
        })),
        recentErrors: [] // Can be connected to a logging service
      }
    };

    return NextResponse.json(stats, { status: 200 });

  } catch (error) {
    console.error('Admin API Error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
