import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router";
import { Loader2 } from "lucide-react";
import { Toaster } from "sonner";
import { SessionProvider, useSession } from "./lib/session";
import { PhoneFrame } from "./components/layout";
import { Welcome } from "./components/screens/Welcome";
import { Auth } from "./components/screens/Auth";
import { SetHomeBase } from "./components/screens/SetHomeBase";
import { FridgeScreen } from "./components/screens/FridgeScreen";
import { OtherFridge } from "./components/screens/OtherFridge";
import { MapScreen } from "./components/screens/MapScreen";
import { AddMagnet } from "./components/screens/AddMagnet";
import { SettingsScreen } from "./components/screens/SettingsScreen";
import { MagnetSettings } from "./components/screens/MagnetSettings";
import { DesignSystem } from "./components/screens/DesignSystem";

function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center md:min-h-[900px]">
      <span className="font-fridge text-3xl text-white">taking you to fridge</span>
      <Loader2 className="mt-4 animate-spin text-muted-foreground" size={24} />
    </div>
  );
}

/** Requires an account; funnels unfinished users through onboarding. */
function Protected({ children }: { children: React.ReactNode }) {
  const { profile, loading, onboarded } = useSession();
  const location = useLocation();

  if (loading) return <Splash />;
  if (!profile) return <Navigate to="/welcome" replace />;

  // If already on onboarding path, let them proceed (don't redirect back)
  if (location.pathname.startsWith("/onboarding")) {
    return <>{children}</>;
  }

  // If onboarding is complete, let them access fridge/map/etc
  if (onboarded) {
    return <>{children}</>;
  }

  // Only redirect to onboarding if NOT onboarded AND NOT already there
  return <Navigate to="/onboarding/home" replace />;
}

/** Public routes bounce signed-in users to their fridge. */
function PublicOnly({ children }: { children: React.ReactNode }) {
  const { profile, loading, onboarded } = useSession();
  if (loading) return <Splash />;
  if (profile) return <Navigate to={onboarded ? "/fridge" : "/onboarding/home"} replace />;
  return <>{children}</>;
}

function Router() {
  return (
    <Routes>
      <Route path="/designsystem" element={<DesignSystem />} />
      <Route path="/welcome" element={<PublicOnly><Welcome /></PublicOnly>} />
      <Route path="/auth" element={<PublicOnly><Auth /></PublicOnly>} />
      <Route path="/onboarding/home" element={<Protected><SetHomeBase /></Protected>} />
      <Route path="/fridge" element={<Protected><FridgeScreen /></Protected>} />
      <Route path="/fridge/:fridgeId" element={<Protected><OtherFridge /></Protected>} />
      <Route path="/map" element={<Protected><MapScreen /></Protected>} />
      <Route path="/add" element={<Protected><AddMagnet /></Protected>} />
      <Route path="/settings" element={<Protected><SettingsScreen /></Protected>} />
      <Route path="/settings/magnets" element={<Protected><MagnetSettings /></Protected>} />
      <Route path="*" element={<Navigate to="/fridge" replace />} />
    </Routes>
  );
}

function AppLayout() {
  const location = useLocation();
  const isDesignSystem = location.pathname === "/designsystem";

  return isDesignSystem ? (
    <>
      <Router />
      <Toaster
        position="top-center"
        theme="dark"
        offset={{ top: 58, bottom: 24, left: 24, right: 24 }}
        mobileOffset={{ top: 58, bottom: 16, left: 16, right: 16 }}
      />
    </>
  ) : (
    <PhoneFrame>
      <Router />
      <Toaster
        position="top-center"
        theme="dark"
        offset={{ top: 58, bottom: 24, left: 24, right: 24 }}
        mobileOffset={{ top: 58, bottom: 16, left: 16, right: 16 }}
      />
    </PhoneFrame>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </SessionProvider>
  );
}
