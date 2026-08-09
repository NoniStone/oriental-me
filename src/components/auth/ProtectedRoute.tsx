import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <img
          src="/assets/logo.png"
          alt=""
          className="h-12 w-12 animate-pulse rounded-full"
        />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
