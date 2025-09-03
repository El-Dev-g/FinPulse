
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
    "/studio/signup", // Allow access to studio signup
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
        setIsAdmin(profile?.isAdmin || false);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (loading) {
      return; // Wait until authentication state is determined
    }

    const onProtectedRoute = !unprotectedRoutes.includes(pathname) && !isOnboardingRoute(pathname);

    // --- Handle Unauthenticated Users ---
    if (!user) {
      if (onProtectedRoute) {
        router.push('/signin');
      }
      return;
    }

    // --- Handle Authenticated Users ---
    if (isAdmin) {
      // If admin is on a non-studio page (and not on the homepage), redirect to studio
      if (!isStudioRoute(pathname) && pathname !== '/') {
        router.push('/studio');
      }
    } else { // Regular user
      // If a regular user tries to access any studio route, redirect to dashboard
      if (isStudioRoute(pathname)) {
        router.push('/dashboard');
      }
      // If a regular user is on an auth page, redirect to dashboard
      if (pathname === '/signin' || pathname === '/signup') {
         router.push('/dashboard');
      }
    }

  }, [user, loading, isAdmin, pathname, router]);

  
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
