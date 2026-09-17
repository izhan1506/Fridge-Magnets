import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Magnet, Profile } from "./types";
import * as store from "./store";
import { supabase } from "./supabase";

interface SessionValue {
  profile: Profile | null;
  magnets: Magnet[];
  loading: boolean;
  /** Set when session init failed (backend unreachable, timeout). Null on success. */
  error: string | null;
  /** Re-run session init after a failure. */
  retry: () => void;
  /** True once onboarding (home base + skin) is complete. */
  onboarded: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  addMagnet: (magnet: Magnet) => Promise<void>;
  removeMagnet: (id: string) => Promise<void>;
  updateMagnet: (id: string, patch: Partial<Magnet>) => Promise<void>;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

/** Bound on session init. Long enough for a cold backend, short enough that a
 *  dead one doesn't look like an infinite spinner. */
const INIT_TIMEOUT_MS = 12000;
const TIMEOUT_MESSAGE = "session-init-timeout";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(TIMEOUT_MESSAGE)), ms),
    ),
  ]);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [magnets, setMagnets] = useState<Magnet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  async function loadFor(p: Profile | null) {
    setProfile(p);
    setMagnets(p ? await store.getMagnets(p.id) : []);
  }

  useEffect(() => {
    let mounted = true;

    /* Session init must ALWAYS terminate. Previously this was an unguarded
       async IIFE: getSession() and getMagnets() both throw on any backend
       error, so a single failed request meant setLoading(false) never ran and
       the app sat on the splash screen forever with no message and no way out.
       A signed-in user whose token needed a network refresh could be bricked
       until they cleared site data.

       Now: a timeout bounds a hanging request, failures are caught, and
       `finally` guarantees we leave the loading state no matter what. */
    (async () => {
      setError(null);
      try {
        const p = await withTimeout(store.getSession(), INIT_TIMEOUT_MS);
        if (!mounted) return;
        await withTimeout(loadFor(p), INIT_TIMEOUT_MS);
      } catch (e) {
        if (!mounted) return;
        console.error("[Session] init failed:", e);
        // Don't strand a half-loaded session; fall back to signed-out.
        setProfile(null);
        setMagnets([]);
        setError(
          e instanceof Error && e.message === TIMEOUT_MESSAGE
            ? "Couldn't reach the server — it may be waking up."
            : "Couldn't reach the server. Check your connection and try again.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // Subscribe to auth state changes (needed for Google OAuth redirect)
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        // Same hazard as init: an unhandled throw here would leave the app
        // showing stale state with no indication anything failed.
        try {
          const p = session?.user ? await store.getSession() : null;
          await loadFor(p);
          setError(null);
        } catch (e) {
          console.error("[Session] auth change failed:", e);
          setError("Couldn't reach the server. Check your connection and try again.");
        }
      },
    );

    return () => {
      mounted = false;
      subscription?.subscription.unsubscribe();
    };
  }, [attempt]);

  const onboarded = !!profile?.homeLabel && profile.homeLabel !== '' && profile.homeLat !== 0 && profile.homeLng !== 0;

  // Debug logging
  if (profile && !loading) {
    console.log('[Session] Profile loaded:', {
      name: profile.name,
      homeLabel: profile.homeLabel,
      homeLat: profile.homeLat,
      homeLng: profile.homeLng,
      onboarded
    });
  }

  const value = useMemo<SessionValue>(
    () => ({
      profile,
      magnets,
      loading,
      error,
      retry() {
        setLoading(true);
        setAttempt((n) => n + 1);
      },
      onboarded,
      async signUp(email, password, name) {
        await loadFor(await store.signUp(email, password, name));
      },
      async signIn(email, password) {
        await loadFor(await store.signIn(email, password));
      },
      async signInWithGoogle() {
        /* Redirect flow: this navigates away and resolves no profile, so there
           is nothing to load here. The profile arrives on the way back, via the
           onAuthStateChange subscription above. Passing its void result into
           loadFor() used to set `profile` to undefined instead of null —
           harmless only because the page was already leaving. */
        await store.signInWithGoogle();
      },
      async signOut() {
        await store.signOut();
        setProfile(null);
        setMagnets([]);
      },
      async updateProfile(patch) {
        if (!profile) return;
        const next = await store.saveProfile({ ...profile, ...patch });
        setProfile(next);
      },
      async addMagnet(magnet) {
        await store.addMagnet(magnet);
        setMagnets((prev) => [magnet, ...prev]);
      },
      async removeMagnet(id) {
        if (!profile) return;
        await store.deleteMagnet(profile.id, id);
        setMagnets((prev) => prev.filter((m) => m.id !== id));
      },
      async updateMagnet(id, patch) {
        const updated = await store.updateMagnet(id, patch);
        if (!updated) return;
        setMagnets((prev) => prev.map((m) => (m.id === id ? updated : m)));
      },
      async refresh() {
        if (profile) setMagnets(await store.getMagnets(profile.id));
      },
    }),
    [profile, magnets, loading, error],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
