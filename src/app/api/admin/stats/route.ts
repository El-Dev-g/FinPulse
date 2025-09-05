
// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { getTransactions, getGoals, getBudgets, getRecurringTransactions, getTasks, getAIPlans, getUserProfile } from '@/lib/db';
import { headers } from 'next/headers';
import { auth } from '@/lib/firebase';
import { subDays, format, startOfToday } from 'date-fns';
import fs from 'fs/promises';
import path from 'path';

// Define allowed origins
const allowedOrigins = [
    // Add your admin project's domain here
    'http://localhost:3000', // Example for local development
    'https://6000-firebase-studio-1757022081447.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev' // Example for production
];

const getCorsHeaders = (origin: string | null) => {
    const headers: { [key: string]: string } = {
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key, x-secret-key',
    };

    if (origin && allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
    } else if (!origin) {
        // Allow for server-to-server requests
    } else {
        // You can choose to block or handle unlisted origins here.
        // For now, we'll allow the request to proceed but without the Allow-Origin header,
        // which will cause it to fail on the client-side due to CORS policy.
    }
    return headers;
};


// This function handles GET requests to /api/admin/stats
export async function GET() {
  const requestOrigin = headers().get('origin');
  const corsHeaders = getCorsHeaders(requestOrigin);

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
    return NextResponse.json({ error: 'Unauthorized: Invalid API credentials' }, { status: 401, headers: corsHeaders });
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
        landingContent,
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
      fs.readFile(path.join(process.cwd(), 'src/content/landing-page.json'), 'utf-8').catch(() => '{}'),
      fs.readFile(path.join(process.cwd(), 'src/app/(info)/policy/terms/page.tsx'), 'utf-8').catch(() => ''),
      fs.readFile(path.join(process.cwd(), 'src/app/(info)/policy/privacy/page.tsx'), 'utf-8').catch(() => ''),
      fs.readFile(path.join(process.cwd(), 'src/app/(info)/about/page.tsx'), 'utf-8').catch(() => ''),
      fs.readFile(path.join(process.cwd(), 'src/app/(info)/contact/page.tsx'), 'utf-8').catch(() => ''),
    ]);
    
    const landingData = JSON.parse(landingContent);

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
        hero: landingData.hero || {},
        features: { features: landingData.features?.items || [] },
        cta: landingData.cta || {},
        footerLinks: landingData.footer || { columns: [] },
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

    return NextResponse.json(stats, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Admin API Error:', error);
    const requestOrigin = headers().get('origin');
    const corsHeaders = getCorsHeaders(requestOrigin);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500, headers: corsHeaders });
  }
}


// This handles preflight OPTIONS requests from browsers
export async function OPTIONS(request: Request) {
    const requestOrigin = request.headers.get('origin');
    const headers = getCorsHeaders(requestOrigin);
    return new NextResponse(null, {
        status: 204, // No Content
        headers,
    });
}
