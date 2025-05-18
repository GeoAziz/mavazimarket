
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SiteSettings } from '@/lib/types';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Mavazi Market',
  description: 'Your one-stop shop for the latest fashion trends in Kenya.',
};

function hexToHsl(hex: string): string | null {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return null;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const applyThemeSettings = async () => {
      try {
        const settingsDocRef = doc(db, "settings", "general");
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as SiteSettings;
          if (data.themeAppearance) {
            const { primaryColor, accentColor, backgroundColor, textColor } = data.themeAppearance;
            const root = document.documentElement;
            
            const primaryHsl = hexToHsl(primaryColor || '');
            if (primaryHsl) root.style.setProperty('--primary', primaryHsl);
            
            const accentHsl = hexToHsl(accentColor || '');
            if (accentHsl) root.style.setProperty('--accent', accentHsl);

            const backgroundHsl = hexToHsl(backgroundColor || '');
            if (backgroundHsl) root.style.setProperty('--background', backgroundHsl);
            
            const textHsl = hexToHsl(textColor || '');
            if (textHsl) root.style.setProperty('--foreground', textHsl);

            // You might need to adjust card, popover, etc., based on new background/foreground
            // For simplicity, we're directly setting the main theme colors.
            // For a full theme, you might derive other HSL values or set them individually if they are stored.
            if(backgroundHsl) { // Example: set card background to be same as general background
              root.style.setProperty('--card', backgroundHsl);
              root.style.setProperty('--popover', backgroundHsl);
            }
            if(textHsl) { // Example: set card foreground to be same as general foreground
               root.style.setProperty('--card-foreground', textHsl);
               root.style.setProperty('--popover-foreground', textHsl);
            }
             // Primary foreground is often a light color, this might need separate logic
             // or a separate color picker in admin settings
             // For now, let's assume it's light if primary is dark, and dark if primary is light
            if (primaryColor) {
                const primaryL = parseInt(primaryColor.slice(5, 7), 16); // crude lightness check
                if (primaryL < 128) { // If primary is dark-ish
                    root.style.setProperty('--primary-foreground', `0 0% 98%`); // Light
                } else {
                    root.style.setProperty('--primary-foreground', `0 0% 9%`); // Dark
                }
            }
             if (accentColor) {
                const accentL = parseInt(accentColor.slice(5, 7), 16);
                 if (accentL < 128) {
                    root.style.setProperty('--accent-foreground', `0 0% 98%`);
                } else {
                    root.style.setProperty('--accent-foreground', `0 0% 9%`);
                }
            }

          }
        }
      } catch (error) {
        console.error("Error applying theme settings:", error);
      }
    };

    applyThemeSettings();
  }, []);

  return (
    <html lang="en" className={inter.variable}>
      <body className={'font-sans antialiased flex flex-col min-h-screen'}>
        <AuthProvider>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
