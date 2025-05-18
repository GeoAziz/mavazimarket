
"use client";

import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SiteSettings } from '@/lib/types';

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

export function ThemeApplicator() {
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

            if(backgroundHsl) {
              root.style.setProperty('--card', backgroundHsl);
              root.style.setProperty('--popover', backgroundHsl);
              // Adjust sidebar background as well if it's meant to follow main background
              root.style.setProperty('--sidebar-background', backgroundHsl);
            }
            if(textHsl) {
               root.style.setProperty('--card-foreground', textHsl);
               root.style.setProperty('--popover-foreground', textHsl);
               // Adjust sidebar foreground
               root.style.setProperty('--sidebar-foreground', textHsl);
            }

            // Determine primary-foreground based on lightness of primaryColor
            if (primaryColor) {
                const r = parseInt(primaryColor.slice(1, 3), 16);
                const g = parseInt(primaryColor.slice(3, 5), 16);
                const b = parseInt(primaryColor.slice(5, 7), 16);
                const brightness = (r * 299 + g * 587 + b * 114) / 1000; // Perceived brightness
                if (brightness > 128) { // If primary is light
                    root.style.setProperty('--primary-foreground', `0 0% 9%`); // Dark text
                    root.style.setProperty('--sidebar-primary-foreground', `0 0% 9%`);
                } else { // If primary is dark
                    root.style.setProperty('--primary-foreground', `0 0% 98%`); // Light text
                    root.style.setProperty('--sidebar-primary-foreground', `0 0% 98%`);
                }
            }
             if (accentColor) {
                const r = parseInt(accentColor.slice(1, 3), 16);
                const g = parseInt(accentColor.slice(3, 5), 16);
                const b = parseInt(accentColor.slice(5, 7), 16);
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                 if (brightness > 128) {
                    root.style.setProperty('--accent-foreground', `0 0% 9%`);
                    root.style.setProperty('--sidebar-accent-foreground', `0 0% 9%`);
                } else {
                    root.style.setProperty('--accent-foreground', `0 0% 98%`);
                    root.style.setProperty('--sidebar-accent-foreground', `0 0% 98%`);
                }
            }
            console.log("Theme applied from Firestore:", data.themeAppearance);
          }
        } else {
            console.log("No theme settings found in Firestore, using default theme.");
        }
      } catch (error) {
        console.error("Error applying theme settings:", error);
      }
    };

    applyThemeSettings();
    
    // Optional: Listen for changes in Firestore to re-apply theme,
    // or have a mechanism to trigger re-application after admin saves settings.
    // For simplicity, this runs once on mount.
  }, []);

  return null; // This component doesn't render any UI itself
}
