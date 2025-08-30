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
    "/",
    "/about",
    "/contact",
    "/policy/privacy",
    "/policy/terms",
];

const isOnboardingRoute = (pathname: string) => pathname.startsWith('/welcome/onboarding');

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (loading) return;
      
    const isProtected = !unprotectedRoutes.includes(pathname) && !isOnboardingRoute(pathname);

    if (!user && isProtected) {
      router.push("/signin");
    }
  }, [user, loading, pathname, router]);

  
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
    <AuthContext.Provider value={{ user, loading, currency, setCurrency, formatCurrency }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
