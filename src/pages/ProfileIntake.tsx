import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/components/auth/AuthProvider";
import { saveProfileIntake, type ProfileIntake } from "@/lib/v2";

const interests = ["Tea & food", "Walking without a destination", "Night owls", "Movement", "Books & quiet", "Friends & gatherings", "Nature", "Making things", "Screens & games", "Trying new places"];
const rhythms = ["Mostly predictable", "Shift work", "Study-led", "Caregiving", "Always changing"];
const empty: ProfileIntake = { birthDate: "", birthTime: "", birthPlace: "", interests: [], wakeTime: "", sleepTime: "", workRhythm: "", consentGiven: false };

const ProfileIntakePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const toggle = (interest: string) => setForm((p) => ({ ...p, interests: p.interests.includes(interest) ? p.interests.filter((v) => v !== interest) : [...p.interests, interest] }));
  const finish = async () => {
    if (!user || !form.consentGiven) return;
    setSaving(true);
    try { await saveProfileIntake(user.id, form); navigate("/quiz"); } finally { setSaving(false); }
  };
  return <div className="mx-auto min-h-screen max-w-lg px-5 py-8 page-enter">
    <p className="text-xs font-semibold uppercase tracking-wider text-primary">Build your living profile · {step + 1}/3</p>
    {step === 0 && <section className="mt-5 space-y-5"><h1 className="text-3xl font-semibold">A little context, at your pace.</h1><p className="text-sm leading-relaxed text-muted-foreground">Birth details are optional cultural context, never a diagnosis. You can delete them anytime.</p><div className="paper-card space-y-4 p-5"><div><Label>Birth date <span className="text-muted-foreground">(optional)</span></Label><Input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} /></div><div><Label>Birth time <span className="text-muted-foreground">(optional)</span></Label><Input type="time" value={form.birthTime} onChange={(e) => setForm({ ...form, birthTime: e.target.value })} /></div><div><Label>Birth place <span className="text-muted-foreground">(city / region, optional)</span></Label><Input value={form.birthPlace} onChange={(e) => setForm({ ...form, birthPlace: e.target.value })} placeholder="e.g. Shanghai, China" /></div><label className="flex gap-3 rounded-xl bg-muted/60 p-3 text-xs leading-relaxed"><Checkbox checked={form.consentGiven} onCheckedChange={(v) => setForm({ ...form, consentGiven: v === true })} />I consent to using this optional context in my AI companion experience. It may be processed by our AI service provider and can be deleted in Settings.</label></div></section>}
    {step === 1 && <section className="mt-5"><h1 className="text-3xl font-semibold">What gives your days texture?</h1><p className="mt-2 text-sm text-muted-foreground">Pick as many as feel like you. Contradictions are welcome.</p><div className="mt-6 flex flex-wrap gap-2">{interests.map((v) => <button key={v} onClick={() => toggle(v)} className={`rounded-full border px-3.5 py-2 text-sm ${form.interests.includes(v) ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>{v}</button>)}</div></section>}
    {step === 2 && <section className="mt-5 space-y-5"><h1 className="text-3xl font-semibold">How does time usually treat you?</h1><div className="paper-card grid gap-4 p-5"><div><Label>Usually awake by</Label><Input type="time" value={form.wakeTime} onChange={(e) => setForm({ ...form, wakeTime: e.target.value })} /></div><div><Label>Usually trying to sleep by</Label><Input type="time" value={form.sleepTime} onChange={(e) => setForm({ ...form, sleepTime: e.target.value })} /></div><div><Label>Most weeks are…</Label><div className="mt-2 flex flex-wrap gap-2">{rhythms.map((v) => <button key={v} onClick={() => setForm({ ...form, workRhythm: v })} className={`rounded-full border px-3 py-2 text-sm ${form.workRhythm === v ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>{v}</button>)}</div></div></div></section>}
    <div className="mt-8 flex gap-3">{step > 0 && <Button variant="outline" className="rounded-full" onClick={() => setStep(step - 1)}>Back</Button>}<Button className="flex-1 rounded-full" disabled={(step === 0 && !form.consentGiven) || saving} onClick={() => step < 2 ? setStep(step + 1) : finish()}>{saving ? "Saving your profile…" : step < 2 ? "Continue" : "Discover my archetype"}</Button></div>
  </div>;
};
export default ProfileIntakePage;
