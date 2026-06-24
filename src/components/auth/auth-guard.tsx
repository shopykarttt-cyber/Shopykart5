
"use client";

import { useUser } from "@/firebase";
import { AuthScreen } from "./auth-screen";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();

  if (loading) {
    // Keep the screen clean while checking auth status
    return <div className="min-h-screen bg-black" />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <>{children}</>;
}
