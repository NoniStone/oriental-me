import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Check, Star, X } from "lucide-react";
import { toast } from "sonner";

const CommunityManager = () => {
  const client = useQueryClient();
  const { data: submissions = [] } = useQuery({ queryKey: ["admin-community-submissions"], queryFn: async () => { const { data, error } = await supabase.from("challenge_submissions").select("id,caption,status,submitted_at,challenge_id").order("submitted_at", { ascending: false }); if (error) throw error; return data ?? []; } });
  const setStatus = async (id: string, status: "approved" | "rejected" | "featured") => { try { const { error } = await supabase.from("challenge_submissions").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id); if (error) throw error; client.invalidateQueries({ queryKey: ["admin-community-submissions"] }); client.invalidateQueries({ queryKey: ["social-posts"] }); toast.success(status === "rejected" ? "Submission hidden" : status === "featured" ? "Selected as a Community feature" : "Submission approved"); } catch { toast.error("Couldn’t update submission"); } };
  return <div className="space-y-3"><div><h3 className="font-display text-lg font-semibold">Community review</h3><p className="mt-1 text-sm text-muted-foreground">Review Challenge videos before they appear in the Challenge Community tab.</p></div>{submissions.map((s) => <div key={s.id} className="paper-card p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-terracotta">{s.status}</p><p className="mt-1 text-sm">{s.caption || "No caption"}</p><p className="mt-1 text-xs text-muted-foreground">Challenge: {s.challenge_id}</p></div><div className="flex flex-wrap justify-end gap-2"><Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus(s.id, "approved")}><Check className="mr-1 h-3.5 w-3.5" />Approve</Button><Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus(s.id, "featured")}><Star className="mr-1 h-3.5 w-3.5" />Top 3</Button><Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={() => setStatus(s.id, "rejected")}><X className="mr-1 h-3.5 w-3.5" />Reject</Button></div></div></div>)}{submissions.length === 0 && <div className="paper-card p-6 text-center text-sm text-muted-foreground">No Challenge videos awaiting review.</div>}</div>;
};
export default CommunityManager;
