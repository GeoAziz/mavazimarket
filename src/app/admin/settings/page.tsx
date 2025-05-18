
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Keep if used outside react-hook-form context
import { Textarea } from '@/components/ui/textarea';
import { Settings, Store, Mail, MapPin, Phone, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Form, FormControl, FormField, FormItem, FormLabel as RHFFormLabel, FormMessage } from '@/components/ui/form'; // Renamed FormLabel to avoid conflict

const settingsFormSchema = z.object({
  siteName: z.string().min(1, "Site name is required.").default("Mavazi Market"),
  siteTagline: z.string().optional().default("Your one-stop shop for the latest fashion trends in Kenya."),
  siteDescription: z.string().optional().default("Mavazi Market offers a wide range of clothing and accessories..."),
  publicEmail: z.string().email("Invalid email address.").optional().or(z.literal("")).default("support@mavazimarket.co.ke"),
  publicPhone: z.string().optional().default("+254 700 123 456"),
  storeAddress: z.string().optional().default("123 Mavazi Towers, Biashara Street, Nairobi, Kenya"),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const SETTINGS_DOC_ID = "general"; // Fixed ID for the general settings document

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: settingsFormSchema.parse({}), // Initialize with Zod defaults
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const settingsDocRef = doc(db, "settings", SETTINGS_DOC_ID);
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
          form.reset(docSnap.data() as SettingsFormValues);
        } else {
          // If no settings exist, form will use defaultValues from schema
          console.log("No settings document found, using defaults.");
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({ title: "Error", description: "Could not load site settings.", variant: "destructive" });
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, [form, toast]);

  async function onSubmit(data: SettingsFormValues) {
    setIsSubmitting(true);
    try {
      const settingsDocRef = doc(db, "settings", SETTINGS_DOC_ID);
      await setDoc(settingsDocRef, { ...data, updatedAt: Timestamp.now() }, { merge: true });
      toast({
        title: "Settings Saved",
        description: "Your site settings have been updated.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({ title: "Error", description: "Could not save settings.", variant: "destructive" });
    }
    setIsSubmitting(false);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary flex items-center">
        <Settings size={30} className="mr-3 text-accent" /> Site Settings
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><Store className="mr-2 text-primary/80"/> General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="siteName" render={({ field }) => (
                  <FormItem>
                    <RHFFormLabel>Site Name</RHFFormLabel>
                    <FormControl><Input {...field} disabled={isSubmitting} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="siteTagline" render={({ field }) => (
                  <FormItem>
                    <RHFFormLabel>Site Tagline</RHFFormLabel>
                    <FormControl><Input {...field} disabled={isSubmitting} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField control={form.control} name="siteDescription" render={({ field }) => (
                  <FormItem>
                    <RHFFormLabel>Site Description (for SEO)</RHFFormLabel>
                    <FormControl><Textarea {...field} disabled={isSubmitting} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><MapPin className="mr-2 text-primary/80"/> Contact & Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <FormField control={form.control} name="publicEmail" render={({ field }) => (
                  <FormItem>
                    <RHFFormLabel>Public Email</RHFFormLabel>
                    <FormControl><Input type="email" {...field} disabled={isSubmitting} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="publicPhone" render={({ field }) => (
                  <FormItem>
                    <RHFFormLabel>Public Phone Number</RHFFormLabel>
                    <FormControl><Input type="tel" {...field} disabled={isSubmitting} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="storeAddress" render={({ field }) => (
                  <FormItem>
                    <RHFFormLabel>Store Address</RHFFormLabel>
                    <FormControl><Input {...field} disabled={isSubmitting} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Payment & Shipping Settings (Placeholder)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Settings for payment gateways and shipping methods will be configured here.</p>
              <p className="mt-2">Content coming soon!</p>
            </CardContent>
          </Card>
          
          <div className="flex justify-end pt-4">
            <Button 
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground" 
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save size={18} className="mr-2" />}
              {isSubmitting ? "Saving..." : "Save All Settings"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
