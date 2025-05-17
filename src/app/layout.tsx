import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed from GeistSans to Inter
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";

// Initialize Inter font with a CSS variable named --font-sans
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Use a standard variable name for Tailwind integration
});

export const metadata: Metadata = {
  title: 'Mavazi Market',
  description: 'Your one-stop shop for the latest fashion trends in Kenya.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={'font-sans antialiased flex flex-col min-h-screen'}>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
