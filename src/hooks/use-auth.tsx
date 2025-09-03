
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

const studioAuthRoutes = [
    "/studio/signin",
    "/studio/signup",
]

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
    if (loading) {
      return; // Wait until authentication state is loaded
    }

    const onStudioRoute = isStudioRoute(pathname);
    const onStudioAuthRoute = studioAuthRoutes.includes(pathname);
    const onUnprotectedRoute = unprotectedRoutes.includes(pathname);
    const onOnboardingRoute = isOnboardingRoute(pathname);

    // If there's no user logged in
    if (!user) {
        // If trying to access a protected studio page, redirect to studio signin
        if (onStudioRoute && !onStudioAuthRoute) {
            router.push('/studio/signin');
        } 
        // If trying to access any other protected page, redirect to user signin
        else if (!onStudioRoute && !onUnprotectedRoute && !onOnboardingRoute) {
            router.push('/signin');
        }
        return;
    }

    // If a user is logged in
    if (user) {
        // If a non-admin tries to access any studio page, kick them to their dashboard
        if (!isAdmin && onStudioRoute) {
            router.push('/dashboard');
            return;
        }

        // If an admin is on a regular user auth page, redirect to studio
        if (isAdmin && (pathname === '/signin' || pathname === '/signup')) {
            router.push('/studio');
            return;
        }
        
        // If a logged-in admin is on a studio auth page, redirect to studio dashboard
        if (isAdmin && onStudioAuthRoute) {
            router.push('/studio');
            return;
        }

        // If any logged-in user is on a main auth page, send them to their correct dashboard
        if (onUnprotectedRoute) {
            router.push(isAdmin ? '/studio' : '/dashboard');
            return;
        }
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
