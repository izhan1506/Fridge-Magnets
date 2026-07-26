import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Magnet, Profile } from "./types";
import * as store from "./store";

interface SessionValue {
  profile: Profile | null;
  magnets: Magnet[];
  loading: boolean;
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

export function SessionProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [magnets, setMagnets] = useState<Magnet[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadFor(p: Profile | null) {
    setProfile(p);
    setMagnets(p ? await store.getMagnets(p.id) : []);
  }

  useEffect(() => {
    (async () => {
      const p = await store.getSession();
      await loadFor(p);
      setLoading(false);
    })();
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      profile,
      magnets,
      loading,
      onboarded: !!profile?.homeLabel,
      async signUp(email, password, name) {
        await loadFor(await store.signUp(email, password, name));
      },
      async signIn(email, password) {
        await loadFor(await store.signIn(email, password));
      },
      async signInWithGoogle() {
        await loadFor(await store.signInWithGoogle());
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
        await store.deleteMagnet(id);
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
    [profile, magnets, loading],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
