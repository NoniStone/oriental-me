import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EvidenceBadge from "@/components/EvidenceBadge";
import { fetchArticles, type Article } from "@/lib/content";

const Discover = () => {
  const [tab, setTab] = useState("all");
  const [openItem, setOpenItem] = useState<Article | null>(null);

  const { data: feedItems = [] } = useQuery({
    queryKey: ["articles"],
    queryFn: fetchArticles,
  });

  const items = feedItems.filter((item) => tab === "all" || item.type === tab);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Discover</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Oriental Me Daily — curated stories from Chinese wellness culture,
          translated with context.
        </p>
      </section>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto rounded-full bg-muted p-1">
          <TabsTrigger value="all" className="rounded-full px-4 py-1.5 text-sm">
            All
          </TabsTrigger>
          <TabsTrigger value="daily" className="rounded-full px-4 py-1.5 text-sm">
            Daily
          </TabsTrigger>
          <TabsTrigger value="pulse" className="rounded-full px-4 py-1.5 text-sm">
            🇨🇳 Internet Pulse
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setOpenItem(item)}
            className="paper-card w-full overflow-hidden text-left transition-transform hover:-translate-y-0.5"
          >
            {item.image && (
              <img
                src={item.image}
                alt=""
                className="aspect-[16/8] w-full object-cover"
              />
            )}
            <div className="p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {item.type === "pulse" ? (
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-terracotta">
                    🇨🇳 China Internet Pulse
                  </span>
                ) : (
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                    Oriental Me Daily
                  </span>
                )}
                <EvidenceBadge evidence={item.evidence} />
                <span className="text-[11px] text-muted-foreground">
                  {item.readMinutes} min read
                </span>
              </div>
              <h2 className="font-display text-xl font-semibold leading-snug">
                {item.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {item.excerpt}
              </p>
              {item.source && (
                <p className="mt-3 text-xs text-muted-foreground">
                  via {item.source.platform}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!openItem} onOpenChange={(open) => !open && setOpenItem(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-3xl">
          {openItem && (
            <>
              <DialogHeader className="text-left">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <EvidenceBadge evidence={openItem.evidence} />
                  <span className="text-[11px] text-muted-foreground">
                    {openItem.readMinutes} min read
                  </span>
                </div>
                <DialogTitle className="font-display text-2xl leading-snug">
                  {openItem.title}
                </DialogTitle>
              </DialogHeader>
              {openItem.image && (
                <img
                  src={openItem.image}
                  alt=""
                  className="aspect-[16/9] w-full rounded-2xl object-cover"
                />
              )}
              <div className="space-y-3">
                {openItem.body.map((paragraph, i) => (
                  <p key={i} className="text-sm leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
              {openItem.source && (
                <div className="rounded-2xl bg-muted/70 p-4 text-xs leading-relaxed text-muted-foreground">
                  <p className="mb-1 font-semibold text-foreground">Source</p>
                  <p>Platform: {openItem.source.platform}</p>
                  <p>Creator: {openItem.source.creator}</p>
                  <p>Date: {openItem.source.date}</p>
                  <p className="mt-2">{openItem.source.note}</p>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Discover;
