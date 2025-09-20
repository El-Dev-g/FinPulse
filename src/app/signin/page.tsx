
// src/app/signin/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, LogIn, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";

function EmailSignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setSubscriptionStatus } = useAuth();


  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // For prototype, if user logs in with Pro credentials, set status
      if (email.toLowerCase() === 'pro@user.com') {
          setSubscriptionStatus('active');
      }
      // The useAuth hook will handle redirection
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn}>
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
          />
           <p className="text-xs text-muted-foreground">Test with `pro@user.com` and `password123` to log in as a pro user.</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
           <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
             <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
      <CardFooter className="p-0 mt-6">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader className="animate-spin" /> : <LogIn />}
          Sign In
        </Button>
      </CardFooter>
    </form>
  );
}

export default function SignInPage() {
  const { user, checked } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (checked && user) {
      router.push("/dashboard");
    }
  }, [user, checked, router]);

  if (!checked || user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl space-y-6">
         <div className="flex justify-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <Card className="w-full text-left overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="hidden md:flex flex-col justify-between bg-muted p-8">
              <div>
                <h2 className="text-2xl font-bold font-headline">Welcome Back!</h2>
                <p className="text-muted-foreground mt-2">
                  Sign in to access your financial dashboard and continue your journey towards financial freedom.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} FinPulse Inc.</p>
            </div>
            <div className="p-6 sm:p-8">
              <CardHeader className="p-0 mb-6">
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
              </CardHeader>
              <EmailSignInForm />
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
