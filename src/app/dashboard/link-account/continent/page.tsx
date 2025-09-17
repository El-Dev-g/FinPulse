// src/app/dashboard/link-account/continent/page.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

const continents = [
  { name: 'Africa', path: '/africa' },
  { name: 'Asia', path: '/asia' },
  { name: 'Europe', path: '/europe' },
  { name: 'North America', path: '/north-america' },
  { name: 'South America', path: '/south-america' },
];

export default function SelectContinentPage() {
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/dashboard/link-account">
              <ArrowLeft className="mr-2" />
              Back to Accounts
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Globe className="h-8 w-8" />
            Select Your Region
          </h2>
          <p className="text-muted-foreground">
            Choose the continent where your bank is located.
          </p>
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              {continents.map((continent) => (
                <Link
                  key={continent.name}
                  href="#" // This will be updated later to point to country selection
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-muted"
                >
                  <span className="font-medium">{continent.name}</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
