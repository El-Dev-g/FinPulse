// src/app/page.tsx
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LandingPage from "@/components/landing-page";
import { Loader } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
       // Check if onboarding is complete
      const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
      if (!onboardingComplete) {
        router.push("/welcome/onboarding");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <LandingPage />;
}
