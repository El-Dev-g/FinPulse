
// src/app/studio/signup/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
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
import { Loader, UserPlus } from "lucide-react";
import { Logo } from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";
import { updateUserProfile, addCategory } from "@/lib/db";

function StudioSignUpForm() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
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

        // Set as admin in Firestore
        await updateUserProfile(uid, { isAdmin: true, currency: 'USD' });
        
        // Add default "Income" category for the new admin user
        await addCategory({ name: 'Income' }, uid);
      }
      // The auth hook will redirect to /studio upon successful admin login
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
            placeholder="Admin User"
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
            placeholder="admin@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader className="animate-spin" /> : <UserPlus />}
          Create Admin Account
        </Button>
      </CardFooter>
    </form>
  );
}

export default function StudioSignUpPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      router.push("/studio");
    } else if (!authLoading && user && !isAdmin) {
      router.push("/dashboard");
    }
  }, [user, authLoading, isAdmin, router]);

  if (authLoading || (user && isAdmin)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <Card className="w-full text-left">
          <CardHeader>
            <CardTitle>Create Studio Account</CardTitle>
            <CardDescription>
              Create a new administrator account for FinPulse.
            </CardDescription>
          </CardHeader>
          <StudioSignUpForm />
          <p className="px-6 pb-6 text-center text-sm text-muted-foreground">
            Already have an admin account?{" "}
            <Link
              href="/studio/signin"
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
