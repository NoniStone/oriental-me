import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Brain, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchMemory, removeMemory } from "@/lib/v2";

const MemoryPanel = () => {
  const { user } = useAuth(); const client = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ["ai-memory"], queryFn: () => fetchMemory(user!.id), enabled: !!user });
  return <section className="paper-card p-5"><div className="flex items-start gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-secondary"><Brain className="h-4 w-4 text-primary" /></span><div><h2 className="font-display text-lg font-semibold">What your companion is learning</h2><p className="mt-0.5 text-sm text-muted-foreground">These are editable observations, not labels or diagnoses.</p></div></div>{items.length ? <div className="mt-4 space-y-2">{items.map((item) => <div key={item.id} className="flex gap-2 rounded-xl bg-muted/60 p-3 text-sm"><p className="flex-1 leading-relaxed">{item.content}</p><Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-full" aria-label="Remove memory" onClick={async () => { await removeMemory(item.id); client.invalidateQueries({ queryKey: ["ai-memory"] }); }}><X className="h-3.5 w-3.5" /></Button></div>)}</div> : <p className="mt-4 rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">As you check in, reflect and complete small tasks, your companion will keep a few useful observations here.</p>}</section>;
};
export default MemoryPanel;
