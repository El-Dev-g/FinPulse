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

const studioAuthRoutes = ["/studio/signin", "/studio/signup"];

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
    if (loading) return; // Don't do anything until loading is false

    const isUnprotected = unprotectedRoutes.includes(pathname);
    const isOnboarding = isOnboardingRoute(pathname);
    const isStudioPage = isStudioRoute(pathname);
    
    // User is not logged in
    if (!user) {
        if (!isUnprotected && !isOnboarding) {
            router.push('/signin');
        }
        return;
    }

    // User is logged in
    if (isAdmin) {
        if (!isStudioPage) {
            router.push('/studio');
        }
    } else { // Regular user
        if (isStudioPage) {
            router.push('/dashboard');
        } else if (pathname === '/' || pathname === '/signin' || pathname === '/signup') {
            router.push('/dashboard');
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
