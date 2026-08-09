import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchProfile } from "@/lib/cloud";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <img
          src="/assets/logo.png"
          alt=""
          className="h-10 w-10 animate-pulse rounded-full"
        />
      </div>
    );
  }

  if (!profile?.is_admin) return <Navigate to="/home" replace />;

  return <>{children}</>;
};

export default AdminRoute;
