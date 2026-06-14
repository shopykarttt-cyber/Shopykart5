
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { NotificationHandler } from '@/components/notifications/notification-handler';
import { CartProvider } from '@/components/cart/cart-provider';

export const metadata: Metadata = {
  title: 'Grosify - Freshness Delivered',
  description: 'Your premium modern grocery app for organic, fresh, and gourmet items.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        <FirebaseClientProvider>
          <CartProvider>
            <NotificationHandler />
            <main className="min-h-screen flex flex-col max-w-md mx-auto relative shadow-2xl bg-white overflow-x-hidden pb-20">
              {children}
            </main>
            <Toaster />
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
