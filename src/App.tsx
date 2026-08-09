import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import AppLayout from "@/components/layout/AppLayout";
import AdminPage from "./pages/admin/AdminPage";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Quiz from "./pages/Quiz";
import Home from "./pages/Home";
import Journey from "./pages/Journey";
import Challenges from "./pages/Challenges";
import ChallengeDetail from "./pages/ChallengeDetail";
import Discover from "./pages/Discover";
import Plan from "./pages/Plan";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const guarded = (page: React.ReactNode) => (
  <ProtectedRoute>
    <AppLayout>{page}</AppLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              }
            />
            <Route path="/home" element={guarded(<Home />)} />
            <Route path="/plan" element={guarded(<Plan />)} />
            <Route path="/journey" element={guarded(<Journey />)} />
            <Route path="/challenges" element={guarded(<Challenges />)} />
            <Route
              path="/challenges/:id"
              element={guarded(<ChallengeDetail />)}
            />
            <Route path="/discover" element={guarded(<Discover />)} />
            <Route path="/settings" element={guarded(<Settings />)} />
            <Route
              path="/admin"
              element={guarded(
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>,
              )}
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
