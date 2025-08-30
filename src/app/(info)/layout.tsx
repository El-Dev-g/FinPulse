// src/app/(info)/layout.tsx
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function InfoPageLayout({
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
        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-4">
                    <Logo />
                    <p className="text-sm text-muted-foreground max-w-xs">Your all-in-one financial companion to help you achieve financial wellness.</p>
                     <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} FinPulse. All rights reserved.
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:col-span-2">
                    <div>
                        <h4 className="font-semibold mb-3">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
                            <li><Link href="/#features" className="hover:text-primary">Features</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/policy/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                            <li><Link href="/policy/terms" className="hover:text-primary">Terms of Service</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3">Follow Us</h4>
                        <div className="flex space-x-4 text-muted-foreground">
                            <Link href="#" className="hover:text-primary"><Twitter /></Link>
                            <Link href="#" className="hover:text-primary"><Github /></Link>
                            <Link href="#" className="hover:text-primary"><Linkedin /></Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
