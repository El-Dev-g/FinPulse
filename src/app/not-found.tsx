import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Frown } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="container mx-auto flex flex-col items-center justify-center gap-12 px-4 text-center">
        <div className="flex flex-col items-center gap-4">
          <Frown className="h-24 w-24 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-headline">
            404 - Page Not Found
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved or deleted.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
