
// src/hooks/use-auth.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { User, onAuthStateChanged, getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { getUserProfile, updateUserProfile } from "@/lib/db";
import type { UserProfile } from "@/lib/types";

type SubscriptionStatus = 'free' | 'active' | 'past_due';

// Dynamically create the Truelayer Auth URL using the window's origin
const getTruelayerAuthUrl = () => {
    if (typeof window === 'undefined') return "";

    const clientId = process.env.NEXT_PUBLIC_TRUELAYER_CLIENT_ID;
    if (!clientId) {
        console.error("Truelayer client ID is not set in environment variables.");
        return "";
    }
    
    // Use window.location.origin to ensure the redirect URI is always correct
    const redirectUri = `${window.location.origin}/api/truelayer/callback`;
    const scopes = "info accounts balance cards transactions direct_debits standing_orders offline_access";
    const providers = "uk-cs-mock uk-ob-all uk-oauth-all";

    const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scopes,
        providers: providers,
        // The 'state' parameter can be used for CSRF protection, but is omitted here for simplicity
    });
    return `https://auth.truelayer-sandbox.com/?${params.toString()}`;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  checked: boolean; 
  currency: string;
  isPro: boolean;
  subscriptionStatus: SubscriptionStatus;
  truelayerAuthUrl: string;
  setCurrency: (currency: string) => void;
  setSubscriptionStatus: (status: SubscriptionStatus) => void;
  formatCurrency: (amount: number) => string;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  checked: false,
  currency: "USD",
  isPro: false,
  subscriptionStatus: 'free',
  truelayerAuthUrl: "",
  setCurrency: () => {},
  setSubscriptionStatus: () => {},
  formatCurrency: (amount: number) => String(amount),
  refreshProfile: async () => {},
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
  "/pricing",
  "/faq",
];

const isOnboardingRoute = (pathname: string) =>
  pathname.startsWith("/welcome/onboarding");

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [currency, setCurrencyState] = useState("USD");
  const [subscriptionStatus, setSubscriptionStatusState] = useState<SubscriptionStatus>('free');

  const auth = getAuth(app);
  const router = useRouter();
  const pathname = usePathname();

  const isPro = useMemo(() => subscriptionStatus === 'active' || subscriptionStatus === 'past_due', [subscriptionStatus]);
  const truelayerAuthUrl = useMemo(() => getTruelayerAuthUrl(), []);

  const refreshProfile = useCallback(async () => {
    if (auth.currentUser) {
        await auth.currentUser.reload();
        // The onAuthStateChanged listener will handle re-fetching the profile
    }
  }, [auth]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUser(user);
          const userProfile = await getUserProfile(user.uid);
          setProfile(userProfile);
          
          if (userProfile?.currency) {
            setCurrencyState(userProfile.currency);
          }
           const subStatus = localStorage.getItem('subscriptionStatus') as SubscriptionStatus | null;
           setSubscriptionStatusState(subStatus || 'free');

        } else {
            setUser(null);
            setProfile(null);
            setSubscriptionStatusState('free');
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
        setChecked(true); 
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!checked) return;

    const isUnprotectedPage = unprotectedRoutes.includes(pathname) || unprotectedRoutes.some(p => p !== '/' && pathname.startsWith(p + '/'));
    const isOnboardingPage = isOnboardingRoute(pathname);

    if (!user) {
      if (!isUnprotectedPage && !isOnboardingPage) {
        router.push("/signin");
      }
    } else {
      if (pathname === "/signin" || pathname === "/signup") {
        router.push("/dashboard");
      }
    }
  }, [user, checked, pathname, router]);

  const setCurrency = useCallback(
    async (newCurrency: string) => {
      setCurrencyState(newCurrency);
      if (auth.currentUser) {
        await updateUserProfile(auth.currentUser.uid, { currency: newCurrency });
      }
    },
    [auth.currentUser]
  );
  
  const handleSetSubscriptionStatus = useCallback((status: SubscriptionStatus) => {
      setSubscriptionStatusState(status);
      if (typeof window !== 'undefined') {
          if (status === 'free') {
            localStorage.removeItem('subscriptionStatus');
          } else {
            localStorage.setItem('subscriptionStatus', status);
          }
      }
  }, []);

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
      value={{ user, profile, loading, checked, currency, isPro, subscriptionStatus, truelayerAuthUrl, setCurrency, setSubscriptionStatus: handleSetSubscriptionStatus, formatCurrency, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
