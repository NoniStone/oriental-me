import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { fetchProfile, updateDisplayName } from "@/lib/cloud";
import { clearProfileIntake } from "@/lib/v2";
import { KeyRound, LogOut, Mail, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });

  const [name, setName] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [clearingContext, setClearingContext] = useState(false);

  const displayName = name ?? profile?.display_name ?? "";

  const saveName = async () => {
    if (!user) return;
    setSavingName(true);
    try {
      await updateDisplayName(user.id, displayName.trim());
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Name updated");
    } catch {
      toast.error("Couldn't update your name — please try again");
    } finally {
      setSavingName(false);
    }
  };

  const changeEmail = async () => {
    if (!newEmail.trim()) return;
    setSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser(
        { email: newEmail.trim() },
        { emailRedirectTo: `${window.location.origin}/settings` },
      );
      if (error) throw error;
      toast.success(
        "Confirmation emails sent — check both your old and new inbox to confirm the change.",
      );
      setNewEmail("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSavingEmail(false);
    }
  };

  const clearPersonalContext = async () => {
    if (!user) return;
    setClearingContext(true);
    try {
      await clearProfileIntake(user.id);
      queryClient.removeQueries({ queryKey: ["profile-intake"] });
      toast.success("Optional personal context deleted.");
    } catch {
      toast.error("Couldn't delete personal context — please try again.");
    } finally {
      setClearingContext(false);
    }
  };

  const changePassword = async () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== passwordConfirm) {
      toast.error("Passwords don't match.");
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated");
      setPassword("");
      setPasswordConfirm("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSavingPassword(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate("/");
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "delete-account",
        { body: {} },
      );
      if (error || data?.error) throw new Error("delete_failed");
      await supabase.auth.signOut();
      queryClient.clear();
      localStorage.clear();
      toast.success("Your account and data have been deleted.");
      navigate("/");
    } catch {
      toast.error("Couldn't delete your account — please try again.");
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account, your data, your pace.
        </p>
      </section>

      <section className="paper-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <UserRound className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">Profile</h2>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="display-name">Name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setName(e.target.value)}
              placeholder="How should we greet you?"
              className="rounded-xl"
            />
          </div>
          <Button
            size="sm"
            onClick={saveName}
            disabled={savingName}
            className="rounded-full"
          >
            {savingName ? "Saving…" : "Save name"}
          </Button>
        </div>
      </section>

      <section className="paper-card p-5">
        <div className="mb-2 flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">Personal context</h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your optional birth details, interests and daily rhythm help personalise your Journey. They are shared with your companion only when you choose to use it.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="mt-4 rounded-full" disabled={clearingContext}>
              {clearingContext ? "Deleting…" : "Delete optional context"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display">Delete optional context?</AlertDialogTitle>
              <AlertDialogDescription>This removes your birth details, interests and rhythm preferences. Your account, check-ins and reflections stay untouched.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full">Keep it</AlertDialogCancel>
              <AlertDialogAction onClick={clearPersonalContext} className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete context</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>

      <section className="paper-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">Email</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-foreground">{user?.email}</span>
        </p>
        <div className="mt-3 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-email">New email</Label>
            <Input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@example.com"
              className="rounded-xl"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={changeEmail}
            disabled={!newEmail.trim() || savingEmail}
            className="rounded-full"
          >
            {savingEmail ? "Sending…" : "Change email"}
          </Button>
          <p className="text-xs text-muted-foreground">
            You'll receive confirmation links by email before the change takes
            effect.
          </p>
        </div>
      </section>

      <section className="paper-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">Password</h2>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Repeat the new password"
              autoComplete="new-password"
              className="rounded-xl"
            />
          </div>
          <Button
            size="sm"
            onClick={changePassword}
            disabled={!password || !passwordConfirm || savingPassword}
            className="rounded-full"
          >
            {savingPassword ? "Updating…" : "Update password"}
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <Button
          variant="outline"
          onClick={signOut}
          className="w-full rounded-full"
        >
          <LogOut className="mr-1.5 h-4 w-4" />
          Sign out
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete my account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display">
                Delete your account?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes your account and all your data —
                archetype, check-ins, reflections, plans and challenge
                progress. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full">
                Keep my account
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteAccount}
                disabled={deleting}
                className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Deleting…" : "Delete everything"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
};

export default Settings;
