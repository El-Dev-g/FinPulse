# FinPulse: AI-Powered Personal Finance Dashboard

Welcome to FinPulse! This is a feature-rich, modern personal finance application built to showcase a powerful, scalable, and AI-integrated web stack. It's designed not just as a functional app, but as a high-quality boilerplate demonstrating best practices with Next.js, Firebase, and Google's Genkit.

![FinPulse Dashboard Screenshot](https://picsum.photos/seed/app-dashboard/1200/800)

## ✨ Core Features

FinPulse provides a complete suite of tools for personal financial management, including:

*   **Dashboard:** A central hub for a high-level overview of income, expenses, and net worth.
*   **Transaction Management:** Manual transaction entry with AI-powered category suggestions.
*   **Financial Goals:** Create, track, and manage long-term financial milestones.
*   **Budgeting:** Set monthly budgets and track spending in real-time.
*   **Recurring Transactions:** Manage automated income and expenses like salaries and subscriptions.
*   **Financial Organizer:** A Kanban-style task board and calendar to manage financial to-dos.
*   **Projects:** Group goals, tasks, and expenses into larger financial undertakings (e.g., "Home Renovation").
*   **Secure Bank Linking:** (Prototype) A flow for securely connecting external bank accounts.
*   **Pro & Free Tiers:** A complete subscription model with protected features for Pro users.

## 🤖 AI-Powered by Genkit

FinPulse leverages **Google's Genkit** to deliver intelligent, AI-driven features:

*   **AI Financial Advisor:** Get personalized, actionable financial plans based on your unique situation.
*   **Smart Alerts:** Receive AI-generated alerts about potential budget overruns or savings opportunities.
*   **AI Category Suggestion:** Transaction descriptions are automatically analyzed to suggest relevant spending categories.
*   **Dynamic Prompt Generation:** The AI Advisor prompt is dynamically generated based on a user's current and past financial goals.
*   **Conversational Chatbot:** An in-app chatbot trained on the user guide to answer questions about the app's features.

## 🚀 Tech Stack

This project is built with a modern, type-safe, and performant technology stack:

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
*   **AI Integration:** [Google Genkit](https://firebase.google.com/docs/genkit)
*   **Backend & Auth:** [Firebase](https://firebase.google.com/) (Authentication & Firestore)
*   **State Management:** React Hooks & Context API
*   **Form Handling:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
*   **Deployment:** [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## 🔧 Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of your project and add your Firebase configuration keys. You can get these from your Firebase project settings.

    ```env
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="<your-project-id>"
    NEXT_PUBLIC_FIREBASE_APP_ID="<your-app-id>"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="<your-storage-bucket>"
    NEXT_PUBLIC_FIREBASE_API_KEY="<your-api-key>"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="<your-auth-domain>"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="<your-messaging-sender-id>"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. You can start by creating a new account on the sign-up page!
