
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
    "/signin",
    "/signup",
    "/forgot-password",
    "/verify-email",
    "/",
    "/about",
    "/contact",
    "/policy/privacy",
    "/policy/terms",
];

const isOnboardingRoute = (pathname: string) => pathname.startsWith('/welcome/onboarding');
const isStudioRoute = (pathname: string) => pathname.startsWith('/studio');


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currency, setCurrencyState] = useState("USD");
  const auth = getAuth(app);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const profile = await getUserProfile();
        if (profile?.currency) {
          setCurrencyState(profile.currency);
        }
        // Ensure isAdmin is explicitly set to false if not present
        setIsAdmin(profile?.isAdmin || false);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    // Don't run any redirect logic until the authentication state is fully loaded.
    if (loading) {
      return;
    }

    const isProtectedRoute = !unprotectedRoutes.includes(pathname) && !isOnboardingRoute(pathname);
    const isStudioPage = isStudioRoute(pathname);

    // Case 1: User is not logged in.
    if (!user) {
      // If the route is protected, redirect to sign-in.
      if (isProtectedRoute) {
        router.push("/signin");
      }
      // Otherwise, allow access to unprotected routes.
      return;
    }

    // Case 2: User is logged in.
    if (user) {
      // If they are not an admin but are trying to access a studio page, redirect them.
      if (!isAdmin && isStudioPage) {
        router.push("/dashboard");
      }
      // If they are an admin, or are on a non-studio page, allow access.
    }

  }, [user, loading, pathname, router, isAdmin]);

  
  const setCurrency = useCallback(async (newCurrency: string) => {
    setCurrencyState(newCurrency);
    if(auth.currentUser) {
      await updateUserProfile({ currency: newCurrency });
    }
  }, [auth.currentUser]);
  
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
    }).format(amount);
  }, [currency]);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, currency, setCurrency, formatCurrency }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
