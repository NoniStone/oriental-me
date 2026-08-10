import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchRecentCheckIns } from "@/lib/cloud";
import { trackProductEvent } from "@/lib/v2";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const WeeklyReview = () => {
  const { user } = useAuth();
  const [interested, setInterested] = useState(false);
  const { data: checkIns = [] } = useQuery({ queryKey: ["weekly-checkins"], queryFn: () => fetchRecentCheckIns(user!.id, 7), enabled: !!user });
  const enoughHistory = checkIns.length >= 4;

  useEffect(() => {
    if (user && enoughHistory) void trackProductEvent(user.id, "paywall_viewed", { feature: "weekly_rhythm_review", check_in_count: checkIns.length });
  }, [user, enoughHistory, checkIns.length]);

  const requestAccess = async () => {
    if (!user) return;
    await trackProductEvent(user.id, "early_access_requested", { feature: "weekly_rhythm_review", check_in_count: checkIns.length });
    setInterested(true);
    toast.success("You're on the early-access list. Thank you for shaping what comes next.");
  };

  return (
    <section className="paper-card overflow-hidden">
      <div className="bg-foreground p-5 text-background"><p className="text-xs font-semibold uppercase tracking-wider opacity-70">Coming next · Compass Plus</p><h2 className="mt-1 font-display text-xl font-semibold">A weekly rhythm review</h2><p className="mt-2 text-sm leading-relaxed opacity-80">A private, calm summary of what you noticed — with one useful experiment for next week.</p></div>
      <div className="p-5">{enoughHistory ? <><p className="text-sm text-muted-foreground">You have enough check-ins for this deeper layer. We're testing whether this is worth building as a paid membership feature.</p><Button onClick={requestAccess} disabled={interested} className="mt-4 w-full rounded-full">{interested ? "Early access requested" : <><Sparkles className="mr-1.5 h-4 w-4" />I’d pay for this</>}</Button><p className="mt-3 text-center text-xs text-muted-foreground">No charge and no payment details — this simply helps us test demand.</p></> : <p className="text-sm text-muted-foreground">Check in on at least 4 different days first. A useful weekly view needs a little weather.</p>}</div>
    </section>
  );
};

export default WeeklyReview;
