// src/app/dashboard/catalog/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, PiggyBank, ShieldCheck, TrendingUp } from "lucide-react";

const catalogItems = [
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: "High-Yield Savings Account",
    description: "Earn a competitive interest rate on your savings with our high-yield account.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Credit Builder Card",
    description: "Build your credit score responsibly with our secured credit card.",
  },
   {
    icon: <PiggyBank className="h-8 w-8 text-primary" />,
    title: "Automated Investing",
    description: "Start investing with a diversified portfolio tailored to your risk tolerance.",
  },
  {
    icon: <BookOpen className="h-8 w-8 text-primary" />,
    title: "Financial Literacy Course",
    description: "Enroll in our free course to learn the fundamentals of personal finance.",
  },
];

export default function CatalogPage() {
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              Product Catalog
            </h2>
            <p className="text-muted-foreground">
              Browse financial products and services tailored for you.
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {catalogItems.map((item, index) => (
             <Card key={index} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-4">
                  {item.icon}
                  <CardTitle>{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}