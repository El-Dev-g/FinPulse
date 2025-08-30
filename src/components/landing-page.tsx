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
  Linkedin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { Chatbot } from "./chatbot";


const features = [
  {
    icon: <Wallet className="h-8 w-8 text-primary" />,
    title: "Dashboard Overview",
    description:
      "A consolidated view of key financial metrics, including income, expenses, and net worth.",
  },
  {
    icon: <BarChart className="h-8 w-8 text-primary" />,
    title: "Data Visualization",
    description:
      "Generate interactive charts and graphs to visualize financial data trends over time.",
  },
  {
    icon: <Target className="h-8 w-8 text-primary" />,
    title: "Goal Setting",
    description:
      "Enable users to set financial goals and track progress towards them effectively.",
  },
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: "Personalized Financial Tips",
    description:
      "Our AI offers personalized financial advice based on your spending habits and goals.",
  },
  {
    icon: <PieChart className="h-8 w-8 text-primary" />,
    title: "Transaction Categorization",
    description:
      "Automatically categorize transactions to understand where your money is going.",
  },
  {
    icon: <Lightbulb className="h-8 w-8 text-primary" />,
    title: "Smart Insights",
    description:
      "Gain actionable insights to improve your financial health and make better decisions.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/signin">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary">
                Take Control of Your Financial Future.
              </h1>
              <p className="text-lg text-foreground/80">
                FinPulse is your all-in-one financial companion. Track your
                spending, set meaningful goals, and get personalized AI-powered
                advice to build a healthier financial life.
              </p>
              <div className="flex gap-4">
                <Button size="lg" asChild>
                  <Link href="/signup">Get Started for Free</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://picsum.photos/800/600"
                alt="Financial Dashboard"
                fill
                className="object-cover"
                data-ai-hint="finance dashboard"
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
                Everything You Need to Succeed
              </h2>
              <p className="text-lg mt-4 text-foreground/70">
                FinPulse provides a powerful suite of tools to help you
                understand and improve your financial well-being.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="bg-card/80 hover:bg-card transition-all duration-300 hover:shadow-lg"
                >
                  <CardHeader>
                    {feature.icon}
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

        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="bg-primary text-primary-foreground p-12 rounded-2xl text-center flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">
              Ready to Transform Your Finances?
            </h2>
            <p className="mt-4 max-w-2xl">
              Join thousands of users who are building a brighter financial
              future with FinPulse. It's free to get started.
            </p>
            <Button variant="secondary" size="lg" className="mt-8" asChild>
              <Link href="/signup">Create Your Account</Link>
            </Button>
          </div>
        </section>
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
                            <li><Link href="#features" className="hover:text-primary">Features</Link></li>
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
      <Chatbot />
    </div>
  );
}
