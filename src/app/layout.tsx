
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { NotificationHandler } from '@/components/notifications/notification-handler';
import { CartProvider } from '@/components/cart/cart-provider';
import { SplashScreen } from '@/components/ui/splash-screen';

export const metadata: Metadata = {
  title: 'Grosify - Freshness Delivered',
  description: 'Your premium modern grocery app for organic, fresh, and gourmet items.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛒</text></svg>',
  },
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
      <body className="font-body antialiased bg-[#F8F9FA]">
        <FirebaseClientProvider>
          <CartProvider>
            <SplashScreen />
            <NotificationHandler />
            <div className="min-h-screen flex flex-col max-w-7xl mx-auto relative bg-[#F8F9FA] shadow-sm md:shadow-2xl overflow-x-hidden pb-20 md:pb-0 md:my-4 md:rounded-[3rem]">
              {children}
            </div>
            <Toaster />
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
