
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label'; // Keep for non-form controlled elements
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Settings2, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Form, FormControl, FormField, FormItem, FormLabel as RHFFormLabel, FormMessage, FormDescription } from "@/components/ui/form";

const appearanceFormSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").default("#DC143C"),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").default("#FF7F50"),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").default("#FAF9F6"),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").default("#333333"),
  // logoUpload: typeof window === 'undefined' ? z.any().optional() : z.instanceof(FileList).optional(), // File uploads are complex with RHF & server actions. Placeholder for now.
  // faviconUpload: typeof window === 'undefined' ? z.any().optional() : z.instanceof(FileList).optional(),
  showHeroBanner: z.boolean().default(true),
  showFeaturedProducts: z.boolean().default(true),
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

const SETTINGS_DOC_ID = "general"; 

export default function AdminCustomizePage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: appearanceFormSchema.parse({}),
  });

  useEffect(() => {
    const fetchAppearanceSettings = async () => {
      setIsLoading(true);
      try {
        const settingsDocRef = doc(db, "settings", SETTINGS_DOC_ID);
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Assuming appearance settings are stored under a 'themeAppearance' key or similar
          if (data.themeAppearance) {
            form.reset(data.themeAppearance);
          } else if (data.themeColors && data.homepageLayout) { // Fallback for older structure
             form.reset({
                primaryColor: data.themeColors.primaryColor || "#DC143C",
                accentColor: data.themeColors.accentColor || "#FF7F50",
                backgroundColor: data.themeColors.backgroundColor || "#FAF9F6",
                textColor: data.themeColors.textColor || "#333333",
                showHeroBanner: data.homepageLayout.showHeroBanner !== undefined ? data.homepageLayout.showHeroBanner : true,
                showFeaturedProducts: data.homepageLayout.showFeaturedProducts !== undefined ? data.homepageLayout.showFeaturedProducts : true,
             });
          }
        }
      } catch (error) {
        console.error("Error fetching appearance settings:", error);
        toast({ title: "Error", description: "Could not load appearance settings.", variant: "destructive" });
      }
      setIsLoading(false);
    };
    fetchAppearanceSettings();
  }, [form, toast]);

  async function onSubmit(data: AppearanceFormValues) {
    setIsSubmitting(true);
    try {
      const settingsDocRef = doc(db, "settings", SETTINGS_DOC_ID);
      // Store these settings under a specific key, e.g., 'themeAppearance'
      await setDoc(settingsDocRef, { themeAppearance: data, updatedAt: Timestamp.now() }, { merge: true });
      toast({
        title: "Appearance Saved",
        description: "Your customization settings have been updated in the database. Applying them visually requires additional steps.",
      });
    } catch (error) {
      console.error("Error saving appearance settings:", error);
      toast({ title: "Error", description: "Could not save appearance settings.", variant: "destructive" });
    }
    setIsSubmitting(false);
  }
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary flex items-center">
        <Settings2 size={30} className="mr-3 text-accent" /> Customize Appearance
      </h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Theme Customizer</CardTitle>
              <CardDescription>These values are saved to the database. Applying them to the live theme (`globals.css`) requires further implementation (e.g., dynamic CSS variables or a build step).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2 text-foreground">Colors (Hex Values)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="primaryColor" render={({ field }) => (
                    <FormItem><RHFFormLabel htmlFor={field.name}>Primary Color</RHFFormLabel><FormControl><Input type="color" {...field} className="h-10 p-1" disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="accentColor" render={({ field }) => (
                    <FormItem><RHFFormLabel htmlFor={field.name}>Accent Color</RHFFormLabel><FormControl><Input type="color" {...field} className="h-10 p-1" disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="backgroundColor" render={({ field }) => (
                    <FormItem><RHFFormLabel htmlFor={field.name}>Background Color</RHFFormLabel><FormControl><Input type="color" {...field} className="h-10 p-1" disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="textColor" render={({ field }) => (
                    <FormItem><RHFFormLabel htmlFor={field.name}>Text Color</RHFFormLabel><FormControl><Input type="color" {...field} className="h-10 p-1" disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-2 text-foreground">Logo & Favicon (Placeholder)</h3>
                <div className="space-y-1 mb-4">
                    <Label htmlFor="logo-upload">Upload Logo</Label>
                    <Input id="logo-upload" type="file" disabled={true} /> {/* File uploads are complex, disabling for now */}
                    <p className="text-xs text-muted-foreground">Recommended size: 200x50px. Formats: SVG, PNG, JPG. (Feature not implemented)</p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="favicon-upload">Upload Favicon</Label>
                    <Input id="favicon-upload" type="file" disabled={true} />
                    <p className="text-xs text-muted-foreground">Recommended size: 32x32px. Format: ICO, PNG. (Feature not implemented)</p>
                  </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-2 text-foreground">Homepage Layout</h3>
                <FormField control={form.control} name="showHeroBanner" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mb-2">
                    <RHFFormLabel htmlFor={field.name}>Show Hero Banner</RHFFormLabel>
                    <FormControl><Switch id={field.name} checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl>
                  </FormItem>)} 
                />
                <FormField control={form.control} name="showFeaturedProducts" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <RHFFormLabel htmlFor={field.name}>Show Featured Products Section</RHFFormLabel>
                    <FormControl><Switch id={field.name} checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl>
                  </FormItem>)}
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Saving..." : <><Save size={18} className="mr-2" /> Save Changes</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
