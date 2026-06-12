
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
          await getToken(messaging, {
            vapidKey: 'BKrUFOk40JUUrlOc6Fl8A-kkIzTZl1gKhj4Q3QnsUe-pu37mjhh6qJzmoxsrBoAXWtoJh1mezyQYQML6Tzb3GgI' 
          });
        }
      } catch (error) {
        // Silent error in production
      }
    };

    requestPermission();

    const unsubscribe = onMessage(messaging, (payload) => {
      toast({
        title: payload.notification?.title || 'New Notification',
        description: payload.notification?.body || '',
      });
    });

    return () => unsubscribe();
  }, [app]);

  return null;
}
