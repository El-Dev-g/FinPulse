// src/app/signup/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithRedirect,
  GoogleAuthProvider,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
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
import { Loader, UserPlus, Phone } from "lucide-react";
import { Logo } from "@/components/logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C14.03,4.73 15.6,5.33 16.9,6.53L19.05,4.58C17.02,2.68 14.83,1.69 12.19,1.69C6.81,1.69 2.5,6.25 2.5,12C2.5,17.75 6.81,22.31 12.19,22.31C17.64,22.31 21.5,18.45 21.5,12.23C21.5,11.66 21.45,11.38 21.35,11.1Z"
    />
  </svg>
);

function EmailSignUpForm() {
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
        await sendEmailVerification(userCredential.user);
      }
      router.push('/verify-email');
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
          Sign Up with Email
        </Button>
      </CardFooter>
    </form>
  );
}

function PhoneSignUpForm() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const router = useRouter();
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        });
      }
      const verifier = recaptchaVerifierRef.current;
      const result = await signInWithPhoneNumber(auth, `+${phone}`, verifier);
      setConfirmationResult(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);
    setError(null);
    try {
      await confirmationResult.confirm(otp);
      router.push("/welcome/onboarding");
    } catch (err: any)
       {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
   return (
    <form onSubmit={confirmationResult ? handleVerifyOtp : handleSendOtp}>
        <CardContent className="space-y-4">
          {!confirmationResult ? (
            <div className="space-y-2">
              <Label htmlFor="phone-signup">Phone Number</Label>
              <Input
                id="phone-signup"
                type="tel"
                placeholder="1234567890 (include country code)"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="otp-signup">Verification Code</Label>
              <Input
                id="otp-signup"
                type="text"
                placeholder="Enter 6-digit code"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
          )}
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
                <Loader className="animate-spin" />
            ) : confirmationResult ? (
                "Verify & Sign Up"
            ) : (
                "Send Code"
            )}
            </Button>
        </CardFooter>
    </form>
  )
}

export default function SignUpPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
      if (!authLoading && user) {
        router.push("/dashboard");
      }
    }, [user, authLoading, router]);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
          const provider = new GoogleAuthProvider();
          await signInWithRedirect(auth, provider);
        } catch (err: any) {
          setError(err.message);
          setLoading(false);
        }
    };
    
    if (authLoading || user) {
        return (
          <div className="flex h-screen items-center justify-center">
            <Loader className="h-12 w-12 animate-spin text-primary" />
          </div>
        );
    }


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div id="recaptcha-container"></div>
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Create an account to get started with FinPulse.
            </CardDescription>
          </CardHeader>
           <Tabs defaultValue="email" className="w-full">
             <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email"><UserPlus className="mr-2"/>Email</TabsTrigger>
              <TabsTrigger value="phone"><Phone className="mr-2"/>Phone</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
                <EmailSignUpForm />
            </TabsContent>
            <TabsContent value="phone">
                <PhoneSignUpForm />
            </TabsContent>
           </Tabs>
            <CardContent className="pt-0">
               <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                type="button"
                disabled={loading}
              >
                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                <GoogleIcon />
                Sign Up with Google
              </Button>
            </CardContent>
          
          <p className="text-center text-sm text-muted-foreground pb-6">
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
