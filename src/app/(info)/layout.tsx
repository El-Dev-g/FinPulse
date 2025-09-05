// src/app/(info)/layout.tsx
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";
import React from "react";
import content from "@/content/landing-page.json";

export default function InfoPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { footer } = content;
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
                    <p className="text-sm text-muted-foreground max-w-xs">{footer.description}</p>
                     <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} {footer.companyName}. All rights reserved.
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:col-span-2">
                     {footer.columns.map((column, index) => (
                        <div key={index}>
                            <h4 className="font-semibold mb-3">{column.title}</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                {column.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <Link href={link.href} className="hover:text-primary">{link.text}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
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
