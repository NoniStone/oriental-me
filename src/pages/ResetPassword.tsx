import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirmation) return toast.error("Passwords don't match.");
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      toast.success("Password updated. Please sign in with your new password.");
      navigate("/login");
    } catch {
      toast.error("This reset link may have expired. Please request a new one.");
    } finally { setBusy(false); }
  };

  return <div className="flex min-h-screen items-center justify-center px-5 py-10"><div className="w-full max-w-md"><Link to="/" className="flex items-center justify-center gap-2.5"><img src="/assets/logo.png" alt="Oriental Me" className="h-10 w-10 rounded-full object-cover" /><span className="font-display text-lg font-semibold">Oriental Me</span></Link><main className="paper-card mt-8 p-6 sm:p-8"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary"><KeyRound className="h-5 w-5 text-primary" /></span><h1 className="mt-5 font-display text-3xl font-semibold">Choose a new password</h1>{ready ? <form onSubmit={updatePassword} className="mt-6 space-y-4"><div className="space-y-1.5"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" className="rounded-xl" /></div><div className="space-y-1.5"><Label htmlFor="confirm-password">Confirm new password</Label><Input id="confirm-password" type="password" required minLength={6} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" className="rounded-xl" /></div><Button type="submit" disabled={busy} className="w-full rounded-full">{busy ? "Updating…" : "Update password"}</Button></form> : <div className="mt-4"><p className="text-sm leading-relaxed text-muted-foreground">Open the secure link from your reset email in this browser. If it has expired, request another one.</p><Button asChild variant="outline" className="mt-5 rounded-full"><Link to="/login">Back to sign in</Link></Button></div>}<p className="mt-6 flex gap-2 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0 text-primary" />For your security, this link can only be used once and may expire.</p></main></div></div>;
};

export default ResetPassword;
