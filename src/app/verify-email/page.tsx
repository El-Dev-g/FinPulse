// src/app/verify-email/page.tsx
"use client";

import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmailPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/signin');
      return;
    }
    
    // Check if user is already verified
    if (user.emailVerified) {
        if (!isVerified) { // Prevent multiple toasts
             toast({
                title: "Email Verified!",
                description: "Redirecting you to get started...",
            });
            setIsVerified(true);
            setTimeout(() => router.push('/welcome/onboarding'), 2000);
        }
    }
    
    const interval = setInterval(async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          clearInterval(interval);
          if (!isVerified) { // Prevent multiple toasts
              toast({
                  title: "Email Verified!",
                  description: "Redirecting you to get started...",
              });
              setIsVerified(true);
              setTimeout(() => router.push('/welcome/onboarding'), 2000);
          }
        }
      }
    }, 3000);

    return () => clearInterval(interval);

  }, [user, authLoading, router, toast, isVerified]);


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
  
  if (authLoading || !user) {
      return (
          <div className="flex h-screen items-center justify-center">
            <Loader className="h-12 w-12 animate-spin text-primary" />
          </div>
      )
  }
  
  if (isVerified) {
       return (
          <div className="flex h-screen items-center justify-center">
             <div className="flex flex-col items-center gap-4">
                <MailCheck className="h-16 w-16 text-primary" />
                <h2 className="text-2xl font-semibold">Email Verified!</h2>
                <p className="text-muted-foreground">Redirecting you now...</p>
                <Loader className="h-8 w-8 animate-spin text-primary mt-4" />
             </div>
          </div>
      )
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
              account. This page will update automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
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
