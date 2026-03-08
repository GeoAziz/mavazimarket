
import type { Metadata, Viewport } from 'next';
import { Inter, DM_Serif_Display } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeApplicator } from '@/components/layout/ThemeApplicator';
import { CartProvider } from '@/contexts/CartContext';
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Mavazi Market | Authentic Afrocentric Soul',
    template: '%s | Mavazi Market',
  },
  description: 'Your premier destination for bold, high-quality fashion. Discover heritage-inspired collections for men, women, and kids. Modern craftsmanship meets timeless African soul.',
  keywords: ['African Fashion', 'Kenyan Style', 'Afrocentric Clothing', 'Mavazi Market', 'Heritage Fashion', 'Nairobi Designer'],
  authors: [{ name: 'Mavazi Market Team' }],
  creator: 'Mavazi Market',
  publisher: 'Mavazi Market',
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: 'https://mavazimarket.com',
    siteName: 'Mavazi Market',
    title: 'Mavazi Market | Authentic Afrocentric Soul',
    description: 'Heritage-inspired, modern-crafted fashion for the bold soul.',
    images: [
      {
        url: 'https://mavazimarket.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mavazi Market Afrocentric Soul',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mavazi Market | Authentic Afrocentric Soul',
    description: 'Modern African heritage fashion.',
    images: ['https://mavazimarket.com/og-image.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#D4501A', // Terracotta
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerif.variable}`}>
      <body className={'font-sans antialiased flex flex-col min-h-screen bg-background text-foreground'}>
        <AuthProvider>
          <CartProvider>
            <ThemeApplicator />
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
            <Toaster />
            <Analytics />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
