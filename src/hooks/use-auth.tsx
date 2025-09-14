
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

// --- PKCE Helper Functions ---
function base64URLEncode(str: Buffer) {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function generateCodeVerifier() {
    const randomBytes = new Uint8Array(32);
    if (typeof window !== 'undefined') {
        window.crypto.getRandomValues(randomBytes);
    }
    return base64URLEncode(Buffer.from(randomBytes));
}

function generateCodeChallenge(verifier: string) {
    const hash = sha256.digest(verifier);
    return base64URLEncode(Buffer.from(hash));
}


// Generates the Truelayer Auth URL using PKCE flow
const getTruelayerAuthUrl = () => {
    if (typeof window === 'undefined') {
        return "";
    }
    
    const clientId = process.env.NEXT_PUBLIC_TRUELAYER_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/truelayer/callback`;


    if (!clientId) {
        console.error("Truelayer client ID is not set in environment variables.");
        return "";
    }
    
    const scopes = "info accounts balance cards transactions direct_debits standing_orders offline_access";
    const providers = "uk-cs-mock uk-ob-all uk-oauth-all";

    // --- PKCE ---
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    try {
        sessionStorage.setItem('truelayer_code_verifier', codeVerifier);
    } catch (e) {
        console.error("Could not write to sessionStorage.");
    }
    // --- End PKCE ---
    
    const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scopes,
        providers: providers,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
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
  setCurrency: (currency: string) => void;
  setSubscriptionStatus: (status: SubscriptionStatus) => void;
  formatCurrency: (amount: number) => string;
  refreshProfile: () => Promise<void>;
  getTruelayerAuthUrl: () => string; // Expose the function directly
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
  getTruelayerAuthUrl: () => "",
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
