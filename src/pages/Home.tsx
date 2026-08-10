import { Link } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import CheckIn, { readPattern } from "@/components/CheckIn";
import RitualCard from "@/components/RitualCard";
import { JourneyToday } from "@/components/JourneyToday";
import { useAuth } from "@/components/auth/AuthProvider";
import { getArchetype } from "@/data/archetypes";
import { fetchRituals } from "@/lib/content";
import { fetchProfile, fetchStats, fetchTodayCheckIn, saveCheckInCloud } from "@/lib/cloud";
import { dayOfYear, todayKey, type CheckIn as CheckInType } from "@/lib/storage";
import { toast } from "sonner";

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const Home = () => {
  const { user } = useAuth();
  const client = useQueryClient();
  const [localCheckIn, setLocalCheckIn] = useState<CheckInType | null>(null);

  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile(user!.id), enabled: !!user });
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: () => fetchStats(user!.id), enabled: !!user });
  const { data: cloudCheckIn, isLoading } = useQuery({ queryKey: ["checkin", todayKey()], queryFn: () => fetchTodayCheckIn(user!.id), enabled: !!user });
  const { data: rituals = [] } = useQuery({ queryKey: ["rituals"], queryFn: fetchRituals });

  const checkIn = localCheckIn ?? cloudCheckIn ?? null;
  const checkInCount = stats?.checkIns ?? 0;
  const journeyUnlocked = checkInCount >= 3;
  const archetype = getArchetype(profile?.archetype_id ?? undefined);
  const ritualPool = archetype ? rituals.filter((ritual) => archetype.ritualIds.includes(ritual.id)) : rituals;
  const ritual = (ritualPool.length ? ritualPool : rituals)[dayOfYear() % Math.max(ritualPool.length || rituals.length, 1)];

  const saveCheckIn = useMutation({
    mutationFn: (entry: CheckInType) => saveCheckInCloud(user!.id, entry),
    onSuccess: (_data, entry) => {
      setLocalCheckIn(entry);
      client.invalidateQueries({ queryKey: ["checkin"] });
      client.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: () => toast.error("Couldn't save your check-in — please try again"),
  });

  const remaining = Math.max(0, 3 - checkInCount);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{greeting()}{profile?.display_name ? `, ${profile.display_name}` : ""}.</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          One small check-in is enough for today. We build the picture slowly, with you.
        </p>
      </section>

      <section className="paper-card overflow-hidden">
        <div className="bg-primary p-5 text-primary-foreground">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Today · step {Math.min(checkInCount + 1, 3)} of 3</p>
          <h2 className="mt-1 font-display text-xl font-semibold">{checkIn ? "Your small next move" : "How are you arriving?"}</h2>
        </div>
        <div className="p-5">
          {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : !checkIn ? <CheckIn onComplete={(entry) => saveCheckIn.mutate(entry)} /> : <div className="animate-fade-up"><p className="inline-block rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">{readPattern(checkIn).name}</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{readPattern(checkIn).reading}</p></div>}
        </div>
      </section>

      {journeyUnlocked ? (
        <JourneyToday />
      ) : (
        <section className="rounded-2xl border border-dashed border-primary/30 bg-secondary/40 p-5">
          <div className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-card"><Sparkles className="h-4 w-4 text-primary" /></span>
            <div><h2 className="font-display text-lg font-semibold">Your companion is listening first</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{remaining > 0 ? `Check in on ${remaining} more day${remaining === 1 ? "" : "s"} to unlock a personalised daily Journey.` : "Your daily Journey is ready."}</p></div>
          </div>
        </section>
      )}

      {ritual && <section><div className="mb-3 flex items-baseline justify-between"><h2 className="font-display text-lg font-semibold">One simple ritual</h2><span className="text-xs text-muted-foreground">5 minutes is enough</span></div><RitualCard ritual={ritual} highlight /></section>}

      {checkInCount >= 2 && <section className="paper-card flex items-center gap-4 p-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary"><Compass className="h-5 w-5 text-primary" /></span><div className="min-w-0 flex-1"><h2 className="font-display font-semibold">Ready to explore?</h2><p className="mt-1 text-sm text-muted-foreground">Stories and challenges are here when you want more than today.</p></div><Button asChild variant="outline" size="sm" className="shrink-0 rounded-full"><Link to="/discover">Explore<ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button></section>}
    </div>
  );
};

export default Home;
