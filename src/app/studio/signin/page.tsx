
// src/app/studio/signin/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
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
import { Loader, LogIn } from "lucide-react";
import { Logo } from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";
import { getUserProfile } from "@/lib/db";


function AdminSignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // After sign-in, check if the user is an admin
      const profile = await getUserProfile();
      if (profile?.isAdmin) {
          router.push('/studio');
      } else {
          await auth.signOut(); // Sign out non-admin users
          setError("Access denied. You do not have admin privileges.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
        <CardHeader>
        <CardTitle>Studio Sign In</CardTitle>
        <CardDescription>
            Enter your credentials to access the admin studio.
        </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignIn}>
        <CardContent className="space-y-4">
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
            {loading ? <Loader className="animate-spin" /> : <LogIn />}
            Sign In
            </Button>
        </CardFooter>
        </form>
         <p className="text-center text-sm text-muted-foreground pb-6">
            Want to create a new admin account?{" "}
            <Link
              href="/studio/signup"
              className="font-semibold text-primary hover:underline"
            >
              Sign Up
            </Link>
          </p>
    </Card>
  )
}


export default function AdminSignInPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAdmin) {
      router.push("/studio");
    }
  }, [isAdmin, loading, router]);
  
  if (loading || isAdmin) {
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
        <AdminSignInForm />
      </div>
    </div>
  );
}
