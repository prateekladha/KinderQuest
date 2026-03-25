import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getInitialSession, getMobileSupabaseClient } from "../lib/supabase";
import { resetAppDataCache } from "../lib/app-data";

interface AuthContextValue {
  client: SupabaseClient | null;
  session: Session | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  client: null,
  session: null,
  isLoading: true
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const client = getMobileSupabaseClient();

  useEffect(() => {
    let active = true;
    let previousUserId: string | null = null;

    async function bootstrap() {
      const initialSession = await getInitialSession();

      if (active) {
        previousUserId = initialSession?.user.id ?? null;
        setSession(initialSession);
        setIsLoading(false);
      }
    }

    void bootstrap();

    if (!client) {
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    const listener = client.auth.onAuthStateChange((_event, nextSession: Session | null) => {
      const nextUserId = nextSession?.user.id ?? null;

      if (previousUserId !== nextUserId) {
        resetAppDataCache();
      }

      previousUserId = nextUserId;
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      active = false;
      listener.data.subscription.unsubscribe();
    };
  }, [client]);

  return (
    <AuthContext.Provider
      value={{
        client,
        session,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
