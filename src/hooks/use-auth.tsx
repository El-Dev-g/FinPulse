// src/hooks/use-auth.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { User, onAuthStateChanged, getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { getUserProfile, updateUserProfile } from "@/lib/db";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  currency: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (amount: number) => string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  currency: "USD",
  setCurrency: () => {},
  formatCurrency: (amount: number) => String(amount),
});

const AUTH_PAGES = ["/signin", "/signup", "/forgot-password", "/verify-email"];
const ONBOARDING_PAGES = ["/welcome/onboarding"];
const PUBLIC_PAGES = ["/", ...AUTH_PAGES, ...ONBOARDING_PAGES];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrencyState] = useState("USD");
  const router = useRouter();
  const pathname = usePathname();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile();
        if (profile?.currency) {
          setCurrencyState(profile.currency);
        }
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);
  
  const setCurrency = useCallback(async (newCurrency: string) => {
    setCurrencyState(newCurrency);
    await updateUserProfile({ currency: newCurrency });
  }, []);
  
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
    }).format(amount);
  }, [currency]);


  useEffect(() => {
    if (loading) return;

    const isPublicPage = PUBLIC_PAGES.some((p) => pathname.startsWith(p));
    const isAuthPage = AUTH_PAGES.includes(pathname);
    const isOnboardingPage = ONBOARDING_PAGES.includes(pathname);

    if (!user && !isPublicPage) {
      router.push("/signin");
      return;
    }

    if (user) {
      const isEmailVerified =
        user.emailVerified ||
        user.providerData.some((p) => p.providerId !== "password");

      // Check if onboarding is complete from localStorage
      const onboardingComplete =
        typeof window !== "undefined"
          ? localStorage.getItem("onboardingComplete") === "true"
          : false;

      const isNewUser =
        user.metadata.creationTime === user.metadata.lastSignInTime &&
        !onboardingComplete;

      if (!isEmailVerified && pathname !== "/verify-email") {
        router.push("/verify-email");
        return;
      }

      if (isEmailVerified) {
        if (isNewUser && !isOnboardingPage) {
          router.push("/welcome/onboarding");
          return;
        }
        if (!isNewUser && (isAuthPage || isOnboardingPage || pathname === "/")) {
          router.push("/dashboard");
          return;
        }
      }
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, currency, setCurrency, formatCurrency }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
