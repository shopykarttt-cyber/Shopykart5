
'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [instances, setInstances] = useState<{
    app: FirebaseApp;
    firestore: Firestore;
    auth: Auth;
  } | null>(null);

  useEffect(() => {
    try {
      const { app, firestore, auth } = initializeFirebase();
      setInstances({ app, firestore, auth });
    } catch (error) {
      console.error("Firebase initialization failed:", error);
    }
  }, []);

  if (!instances) {
    // Returning a black screen to match the splash screen during initialization
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <FirebaseProvider
      app={instances.app}
      firestore={instances.firestore}
      auth={instances.auth}
    >
      {children}
    </FirebaseProvider>
  );
}
