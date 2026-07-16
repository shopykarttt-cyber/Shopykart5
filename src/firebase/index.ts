
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp | undefined;
let firestoreDb: Firestore | undefined;
let firebaseAuth: Auth | undefined;

export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!firebaseApp) {
      firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    }
    
    if (!firestoreDb) {
      firestoreDb = getFirestore(firebaseApp);
    }
    
    if (!firebaseAuth) {
      firebaseAuth = getAuth(firebaseApp);
    }

    return { app: firebaseApp, firestore: firestoreDb, auth: firebaseAuth };
  }

  // Fallback for server-side (though most Firebase logic here is client-side)
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const firestore = getFirestore(app);
  const auth = getAuth(app);
  return { app, firestore, auth };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
