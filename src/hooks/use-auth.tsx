
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
    if (loading) return; // Do nothing until authentication state is resolved

    const isStudioPage = isStudioRoute(pathname);
    const isStudioAuthPage = studioAuthRoutes.includes(pathname);
    const isUnprotectedPage = unprotectedRoutes.includes(pathname);
    const isOnboardingPage = isOnboardingRoute(pathname);
    
    // If the user is NOT logged in
    if (!user) {
      // If the user is trying to access a protected route (not studio, not regular auth, not onboarding)
      if (!isUnprotectedPage && !isStudioAuthPage && !isOnboardingPage) {
        // If it's a studio route, send to studio signin, otherwise regular signin
        router.push(isStudioPage ? '/studio/signin' : '/signin');
      }
      return; // No other checks needed for unauthenticated users
    }

    // If the user IS logged in
    if (isAdmin) {
      // If admin is on a regular user auth page or a studio auth page, redirect to studio dashboard
      if (isUnprotectedPage || isStudioAuthPage) {
         if (pathname === '/' || pathname === '/signin' || pathname === '/signup' || pathname === '/studio/signin' || pathname === '/studio/signup') {
            router.push('/studio');
         }
      }
    } else { // Regular user
      // If a regular user tries to access any studio page, redirect to their dashboard
      if (isStudioPage) {
        router.push('/dashboard');
      }
      // If a regular user is on the main auth pages, redirect them to dashboard
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
