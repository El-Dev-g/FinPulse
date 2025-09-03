
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
      return; // Do nothing until authentication state is determined
    }

    const onUnprotectedRoute = unprotectedRoutes.includes(pathname);
    const onStudioAuthRoute = studioAuthRoutes.includes(pathname);
    const onStudioRoute = isStudioRoute(pathname);
    const onOnboarding = isOnboardingRoute(pathname);

    // If user is not logged in
    if (!user) {
      // If trying to access a protected route, redirect to the appropriate sign-in page
      if (!onUnprotectedRoute && !onStudioAuthRoute && !onOnboarding) {
        if (onStudioRoute) {
          router.push('/studio/signin');
        } else {
          router.push('/signin');
        }
      }
      return;
    }

    // If user is logged in
    if (user) {
      if (isAdmin) {
        // Admins should be redirected from regular auth pages to the studio
        if (onUnprotectedRoute && pathname !== '/') {
            router.push('/studio');
        }
        // Admins should be redirected from studio auth pages to the studio dashboard
        if (onStudioAuthRoute) {
            router.push('/studio');
        }
      } else { // It's a regular, non-admin user
        // Non-admins should be redirected from all studio routes
        if (onStudioRoute) {
            router.push('/dashboard');
        }
        // Regular users should be redirected from regular auth pages if logged in
        if ((onUnprotectedRoute && pathname !== '/') || onStudioAuthRoute) {
            router.push('/dashboard');
        }
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
