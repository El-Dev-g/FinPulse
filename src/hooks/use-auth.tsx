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
import type { UserProfile } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  currency: string;
  isPro: boolean;
  setCurrency: (currency: string) => void;
  formatCurrency: (amount: number) => string;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  currency: "USD",
  isPro: false,
  setCurrency: () => {},
  formatCurrency: (amount: number) => String(amount),
  refreshProfile: async () => {},
});

const unprotectedRoutes = [
  "/",
  "/signin",
  "/signup",
  "/forgot-password",
  "/verify-email",
  "/about",
  "/contact",
  "/policy/privacy",
  "/policy/terms",
];

const isOnboardingRoute = (pathname: string) =>
  pathname.startsWith("/welcome/onboarding");

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrencyState] = useState("USD");
  const [isPro, setIsPro] = useState(false);
  const auth = getAuth(app);
  const router = useRouter();
  const pathname = usePathname();

  const refreshProfile = useCallback(async () => {
    if (auth.currentUser) {
        try {
            const userProfile = await getUserProfile(auth.currentUser.uid);
            setProfile(userProfile);
            if (userProfile?.currency) {
                setCurrencyState(userProfile.currency);
            }
            // In a real app, you'd check a subscription status field here.
            // For this prototype, we'll keep it simple.
            // setIsPro(userProfile?.isSubscribed || false);
        } catch (err) {
            console.error("Error loading profile:", err);
        }
    }
  }, [auth.currentUser]);

  // --- AUTH STATE LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          const userProfile = await getUserProfile(user.uid);
          setProfile(userProfile);
          if (userProfile?.currency) {
            setCurrencyState(userProfile.currency);
          }
           // In a real app, you'd check a subscription status field here.
           // For this prototype, we'll hardcode it to false.
           setIsPro(false);
        } else {
            setProfile(null);
            setIsPro(false);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // --- ROUTE PROTECTION ---
  useEffect(() => {
    if (loading) return;

    const isUnprotectedPage = unprotectedRoutes.includes(pathname);
    const isOnboardingPage = isOnboardingRoute(pathname);

    // If user is not logged in, redirect to signin page if route is protected
    if (!user) {
      if (!isUnprotectedPage && !isOnboardingPage) {
        router.push("/signin");
      }
    } else {
      // If user is logged in, redirect from auth pages to dashboard
      if (pathname === "/signin" || pathname === "/signup" || pathname === "/") {
        router.push("/dashboard");
      }
    }
  }, [user, loading, pathname, router]);

  // --- UTILS ---
  const setCurrency = useCallback(
    async (newCurrency: string) => {
      setCurrencyState(newCurrency);
      if (auth.currentUser) {
        await updateUserProfile(auth.currentUser.uid, { currency: newCurrency });
      }
    },
    [auth.currentUser]
  );

  const formatCurrency = useCallback(
    (amount: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(amount);
    },
    [currency]
  );

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, currency, isPro, setCurrency, formatCurrency, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
