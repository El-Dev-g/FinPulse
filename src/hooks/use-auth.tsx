// src/hooks/use-auth.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { User, onAuthStateChanged, getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { getUserProfile, updateUserProfile } from "@/lib/db";
import type { UserProfile } from "@/lib/types";

type SubscriptionStatus = 'free' | 'active' | 'past_due';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  currency: string;
  isPro: boolean;
  subscriptionStatus: SubscriptionStatus;
  setCurrency: (currency: string) => void;
  setSubscriptionStatus: (status: SubscriptionStatus) => void;
  formatCurrency: (amount: number) => string;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  currency: "USD",
  isPro: false,
  subscriptionStatus: 'free',
  setCurrency: () => {},
  setSubscriptionStatus: () => {},
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
  "/pricing",
];

const isOnboardingRoute = (pathname: string) =>
  pathname.startsWith("/welcome/onboarding");

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrencyState] = useState("USD");
  const [subscriptionStatus, setSubscriptionStatusState] = useState<SubscriptionStatus>('free');

  const auth = getAuth(app);
  const router = useRouter();
  const pathname = usePathname();

  const isPro = useMemo(() => subscriptionStatus === 'active' || subscriptionStatus === 'past_due', [subscriptionStatus]);

  const refreshProfile = useCallback(async () => {
    if (auth.currentUser) {
        try {
            const userProfile = await getUserProfile(auth.currentUser.uid);
            setProfile(userProfile);
            if (userProfile?.currency) {
                setCurrencyState(userProfile.currency);
            }
             // For prototype purposes, we check a local storage flag.
            const proStatus = localStorage.getItem('subscriptionStatus') as SubscriptionStatus | null;
            setSubscriptionStatusState(proStatus || 'free');

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
           // For prototype purposes, we check a local storage flag.
           const subStatus = localStorage.getItem('subscriptionStatus') as SubscriptionStatus | null;
           setSubscriptionStatusState(subStatus || 'free');
        } else {
            setProfile(null);
            setSubscriptionStatusState('free');
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
  
  const handleSetSubscriptionStatus = useCallback((status: SubscriptionStatus) => {
      setSubscriptionStatusState(status);
      // In a real app, this would be handled by backend events. For now, we use localStorage.
      if (typeof window !== 'undefined') {
          if (status === 'free') {
            localStorage.removeItem('subscriptionStatus');
          } else {
            localStorage.setItem('subscriptionStatus', status);
          }
      }
  }, []);

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
      value={{ user, profile, loading, currency, isPro, subscriptionStatus, setCurrency, setSubscriptionStatus: handleSetSubscriptionStatus, formatCurrency, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
