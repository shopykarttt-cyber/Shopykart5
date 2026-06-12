
'use client';

import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useFirebaseApp } from '@/firebase';
import { toast } from '@/hooks/use-toast';

export function NotificationHandler() {
  const app = useFirebaseApp();

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const messaging = getMessaging(app);

    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Note: Replace with your actual VAPID key from Firebase Console
          const token = await getToken(messaging, {
            vapidKey: 'YOUR_VAPID_KEY_HERE' 
          });
          console.log('FCM Token:', token);
          // You would typically save this token to Firestore under the user's profile
        }
      } catch (error) {
        console.error('An error occurred while retrieving token:', error);
      }
    };

    requestPermission();

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received: ', payload);
      toast({
        title: payload.notification?.title || 'New Notification',
        description: payload.notification?.body || '',
      });
    });

    return () => unsubscribe();
  }, [app]);

  return null;
}
