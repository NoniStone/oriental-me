import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = { children: ReactNode };
type State = { hasError: boolean };

class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep a diagnostic trail without exposing implementation details to users.
    console.error("[app-render-error]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center px-5 py-10">
          <section className="paper-card w-full max-w-md p-7 text-center">
            <p className="text-3xl" aria-hidden="true">🍃</p>
            <h1 className="mt-3 font-display text-2xl font-semibold">Let’s begin again</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              This screen didn’t load as expected. Your saved rhythm is safe.
            </p>
            <Button className="mt-5 rounded-full" onClick={() => window.location.reload()}>
              Reload Oriental Me
            </Button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

export default AppErrorBoundary;
