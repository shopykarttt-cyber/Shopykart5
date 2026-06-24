
"use client";

import { useUser } from "@/firebase";
import { AuthScreen } from "./auth-screen";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();

  if (loading) {
    // Return a full-screen black overlay to match splash screen
    // This ensures that while auth is being determined, nothing else is visible.
    return <div className="fixed inset-0 z-[110] bg-black" />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <>{children}</>;
}
