import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ArticlesManager from "@/components/admin/ArticlesManager";
import ChallengesManager from "@/components/admin/ChallengesManager";
import RitualsManager from "@/components/admin/RitualsManager";
import DiscoveriesManager from "@/components/admin/DiscoveriesManager";
import TrendRadar from "@/components/admin/TrendRadar";
import AssetsManager from "@/components/admin/AssetsManager";
import { ShieldCheck } from "lucide-react";

const AdminPage = () => (
  <div className="space-y-6">
    <section>
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h1 className="text-3xl font-semibold tracking-tight">Studio</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Oriental Me editorial &amp; content management. Drafts are invisible to
        users until published.
      </p>
    </section>

    <Tabs defaultValue="articles">
      <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-muted p-1">
        <TabsTrigger value="articles" className="rounded-full px-3.5 py-1.5 text-sm">
          Articles
        </TabsTrigger>
        <TabsTrigger value="challenges" className="rounded-full px-3.5 py-1.5 text-sm">
          Challenges
        </TabsTrigger>
        <TabsTrigger value="rituals" className="rounded-full px-3.5 py-1.5 text-sm">
          Rituals
        </TabsTrigger>
        <TabsTrigger value="discoveries" className="rounded-full px-3.5 py-1.5 text-sm">
          Discoveries
        </TabsTrigger>
        <TabsTrigger value="trends" className="rounded-full px-3.5 py-1.5 text-sm">
          📡 Trend Radar
        </TabsTrigger>
        <TabsTrigger value="assets" className="rounded-full px-3.5 py-1.5 text-sm">
          Media
        </TabsTrigger>
      </TabsList>
      <TabsContent value="articles" className="mt-5">
        <ArticlesManager />
      </TabsContent>
      <TabsContent value="challenges" className="mt-5">
        <ChallengesManager />
      </TabsContent>
      <TabsContent value="rituals" className="mt-5">
        <RitualsManager />
      </TabsContent>
      <TabsContent value="discoveries" className="mt-5">
        <DiscoveriesManager />
      </TabsContent>
      <TabsContent value="trends" className="mt-5">
        <TrendRadar />
      </TabsContent>
      <TabsContent value="assets" className="mt-5">
        <AssetsManager />
      </TabsContent>
    </Tabs>
  </div>
);

export default AdminPage;
