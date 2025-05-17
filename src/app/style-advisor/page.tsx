"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Sparkles, Wand2, AlertTriangle, Loader2 } from 'lucide-react';
import { getStyleAdviceAction } from './actions';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const styleAdvisorSchema = z.object({
  purchaseHistory: z.string().min(10, "Please enter some purchase history (at least 10 characters).").max(1000, "Purchase history is too long (max 1000 characters)."),
});
type StyleAdvisorFormValues = z.infer<typeof styleAdvisorSchema>;

export default function StyleAdvisorPage() {
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<StyleAdvisorFormValues>({
    resolver: zodResolver(styleAdvisorSchema),
    defaultValues: {
      purchaseHistory: "Men's Basic T-Shirt, Slim Fit Jeans, Casual Sneakers", // Example prefill
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
      setError(result.error || "An unknown error occurred.");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'AI Style Advisor' }]} />
      <div className="text-center">
        <Wand2 className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold text-primary">AI Style Advisor</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Get personalized style recommendations based on your past purchases or items you like.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle>Describe Your Style</CardTitle>
          <CardDescription>
            Enter a few items from your purchase history or items you're interested in, separated by commas.
            For example: "Red summer dress, white sneakers, denim jacket"
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="purchaseHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="purchaseHistory" className="sr-only">Purchase History</FormLabel>
                    <FormControl>
                      <Textarea
                        id="purchaseHistory"
                        rows={5}
                        placeholder="e.g., Men's blue shirt, black formal trousers, leather belt..."
                        {...field}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Get Recommendations
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {error && (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {recommendations && (
        <Card className="max-w-2xl mx-auto shadow-lg bg-secondary">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center">
              <Sparkles size={24} className="mr-2" /> Your Style Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none text-secondary-foreground whitespace-pre-wrap">
              {recommendations}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
