
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Sparkles, Wand2, AlertTriangle, Loader2, ShieldCheck, Shirt } from 'lucide-react';
import { getStyleAdviceAction } from './actions';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { motion, AnimatePresence } from 'framer-motion';

const styleAdvisorSchema = z.object({
  purchaseHistory: z.string().min(10, "Please describe your style preferences (at least 10 characters).").max(1000, "Description is too long."),
});
type StyleAdvisorFormValues = z.infer<typeof styleAdvisorSchema>;

export default function StyleAdvisorPage() {
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<StyleAdvisorFormValues>({
    resolver: zodResolver(styleAdvisorSchema),
    defaultValues: {
      purchaseHistory: "I love bold geometric prints, high-waisted silhouettes, and linen textures. Usually shop for modern office wear.",
    },
  });

  const onSubmit = async (data: StyleAdvisorFormValues) => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    const result = await getStyleAdviceAction({ purchaseHistory: data.purchaseHistory });

    if (result.success && result.recommendations) {
      setRecommendations(result.recommendations);
    } else {
      setError(result.error || "The advisor is currently occupied. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-12 pb-24">
      <Breadcrumbs items={[{ label: 'Style Advisor' }]} />
      
      <div className="text-center max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mb-6"
        >
          <Sparkles className="h-12 w-12 text-primary" />
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-heading text-secondary mb-4">Your Heritage Stylist</h1>
        <div className="h-1 w-24 bg-accent mx-auto rounded-full mb-6"></div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Our GenAI advisor analyzes your preferences to curate a collection that speaks to your unique heritage and modern path.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        {/* Form Side */}
        <div className="lg:col-span-5">
          <Card className="shadow-2xl border-none rounded-2xl overflow-hidden">
            <CardHeader className="bg-secondary text-background p-8">
              <CardTitle className="text-2xl font-heading flex items-center">
                <Shirt className="mr-3 text-primary" size={24} /> 1. Preferences
              </CardTitle>
              <CardDescription className="text-background/60 tracking-widest uppercase text-[10px] font-bold">
                Tell us what moves your soul
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="p-8">
                  <FormField
                    control={form.control}
                    name="purchaseHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-secondary/50">Your Style Profile</FormLabel>
                        <FormControl>
                          <Textarea
                            id="purchaseHistory"
                            rows={6}
                            placeholder="e.g., Bold prints, earthy tones, mud cloth textures..."
                            {...field}
                            className="resize-none border-2 border-primary/10 focus-visible:ring-primary rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="p-8 pt-0">
                  <Button type="submit" disabled={isLoading} className="w-full h-[60px] bg-primary text-white font-bold tracking-[0.2em] text-lg rounded-xl shadow-xl shadow-primary/20">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-3 h-6 w-6 animate-spin" /> ANALYZING...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-3 h-6 w-6" /> CONSULT ADVISOR
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>

        {/* Results Side */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Alert variant="destructive" className="border-2 rounded-2xl p-6 bg-destructive/5">
                  <AlertTriangle className="h-6 w-6" />
                  <AlertTitle className="font-heading text-xl ml-2">Advisor Busy</AlertTitle>
                  <AlertDescription className="ml-2 mt-2">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {recommendations ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="border-none shadow-2xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-primary text-white p-8">
                    <CardTitle className="text-3xl font-heading flex items-center justify-between">
                      Stylist's Curation
                      <ShieldCheck size={24} className="text-accent" />
                    </CardTitle>
                    <CardDescription className="text-white/70 tracking-widest uppercase text-[10px] font-bold">
                      Personalized Heritage Report
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 md:p-12">
                    <div className="prose prose-stone max-w-none prose-headings:font-heading prose-headings:text-secondary prose-p:text-muted-foreground prose-strong:text-primary whitespace-pre-wrap leading-relaxed text-lg">
                      {recommendations}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-secondary/5 p-8 border-t border-primary/10">
                    <div className="flex items-center text-[10px] font-bold tracking-widest text-primary uppercase">
                      <Sparkles size={14} className="mr-2" /> 
                      Report generated via Mavazi AI Engine
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ) : !isLoading && (
              <div className="h-full min-h-[400px] border-4 border-dashed border-primary/10 rounded-[2rem] flex flex-col items-center justify-center text-center p-12">
                <Shirt className="h-16 w-16 text-primary/20 mb-6" strokeWidth={1} />
                <h3 className="text-2xl font-heading text-secondary/40">Waiting for Consultation</h3>
                <p className="text-muted-foreground max-w-xs mt-2">Describe your style on the left to receive your custom heritage report.</p>
              </div>
            )}

            {isLoading && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-6">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Wand2 className="h-24 w-24 text-primary/20" strokeWidth={1} />
                </motion.div>
                <div className="space-y-2 text-center">
                  <p className="font-heading text-xl text-secondary animate-pulse">Reading the loom...</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">GenAI Processing</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
