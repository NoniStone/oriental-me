import { useQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const ChallengeCommunity = () => {
  const { data: posts = [] } = useQuery({ queryKey: ["social-posts"], queryFn: async () => {
    const { data, error } = await supabase.from("challenge_submissions").select("id,caption,submitted_at,media_assets(path, bucket),profiles!challenge_submissions_user_id_fkey(display_name)").in("status", ["approved", "featured"]).order("submitted_at", { ascending: false });
    if (error) throw error; return data ?? [];
  }});
  return <div className="space-y-4">{posts.map((post) => <article key={post.id} className="paper-card overflow-hidden"><div className="flex aspect-[4/5] items-center justify-center bg-muted"><Play className="h-10 w-10 text-primary" /></div><div className="p-4"><p className="font-medium">Oriental Me member</p>{post.caption && <p className="mt-1 text-sm text-muted-foreground">{post.caption}</p>}<div className="mt-3 flex gap-4 text-sm text-muted-foreground"><span className="flex items-center gap-1"><Heart className="h-4 w-4" /> Appreciate</span><span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> Comment</span></div></div></article>)}{posts.length === 0 && <div className="paper-card p-8 text-center"><p className="text-3xl">🎬</p><h2 className="mt-3 font-display text-xl font-semibold">The room is warming up.</h2><p className="mt-2 text-sm text-muted-foreground">Approved Challenge moments will appear here — the delightful, imperfect kind.</p></div>}</div>;
};
export default ChallengeCommunity;
