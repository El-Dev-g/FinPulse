// src/hooks/use-auth.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isPublicPage = PUBLIC_PAGES.includes(pathname);
    const isAuthPage = AUTH_PAGES.includes(pathname);

    if (!user && !isPublicPage) {
      router.push("/signin");
      return;
    }

    if (user) {
      const isEmailVerified = user.emailVerified || user.providerData.some(p => p.providerId !== 'password');
      if (!isEmailVerified && pathname !== '/verify-email') {
        router.push('/verify-email');
        return;
      }
      
      if (isEmailVerified && (isAuthPage || pathname === "/")) {
         router.push("/dashboard");
         return;
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
