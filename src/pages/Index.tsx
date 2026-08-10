import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { ArrowRight, Sparkles, Leaf, Compass } from "lucide-react";
import LaunchSequence from "@/components/LaunchSequence";

const features = [
  {
    icon: Sparkles,
    title: "Discover your pattern",
    text: "A short quiz reveals your Oriental Archetype — a reflective lens inspired by traditional Chinese concepts.",
  },
  {
    icon: Leaf,
    title: "See through Two Lenses",
    text: "Every idea shown two ways: the traditional Chinese framework, and what modern science says about related habits.",
  },
  {
    icon: Compass,
    title: "Try, don't believe",
    text: "Small daily rituals and 7-day challenges. You experiment — your own experience decides.",
  },
];

const Index = () => {
  const { session, loading } = useAuth();
  const [introDone, setIntroDone] = useState(false);

  if (loading) return <LaunchSequence onComplete={() => setIntroDone(true)} />;

  if (session) return <Navigate to="/home" replace />;
  if (!introDone) return <LaunchSequence onComplete={() => setIntroDone(true)} />;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-5 pb-16 pt-8">
        <div className="flex items-center gap-2.5 animate-fade-in">
          <img
            src="/assets/logo.png"
            alt="Oriental Me logo"
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="font-display text-lg font-semibold">Oriental Me</span>
          <span className="text-xs text-muted-foreground">养生</span>
        </div>

        <div className="mt-10 animate-fade-up">
          <p className="mb-3 inline-block rounded-full bg-secondary px-3.5 py-1 text-xs font-semibold text-secondary-foreground">
            Traditional Chinese wisdom · Modern context · Your experience
          </p>
          <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl">
            Explore a different way of{" "}
            <span className="text-primary">taking care of yourself.</span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            Yangsheng (养生) is the Chinese art of nourishing life through
            everyday rhythm — food, rest, movement and season. Not a treatment.
            A way of noticing.
          </p>

          <div className="mt-7">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/login">
                Start your rhythm
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div
          className="mt-10 overflow-hidden rounded-3xl shadow-lg animate-fade-up"
          style={{ animationDelay: "150ms" }}
        >
          <img
            src="/assets/hero-tea.png"
            alt="A calm Chinese tea ritual with clay teapot and chrysanthemum"
            className="aspect-[16/10] w-full object-cover"
          />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="paper-card p-5 animate-fade-up"
              style={{ animationDelay: `${250 + i * 120}ms` }}
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary">
                <f.icon className="h-5 w-5 text-primary" />
              </span>
              <h3 className="font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {f.text}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-xs leading-relaxed text-muted-foreground">
          Oriental Me shares cultural, educational and wellness information. It
          does not diagnose or treat medical conditions.
        </p>
      </div>
    </div>
  );
};

export default Index;
