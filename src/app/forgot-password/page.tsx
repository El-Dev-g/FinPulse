
// src/app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, Mail } from "lucide-react";
import { Logo } from "@/components/logo";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage(
        "If an account exists for this email, a password reset link has been sent."
      );
    } catch (err: any) {
      // We don't want to reveal if an email is registered or not for security reasons.
      // So we show a success message even if there's an error like 'auth/user-not-found'.
      // You might want to log the actual error for debugging.
      console.error(err);
      setSuccessMessage(
         "If an account exists for this email, a password reset link has been sent."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex justify-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="relative hidden md:block">
              <Image
                src="https://picsum.photos/seed/auth-bg-3/800/1000"
                alt="Abstract background image"
                fill
                className="object-cover"
                data-ai-hint="abstract texture"
              />
              <div className="relative z-10 flex h-full flex-col justify-between bg-primary/70 p-8 text-primary-foreground">
                 <div>
                  <h2 className="text-2xl font-bold font-headline">Reset Your Password</h2>
                  <p className="mt-2 text-primary-foreground/80">
                    Don't worry, it happens to the best of us. Just enter your email and we'll help you get back on track.
                  </p>
                </div>
                <p className="text-xs text-primary-foreground/70">© {new Date().getFullYear()} FinPulse Inc.</p>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <CardHeader className="p-0 mb-6">
                <CardTitle>Forgot Password</CardTitle>
                <CardDescription>
                  Enter your email to receive a password reset link.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleResetPassword}>
                <CardContent className="p-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading || !!successMessage}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  {successMessage && (
                    <p className="text-sm text-green-600 dark:text-green-500">{successMessage}</p>
                  )}
                </CardContent>
                <CardFooter className="p-0 flex flex-col gap-4 mt-6">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || !!successMessage}
                  >
                    {loading ? <Loader className="animate-spin" /> : <Mail />}
                    Send Reset Link
                  </Button>
                </CardFooter>
              </form>
              <p className="text-center text-sm text-muted-foreground pt-6">
                Remember your password?{" "}
                <Link
                  href="/signin"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
