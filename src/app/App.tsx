import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router";
import { Loader2 } from "lucide-react";
import { Toaster } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { SessionProvider, useSession } from "./lib/session";
import { PhoneFrame } from "./components/layout";
import { Welcome } from "./components/screens/Welcome";
import { Auth } from "./components/screens/Auth";
import { SetHomeBase } from "./components/screens/SetHomeBase";
import { FridgeScreen } from "./components/screens/FridgeScreen";
import { OtherFridge } from "./components/screens/OtherFridge";
import { SettingsScreen } from "./components/screens/SettingsScreen";
import { MagnetSettings } from "./components/screens/MagnetSettings";

/* Split out of the boot bundle — these pull in the app's two heaviest
 * dependencies and most users reach the fridge first:
 *   MapScreen   → maplibre-gl, ~1MB
 *   AddMagnet   → @imgly/background-removal, a ~24MB ONNX WASM binary
 * Loading them on navigation instead of at startup keeps first paint small. */
const MapScreen = lazy(() =>
  import("./components/screens/MapScreen").then((m) => ({ default: m.MapScreen })),
);
const AddMagnet = lazy(() =>
  import("./components/screens/AddMagnet").then((m) => ({ default: m.AddMagnet })),
);
const DesignSystem = lazy(() =>
  import("./components/screens/DesignSystem").then((m) => ({ default: m.DesignSystem })),
);
const CaseStudy = lazy(() =>
  import("./components/screens/CaseStudy").then((m) => ({ default: m.CaseStudy })),
);

function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center md:min-h-[900px]">
      <span className="text-base font-normal text-white">taking you to fridge</span>
      <Loader2 className="mt-4 animate-spin text-muted-foreground" size={24} />
    </div>
  );
}

/**
 * Shown when session init fails. The app used to sit on <Splash /> forever in
 * this case, so the whole point is that it's an exit: it says what happened and
 * offers a way out.
 */
function ConnectionError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-8 text-center md:min-h-[900px]">
      <p className="font-fridge text-2xl text-foreground">Can't reach the fridge</p>
      <p className="mt-3 max-w-[280px] leading-relaxed text-muted-foreground">{message}</p>
      <button
        onClick={onRetry}
        className="mt-7 inline-flex h-12 items-center justify-center rounded-2xl border border-white/30 bg-primary px-6 text-primary-foreground transition hover:brightness-105"
      >
        Try again
      </button>
    </div>
  );
}

/** Wraps screen content with fade/slide entrance animation. */
function ScreenAnimator({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

/** Requires an account; funnels unfinished users through onboarding. */
function Protected({ children }: { children: React.ReactNode }) {
  const { profile, loading, onboarded, error, retry } = useSession();
  const location = useLocation();

  if (loading) return <Splash />;
  if (error) return <ConnectionError message={error} onRetry={retry} />;
  if (!profile) return <Navigate to="/welcome" replace />;

  // If already on onboarding path, let them proceed (don't redirect back)
  if (location.pathname.startsWith("/onboarding")) {
    return <ScreenAnimator>{children}</ScreenAnimator>;
  }

  // If onboarding is complete, let them access fridge/map/etc
  if (onboarded) {
    return <ScreenAnimator>{children}</ScreenAnimator>;
  }

  // Only redirect to onboarding if NOT onboarded AND NOT already there
  return <Navigate to="/onboarding/home" replace />;
}

/** Public routes bounce signed-in users to their fridge. */
function PublicOnly({ children }: { children: React.ReactNode }) {
  const { profile, loading, onboarded, error, retry } = useSession();
  if (loading) return <Splash />;
  if (error) return <ConnectionError message={error} onRetry={retry} />;
  if (profile) return <Navigate to={onboarded ? "/fridge" : "/onboarding/home"} replace />;
  return <ScreenAnimator>{children}</ScreenAnimator>;
}

function Router() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {/* Suspense boundary for the lazily-loaded screens above. */}
      <Suspense fallback={<Splash />}>
      <Routes location={location} key={location.pathname}>
        <Route path="/designsystem" element={<DesignSystem />} />
        {/* Public — deliberately NOT wrapped in Protected/PublicOnly so the
            case study is shareable without an account. The hyphenated spelling
            is aliased because the catch-all below would otherwise bounce it
            into the signed-out redirect. */}
        <Route path="/casestudy" element={<CaseStudy />} />
        <Route path="/case-study" element={<CaseStudy />} />
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
      </Suspense>
    </AnimatePresence>
  );
}

function AppLayout() {
  const location = useLocation();
  /* Wide editorial/reference pages render full-bleed; everything else is the
     phone app and stays inside the 402pt frame. */
  const isFullWidth = ["/designsystem", "/casestudy", "/case-study"].includes(location.pathname);

  return isFullWidth ? (
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
