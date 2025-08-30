// src/app/policy/layout.tsx
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export default function PolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 h-20 flex items-center justify-between border-b">
        <Logo />
        <Button asChild variant="ghost">
          <Link href="/">Back to Home</Link>
        </Button>
      </header>
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="prose dark:prose-invert max-w-4xl mx-auto">
            {children}
        </div>
      </main>
       <footer className="bg-card/50">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Logo />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FinPulse. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
