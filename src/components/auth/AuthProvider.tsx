"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { logEvent, setEventLoggerUser } from "@/lib/eventLogger";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  sendMagicLink: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const FALLBACK_PUBLIC_AUTH_ORIGIN = "https://tennis-decider-staging.vercel.app";

function isLocalAuthOrigin(origin: string) {
  return /^https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::\d+)?$/i.test(origin);
}

function getMagicLinkRedirectUrl() {
  const configuredOrigin = process.env.NEXT_PUBLIC_AUTH_REDIRECT_ORIGIN?.trim().replace(/\/$/, "");
  if (configuredOrigin && !isLocalAuthOrigin(configuredOrigin)) {
    return `${configuredOrigin}/auth/callback`;
  }

  return `${FALLBACK_PUBLIC_AUTH_ORIGIN}/auth/callback`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUser(data.session?.user ?? null);
        setEventLoggerUser(data.session?.user?.id ?? null);
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setEventLoggerUser(session?.user?.id ?? null);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN" && session?.user) {
        logEvent("login_complete", { email: session.user.email ?? null });
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function sendMagicLink(email: string) {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return { error: "还没配置登录服务，请先补上 Supabase 环境变量。" };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: getMagicLinkRedirectUrl() }
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }
    await supabase.auth.signOut();
    setEventLoggerUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, configured, sendMagicLink, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
