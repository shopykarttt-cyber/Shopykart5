
'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../provider';

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged is the source of truth for auth state.
    // It will always fire at least once with the current user or null.
    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error("Auth state change error:", error);
        setLoading(false);
      }
    );

    // We removed the short safety timeout to prevent flickering
    // where 'loading' could become false before Firebase was ready.
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 8000); // Increased to 8s as a final fail-safe only

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [auth]);

  return { user, loading };
}
