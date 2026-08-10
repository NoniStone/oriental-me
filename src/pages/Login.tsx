import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";

type Mode = "signin" | "signup" | "forgot";

const friendlyError = (message: string) => {
  if (message.includes("Invalid login credentials")) return "That email or password doesn't match. Try again or reset your password.";
  if (message.includes("already registered")) return "This email already has an account — try signing in instead.";
  if (message.includes("at least 6 characters")) return "Password must be at least 6 characters.";
  if (message.includes("valid email")) return "Please enter a valid email address.";
  return "Something went wrong. Please try again.";
};

const Login = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (session) navigate("/home"); }, [session, navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("If an account exists for this email, we've sent a secure reset link.");
        setMode("signin");
        return;
      }
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(), password, options: { data: { display_name: name.trim() || null } },
      });
      if (error) throw error;
      if (!data.session) {
        toast.success("Check your email to confirm your account, then sign in.");
        setMode("signin");
      }
    } catch (error) {
      toast.error(friendlyError((error as Error).message));
    } finally { setBusy(false); }
  };

  const heading = mode === "forgot" ? "Reset your password" : mode === "signup" ? "Begin with one small step" : "Welcome back";
  const description = mode === "forgot" ? "We'll email a secure link to choose a new password." : mode === "signup" ? "Create an account to keep your rhythm private and continuous." : "Pick up your rhythm exactly where you left it.";

  return <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--secondary))_0,_transparent_36%)] px-5 py-8 sm:py-12"><div className="mx-auto w-full max-w-md"><Link to="/" className="flex items-center gap-2.5"><img src="/assets/logo.png" alt="Oriental Me" className="h-10 w-10 rounded-full object-cover shadow-sm" /><span className="font-display text-lg font-semibold">Oriental Me</span><span className="text-xs text-muted-foreground">养生</span></Link><main className="paper-card mt-10 overflow-hidden"><div className="border-b bg-card p-6 sm:p-8"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary">{mode === "forgot" ? <KeyRound className="h-5 w-5 text-primary" /> : <Sparkles className="h-5 w-5 text-primary" />}</span><h1 className="mt-5 font-display text-3xl font-semibold tracking-tight">{heading}</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p></div><div className="p-6 sm:p-8">{mode !== "forgot" && <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-muted p-1"><button type="button" onClick={() => setMode("signin")} className={mode === "signin" ? "rounded-full bg-card py-2 text-sm font-semibold shadow-sm" : "rounded-full py-2 text-sm font-medium text-muted-foreground"}>Sign in</button><button type="button" onClick={() => setMode("signup")} className={mode === "signup" ? "rounded-full bg-card py-2 text-sm font-semibold shadow-sm" : "rounded-full py-2 text-sm font-medium text-muted-foreground"}>Create account</button></div>}<form onSubmit={submit} className="space-y-4">{mode === "signup" && <div className="space-y-1.5"><Label htmlFor="name">Name <span className="text-muted-foreground">(optional)</span></Label><Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="How should we greet you?" autoComplete="name" className="rounded-xl" /></div>}<div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" className="rounded-xl" /></div>{mode !== "forgot" && <div className="space-y-1.5"><div className="flex items-center justify-between"><Label htmlFor="password">Password</Label>{mode === "signin" && <button type="button" onClick={() => setMode("forgot")} className="text-xs font-semibold text-primary hover:underline">Forgot password?</button>}</div><Input id="password" type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" autoComplete={mode === "signin" ? "current-password" : "new-password"} className="rounded-xl" /></div>}<Button type="submit" disabled={busy} className="w-full rounded-full">{busy ? "One moment…" : mode === "forgot" ? "Email me a reset link" : mode === "signup" ? "Create my account" : <>Sign in <ArrowRight className="ml-1.5 h-4 w-4" /></>}</Button></form>{mode === "forgot" && <button type="button" onClick={() => setMode("signin")} className="mt-5 flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to sign in</button>}<div className="mt-7 flex gap-2 rounded-2xl bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0 text-primary" />Your check-ins and reflections stay private to your account. Oriental Me is cultural and educational, not medical care.</div></div></main></div></div>;
};

export default Login;
