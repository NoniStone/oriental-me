import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";

type Mode = "signin" | "signup";

const friendlyError = (message: string) => {
  if (message.includes("Invalid login credentials"))
    return "Email or password is incorrect.";
  if (message.includes("already registered"))
    return "This email is already registered — try signing in instead.";
  if (message.includes("at least 6 characters"))
    return "Password must be at least 6 characters.";
  if (message.includes("valid email")) return "Please enter a valid email.";
  return message;
};

const Login = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) navigate("/onboarding");
  }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name.trim() || null } },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success(
            "Account created — check your email to confirm, then sign in.",
          );
          setMode("signin");
        }
      }
    } catch (err) {
      toast.error(friendlyError((err as Error).message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center px-5 py-10">
      <Link to="/" className="flex flex-col items-center gap-3 animate-fade-in">
        <img
          src="/assets/logo.png"
          alt="Oriental Me"
          className="h-16 w-16 rounded-full object-cover shadow-md"
        />
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Oriental Me</h1>
          <p className="text-sm text-muted-foreground">
            Explore a different way of taking care of yourself · 养生
          </p>
        </div>
      </Link>

      <div className="paper-card mt-8 w-full max-w-sm p-6 animate-fade-up">
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
          {(["signin", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={
                mode === m
                  ? "rounded-full bg-card py-2 text-sm font-semibold shadow-sm"
                  : "rounded-full py-2 text-sm font-medium text-muted-foreground"
              }
            >
              {m === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How should we greet you?"
                autoComplete="name"
                className="rounded-xl"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="rounded-xl"
            />
          </div>
          <Button type="submit" disabled={busy} className="w-full rounded-full">
            {busy
              ? "One moment…"
              : mode === "signin"
                ? "Sign in"
                : "Begin your journey"}
          </Button>
        </form>
      </div>

      <p className="mt-8 max-w-sm text-center text-xs leading-relaxed text-muted-foreground">
        Your check-ins, reflections and journey are private to your account.
        Oriental Me shares cultural, educational and wellness information — it
        does not diagnose or treat medical conditions.
      </p>
    </div>
  );
};

export default Login;
