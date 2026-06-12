
'use client';

import { useEffect } from 'react';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { useFirebaseApp } from '@/firebase';
import { toast } from '@/hooks/use-toast';

export function NotificationHandler() {
  const app = useFirebaseApp();

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const setupMessaging = async () => {
      try {
        const supported = await isSupported();
        if (!supported) return;

        const messaging = getMessaging(app);

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          await getToken(messaging, {
            vapidKey: 'BKrUFOk40JUUrlOc6Fl8A-kkIzTZl1gKhj4Q3QnsUe-pu37mjhh6qJzmoxsrBoAXWtoJh1mezyQYQML6Tzb3GgI' 
          });
        }

        onMessage(messaging, (payload) => {
          toast({
            title: payload.notification?.title || 'New Notification',
            description: payload.notification?.body || '',
          });
        });
      } catch (error) {
        // Silent fail for messaging to prevent app crash
        console.warn("Messaging setup skipped:", error);
      }
    };

    setupMessaging();
  }, [app]);

  return null;
}
