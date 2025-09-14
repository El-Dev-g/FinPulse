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
import { sha256 } from 'js-sha256';

type SubscriptionStatus = 'free' | 'active' | 'past_due';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  checked: boolean; 
  currency: string;
  isPro: boolean;
  subscriptionStatus: SubscriptionStatus;
  setCurrency: (currency: string) => void;
  setSubscriptionStatus: (status: SubscriptionStatus) => void;
  formatCurrency: (amount: number) => string;
  refreshProfile: () => Promise<void>;
  getTruelayerAuthUrl: () => string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  checked: false,
  currency: "USD",
  isPro: false,
  subscriptionStatus: 'free',
  setCurrency: () => {},
  setSubscriptionStatus: () => {},
  formatCurrency: (amount: number) => String(amount),
  refreshProfile: async () => {},
  getTruelayerAuthUrl: () => '',
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

// PKCE Helper Functions
function generateCodeVerifier() {
  const randomBytes = new Uint8Array(32);
  window.crypto.getRandomValues(randomBytes);
  return base64URLEncode(randomBytes);
}

function base64URLEncode(str: Uint8Array): string {
  return btoa(String.fromCharCode.apply(null, Array.from(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string) {
    const hash = sha256.arrayBuffer(verifier);
    return base64URLEncode(new Uint8Array(hash));
}


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
  
  const getTruelayerAuthUrl = useCallback(() => {
    const getUrl = async () => {
        const clientId = process.env.NEXT_PUBLIC_TRUELAYER_CLIENT_ID;
        const redirectUri = new URL('/dashboard/link-account', window.location.origin).toString();

        if (!clientId) {
            throw new Error("Truelayer client ID is not configured.");
        }

        const codeVerifier = generateCodeVerifier();
        sessionStorage.setItem('truelayer_code_verifier', codeVerifier);
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        const scopes = [
            "info",
            "accounts",
            "balance",
            "cards",
            "transactions",
            "direct_debits",
            "standing_orders",
            "offline_access"
        ].join(" ");

        const providers = "uk-cs-mock uk-ob-all uk-oauth-all";

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            scope: scopes,
            redirect_uri: redirectUri,
            providers: providers,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        });
        
        return `https://auth.truelayer-sandbox.com/?${params.toString()}`;
    };
    
    // This is a synchronous function for simplicity in the calling component.
    // The actual URL generation logic is async, so we'll just initiate it.
    // The router.push in the calling component handles the async nature.
    getUrl().then(url => router.push(url));
    
    // This function will now have a side effect of navigation.
    // We return an empty string because the caller expects a string, but navigation is handled internally.
    return '';
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, checked, currency, isPro, subscriptionStatus, setCurrency, setSubscriptionStatus: handleSetSubscriptionStatus, formatCurrency, refreshProfile, getTruelayerAuthUrl }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
