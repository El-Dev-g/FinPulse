// src/app/verify-email/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { sendEmailVerification } from "firebase/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader, MailCheck, MailWarning } from "lucide-react";
import { Logo } from "@/components/logo";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResendVerification = async () => {
    if (!user) {
      setError("You are not logged in.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await sendEmailVerification(user);
      setMessage("A new verification email has been sent.");
    } catch (err: any) {
      setError("Failed to send verification email. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading) {
      return (
          <div className="flex h-screen items-center justify-center">
            <Loader className="h-12 w-12 animate-spin text-primary" />
          </div>
      )
  }
  
  if (!user) {
    router.push('/signin');
    return null;
  }
  
  if (user.emailVerified) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        <Card>
          <CardHeader className="items-center text-center">
            <MailCheck className="h-16 w-16 text-primary mb-4"/>
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to{" "}
              <span className="font-semibold text-foreground">{user.email}</span>.
              Please check your inbox and follow the link to activate your
              account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Once your email is verified, you will be able to access your dashboard.
            </p>
             {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
             {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              onClick={handleResendVerification}
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader className="animate-spin" />
              ) : (
                <MailWarning />
              )}
              Resend Verification Email
            </Button>
            <Button variant="ghost" asChild className="w-full">
                <Link href="/signin">Back to Sign In</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
