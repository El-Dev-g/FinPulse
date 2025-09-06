// src/app/about/page.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const features = [
  {
    name: "Unified Dashboard",
    description:
      "Get a bird's-eye view of your income, expenses, and net worth in one clean interface.",
  },
  {
    name: "Intelligent Tracking",
    description:
      "Automatically categorize your transactions to see exactly where your money is going.",
  },
  {
    name: "Goal Setting & Progress",
    description:
      "Define your financial milestones, from saving for a vacation to planning for retirement, and watch your progress unfold.",
  },
  {
    name: "AI-Powered Advice",
    description:
      "Leverage the power of artificial intelligence to receive personalized tips and financial plans tailored to your unique situation.",
  },
  {
    name: "Budgeting Made Easy",
    description:
      "Create and stick to budgets without the headache. Our tools help you stay on track without restrictive rules.",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">About FinPulse</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your dedicated partner in achieving financial wellness.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Our Vision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We believe that financial clarity is the first step towards
              financial freedom. In a world of complex financial products and
              overwhelming information, we aim to provide a simple, beautiful,
              and powerful platform that cuts through the noise.
            </p>
            <p>
              We want to make managing money less of a chore and more of an
              empowering experience.
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="font-headline">Our Commitment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
             Your trust is our most important asset. We are committed to securing your data with bank-level security and providing a transparent, user-centric experience. 
            </p>
            <p>
                We are constantly innovating and improving our platform to meet your evolving financial needs. Join the FinPulse community today and take the first step towards a brighter financial future.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <div className="text-center">
             <h2 className="text-3xl font-bold font-headline">What We Do</h2>
            <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
                FinPulse offers a comprehensive suite of tools designed for modern financial management:
            </p>
        </div>
         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.name} className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full mt-1">
                 <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{feature.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
