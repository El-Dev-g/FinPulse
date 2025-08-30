
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
import { User, onAuthStateChanged, getAuth, getRedirectResult } from "firebase/auth";
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
];

const isOnboardingRoute = (pathname: string) => pathname.startsWith('/welcome/onboarding');


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialAuthChecked, setInitialAuthChecked] = useState(false);
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
      setInitialAuthChecked(true); // Mark that initial auth check is complete
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!initialAuthChecked) return;

    // Handle redirect result from Google Sign-In
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          const user = result.user;
          const creationTime = user.metadata.creationTime;
          const lastSignInTime = user.metadata.lastSignInTime;
          const isNewUser = !lastSignInTime || (creationTime === lastSignInTime);

          if (isNewUser) {
            router.push('/welcome/onboarding');
          } else {
            router.push('/dashboard');
          }
        }
      }).catch((error) => {
        console.error("Error during getRedirectResult: ", error);
      });
      
    const isProtected = !unprotectedRoutes.includes(pathname) && !isOnboardingRoute(pathname);

    if (!user && isProtected) {
      router.push("/signin");
    } else if (user && (pathname === '/signin' || pathname === '/signup' || pathname === '/')) {
        router.push('/dashboard');
    }
  // We only want this effect to run when the loading state changes from true to false,
  // or when the user navigates to a new page.
  }, [initialAuthChecked, user, pathname, router, auth]);

  
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
