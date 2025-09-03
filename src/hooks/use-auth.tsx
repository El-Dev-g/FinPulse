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
  isAdmin: boolean;
  currency: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (amount: number) => string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  currency: "USD",
  setCurrency: () => {},
  formatCurrency: (amount: number) => String(amount),
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
const isStudioRoute = (pathname: string) => pathname.startsWith("/studio");

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currency, setCurrencyState] = useState("USD");
  const auth = getAuth(app);
  const router = useRouter();
  const pathname = usePathname();

  // --- AUTH STATE LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          const profile = await getUserProfile(user.uid);
          if (profile?.currency) {
            setCurrencyState(profile.currency);
          }
          setIsAdmin(profile?.isAdmin || false);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // --- ROUTE PROTECTION ---
  useEffect(() => {
    if (loading) return; // Don't redirect until we know the user's auth state

    const isUnprotected = unprotectedRoutes.includes(pathname) || isOnboardingRoute(pathname);
    const isStudioPage = isStudioRoute(pathname);

    // If user is not logged in, and trying to access a protected page
    if (!user && !isUnprotected) {
      router.push("/signin");
      return;
    }

    // If user is logged in
    if (user) {
      // If user is admin
      if (isAdmin) {
        // If an admin is on a non-studio page, redirect them to the studio
        if (!isStudioPage) {
          router.push("/studio");
        }
      } else {
        // If a regular user is on a studio page, redirect them to the dashboard
        if (isStudioPage) {
          router.push("/dashboard");
        }
        // If a logged-in regular user is on an auth page, redirect them to the dashboard
        if (pathname === '/signin' || pathname === '/signup' || pathname === '/') {
            router.push('/dashboard');
        }
      }
    }
  }, [user, loading, isAdmin, pathname, router]);

  // --- UTILS ---
  const setCurrency = useCallback(
    async (newCurrency: string) => {
      setCurrencyState(newCurrency);
      if (auth.currentUser) {
        await updateUserProfile({ currency: newCurrency });
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
      value={{ user, loading, isAdmin, currency, setCurrency, formatCurrency }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
