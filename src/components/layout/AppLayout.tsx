import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Sunrise, Compass, Flag, CircleUser, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/home", label: "Today", icon: Sunrise },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/challenges", label: "Challenges", icon: Flag },
  { to: "/journey", label: "Journey", icon: CircleUser },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-5 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/assets/logo.png"
              alt="Oriental Me"
              className="h-9 w-9 rounded-full object-cover"
            />
            <div className="leading-tight">
              <span className="font-display text-lg font-semibold tracking-tight">
                Oriental Me
              </span>
              <span className="ml-2 text-xs text-muted-foreground">养生</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="ml-auto rounded-full text-muted-foreground"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main key={location.pathname} className="mx-auto max-w-2xl px-5 pt-6 animate-fade-up">
        {children}
        <p className="mt-12 rounded-2xl bg-muted/60 px-4 py-3 text-center text-xs leading-relaxed text-muted-foreground">
          Oriental Me shares cultural, educational and wellness information. It
          does not diagnose or treat medical conditions. For persistent
          symptoms, please consult a healthcare professional.
        </p>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto grid max-w-2xl grid-cols-4 px-2 pb-[env(safe-area-inset-bottom)]">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 rounded-2xl py-3 text-[11px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "flex h-8 w-14 items-center justify-center rounded-full transition-colors",
                      isActive && "bg-secondary",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
