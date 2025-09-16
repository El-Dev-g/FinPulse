// src/app/signup/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, UserPlus, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { Logo } from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";
import { addCategory, updateUserProfile } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";


function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={cn("flex items-center text-sm", met ? "text-green-600" : "text-muted-foreground")}>
      {met ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
      {label}
    </div>
  );
}

function EmailSignUpForm() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const passwordRequirements = useMemo(() => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    return { hasUppercase, hasLowercase, hasNumber, hasSymbol, isLongEnough };
  }, [password]);

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRequirementsMet) {
      setError("Password does not meet all requirements.");
      return;
    }
    if (!termsAccepted) {
      setError("You must accept the terms and conditions.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential.user) {
        const uid = userCredential.user.uid;
        // Set display name in Auth
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });
        
        // Create user profile in Firestore
        await updateUserProfile(uid, { currency: 'USD' });
        
        // Add default "Income" category for the new user
        await addCategory({ name: 'Income' }, uid);

        await sendEmailVerification(userCredential.user);
      }
      router.push("/verify-email");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Username</Label>
          <Input
            id="displayName"
            type="text"
            placeholder="John Doe"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
           <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
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
        
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-2">
            <PasswordRequirement met={passwordRequirements.isLongEnough} label="At least 8 characters" />
            <PasswordRequirement met={passwordRequirements.hasUppercase} label="One uppercase letter" />
            <PasswordRequirement met={passwordRequirements.hasLowercase} label="One lowercase letter" />
            <PasswordRequirement met={passwordRequirements.hasNumber} label="One number" />
            <PasswordRequirement met={passwordRequirements.hasSymbol} label="One special symbol" />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
         <div className="flex items-center space-x-2">
          <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))} />
            <label
              htmlFor="terms"
              className="text-sm text-muted-foreground"
            >
              I agree to the{" "}
              <Link href="/policy/terms" className="underline hover:text-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/policy/privacy" className="underline hover:text-primary">
                Privacy Policy
              </Link>
              .
            </label>
         </div>
        <Button type="submit" className="w-full" disabled={loading || !allRequirementsMet || !termsAccepted}>
          {loading ? <Loader className="animate-spin" /> : <UserPlus />}
          Create Account
        </Button>
      </CardFooter>
    </form>
  );
}

export default function SignUpPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  if (authLoading || user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full space-y-6">
        <div className="flex flex-col items-center text-center">
          <Link href="/">
            <Logo />
          </Link>
           <h1 className="text-2xl font-semibold tracking-tight mt-6">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your details below to create your account
          </p>
        </div>
        <Card className="w-full">
          <EmailSignUpForm />
          <p className="mt-4 px-6 pb-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-semibold text-primary hover:underline"
            >
              Sign In
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
