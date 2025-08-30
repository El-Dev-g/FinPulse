// src/hooks/use-auth.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, onAuthStateChanged, getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

const AUTH_PAGES = ["/signin", "/signup", "/forgot-password", "/verify-email"];
const ONBOARDING_PAGES = ["/welcome/onboarding"];
const PUBLIC_PAGES = ["/", ...AUTH_PAGES, ...ONBOARDING_PAGES];


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const auth = getAuth(app);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (loading) return;

    const isPublicPage = PUBLIC_PAGES.some(p => pathname.startsWith(p));
    const isAuthPage = AUTH_PAGES.includes(pathname);
    const isOnboardingPage = ONBOARDING_PAGES.includes(pathname);

    if (!user && !isPublicPage) {
      router.push("/signin");
      return;
    }

    if (user) {
      const isEmailVerified = user.emailVerified || user.providerData.some(p => p.providerId !== 'password');
      const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
      
      if (!isEmailVerified && pathname !== '/verify-email') {
        router.push('/verify-email');
        return;
      }
      
      if (isEmailVerified) {
        if (isNewUser && !isOnboardingPage) {
          router.push('/welcome/onboarding');
          return;
        }
        if (!isNewUser && (isAuthPage || isOnboardingPage || pathname === "/")) {
          router.push("/dashboard");
          return;
        }
      }
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
