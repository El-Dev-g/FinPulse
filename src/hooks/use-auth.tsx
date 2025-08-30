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

const unprotectedRoutes = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/verify-email",
    "/welcome/onboarding",
    "/",
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrencyState] = useState("USD");
  const auth = getAuth(app);
  const router = useRouter();
  const pathname = usePathname();

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
  
  useEffect(() => {
    if (loading) return;

    const isProtected = !unprotectedRoutes.includes(pathname);

    if (!user && isProtected) {
      router.push("/signin");
      return;
    }

    if (user) {
      // Check for new user after any sign-in/sign-up method
      const { creationTime, lastSignInTime } = user.metadata;
      const isNewUser = creationTime === lastSignInTime;
      const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';

      if (user.emailVerified && isNewUser && !onboardingComplete) {
        if (pathname !== "/welcome/onboarding") {
          router.push("/welcome/onboarding");
        }
      } else if (!user.emailVerified && !unprotectedRoutes.includes(pathname)) {
         // This condition handles password-based signups that need verification
        if (pathname !== '/verify-email') {
          router.push('/verify-email');
        }
      } else if (unprotectedRoutes.includes(pathname) && pathname !== '/dashboard') {
         // If user is on a public page but is logged in and verified/onboarded, redirect to dashboard
         if ((pathname === '/' || pathname === '/signin' || pathname === '/signup' || pathname === '/welcome/onboarding') && onboardingComplete) {
             router.push('/dashboard');
         } else if (pathname === '/verify-email' && user.emailVerified) {
             router.push('/dashboard');
         }
      }
    }
  }, [user, loading, router, pathname]);

  
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

  return (
    <AuthContext.Provider value={{ user, loading, currency, setCurrency, formatCurrency }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
