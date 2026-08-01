import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "../../lib/toast";
import { M3Button, TextField } from "../chrome";
import { useSession } from "../../lib/session";

export function Auth() {
  const nav = useNavigate();
  const { signUp, signIn, signInWithGoogle } = useSession();
  const [mode, setMode] = useState<"signup" | "login">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      if (mode === "signup") await signUp(email.trim(), password, name.trim() || "You");
      else await signIn(email.trim(), password);
      nav("/onboarding/home");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    try {
      await signInWithGoogle();
      nav("/onboarding/home");
    } catch {
      toast.error("Could not sign in with Google");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col px-6 pb-10 pt-11">
      <h1>{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
      <p className="mt-1 text-muted-foreground">
        {mode === "signup" ? "Start your first fridge." : "Sign in to your fridge."}
      </p>

      <div className="mt-8 space-y-4">
        {mode === "signup" && (
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        )}
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <div className="relative">
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <M3Button full className="mt-8" disabled={busy || !email || !password} onClick={submit}>
        {mode === "signup" ? "Sign up" : "Log in"}
      </M3Button>

      <div className="my-5 flex items-center gap-3 text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <M3Button
        variant="outline"
        full
        disabled={busy}
        onClick={google}
        icon={
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6.1C12.2 13.6 17.6 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7C43.9 38 46.5 31.9 46.5 24.5z" />
            <path fill="#FBBC05" d="M10.3 28.4c-.5-1.5-.8-3-.8-4.4s.3-3 .8-4.4l-7.8-6.1C.9 16.6 0 20.2 0 24s.9 7.4 2.5 10.5l7.8-6.1z" />
            <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.6l-7.3-5.7c-2 1.4-4.7 2.3-8 2.3-6.4 0-11.8-4.1-13.7-9.9l-7.8 6.1C6.4 42.6 14.6 48 24 48z" />
          </svg>
        }
      >
        Continue with Google
      </M3Button>

      <button
        className="mt-auto pt-8 text-center text-primary"
        onClick={() => setMode(mode === "signup" ? "login" : "signup")}
      >
        {mode === "signup" ? "Already have an account? Log in" : "New here? Create an account"}
      </button>
    </div>
  );
}
