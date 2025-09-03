
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
import { updateUserProfile } from "@/lib/db";


function AdminSignUpForm() {
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
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });
        // Set user as admin in Firestore
        await updateUserProfile({ isAdmin: true });
      }
      // Redirect to the studio after successful admin creation
      router.push('/studio');
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
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader className="animate-spin" /> : <UserPlus />}
          Create Admin Account
        </Button>
      </CardFooter>
    </form>
  );
}

export default function AdminSignUpPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
      if (!authLoading && isAdmin) {
        router.push("/studio");
      }
    }, [isAdmin, authLoading, router]);

    if (authLoading) {
        return (
          <div className="flex h-screen items-center justify-center">
            <Loader className="h-12 w-12 animate-spin text-primary" />
          </div>
        );
    }


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Create Admin Account</CardTitle>
            <CardDescription>
              Sign up for a new administrator account for the Studio.
            </CardDescription>
          </CardHeader>
          <AdminSignUpForm />
          <p className="text-center text-sm text-muted-foreground pb-6">
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
