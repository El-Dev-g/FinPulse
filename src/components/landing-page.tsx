
"use client";

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import {
  BarChart,
  Lightbulb,
  Wallet,
  Target,
  Bot,
  PieChart,
  Twitter,
  Github,
  Linkedin,
  Check,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { Chatbot } from "./chatbot";
import content from "@/content/landing-page.json";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const icons: { [key: string]: React.ReactNode } = {
  Wallet: <Wallet className="h-8 w-8 text-primary" />,
  BarChart: <BarChart className="h-8 w-8 text-primary" />,
  Target: <Target className="h-8 w-8 text-primary" />,
  Bot: <Bot className="h-8 w-8 text-primary" />,
  PieChart: <PieChart className="h-8 w-8 text-primary" />,
  Lightbulb: <Lightbulb className="h-8 w-8 text-primary" />,
};

export default function LandingPage() {
  const { hero, features, pricing, cta, footer } = content;
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
            <Link href="/">
              <Logo className="text-primary-foreground" />
            </Link>
            <nav className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" asChild className="hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    <Link href="/signin">Log In</Link>
                </Button>
                <Button asChild variant="secondary">
                    <Link href="/signup">Sign Up</Link>
                </Button>
            </nav>
        </div>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto px-4 py-16 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-headline font-bold text-primary">
                {hero.title}
              </h1>
              <p className="text-lg text-foreground/80">
                {hero.description}
              </p>
              <div className="flex gap-4">
                <Button size="lg" asChild>
                  <Link href="/signup">{hero.buttonText}</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://picsum.photos/seed/fintech-dashboard/800/600"
                alt="A financial management dashboard showing charts and graphs."
                fill
                className="object-cover"
                data-ai-hint="financial dashboard"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
            </div>
          </div>
        </section>

        <section id="features" className="bg-background py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">
                {features.title}
              </h2>
              <p className="text-lg mt-4 text-foreground/70">
                {features.description}
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
              {features.items.map((feature, index) => (
                <Card
                  key={index}
                  className="bg-card/80 hover:bg-card transition-all duration-300 hover:shadow-lg"
                >
                  <CardHeader>
                    {icons[feature.icon]}
                    <CardTitle className="mt-4 font-headline">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="pt-2">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
         <section id="pricing" className="bg-muted/30 py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">
                {pricing.title}
              </h2>
              <p className="text-lg mt-4 text-foreground/70">
                {pricing.description}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4 mb-10">
              <Label htmlFor="billing-cycle-landing" className={cn(billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground')}>Monthly</Label>
              <Switch
                id="billing-cycle-landing"
                checked={billingCycle === 'annually'}
                onCheckedChange={(checked) => setBillingCycle(checked ? 'annually' : 'monthly')}
              />
              <Label htmlFor="billing-cycle-landing" className={cn(billingCycle === 'annually' ? 'text-foreground' : 'text-muted-foreground')}>
                Annually
                <span className="text-xs text-primary font-semibold ml-2 bg-primary/10 px-2 py-1 rounded-full">{pricing.annualDiscount}</span>
              </Label>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
              {pricing.plans.map((plan, index) => {
                const price = billingCycle === 'annually' && plan.annualPrice ? plan.annualPrice : plan.price;
                const frequency = billingCycle === 'annually' && plan.annualFrequency ? plan.annualFrequency : plan.frequency;
                return (
                <Card
                  key={index}
                  className={cn("flex flex-col h-full", plan.isFeatured && "border-primary shadow-lg")}
                >
                  <CardHeader>
                    <CardTitle className="font-headline text-2xl">{plan.title}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div>
                      <span className="text-4xl font-bold">{price}</span>
                      <span className="text-muted-foreground">{frequency}</span>
                       {billingCycle === 'annually' && plan.monthlyEquivalent && (
                        <p className="text-sm text-muted-foreground mt-1">{plan.monthlyEquivalent} per month</p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-3">
                      {plan.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-primary" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                     <Button asChild className="w-full" size="lg" variant={plan.isFeatured ? 'default' : 'outline'}>
                        <Link href="/signup">{plan.buttonText}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )})}
            </div>
             <div className="text-center mt-12 text-sm text-muted-foreground">
                <p>Have questions? <Link href="/contact" className="underline hover:text-primary">Contact our support team</Link>.</p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="bg-primary text-primary-foreground p-12 rounded-2xl text-center flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">
              {cta.title}
            </h2>
            <p className="mt-4 max-w-2xl">
              {cta.description}
            </p>
            <Button variant="secondary" size="lg" className="mt-8" asChild>
              <Link href="/signup">{cta.buttonText}</Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="bg-card/50">
        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-4">
                    <Link href="/">
                      <Logo />
                    </Link>
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
      <Chatbot />
    </div>
  );
}
