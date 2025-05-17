"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from 'next/link';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LogIn, KeyRound, Mail } from 'lucide-react';

const loginFormSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});
type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(data: LoginFormValues) {
    console.log("Login attempt:", data);
    // Handle login logic here
    alert("Login successful! (Mock - Redirecting to profile...)");
    // router.push('/profile'); // Example redirect
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-10"> {/* Adjust min-h as needed */}
      <div className="w-full max-w-md">
        <Breadcrumbs items={[{ label: 'Login' }]} className="mb-4 justify-center" />
        
        <Card className="shadow-xl w-full">
          <CardHeader className="text-center">
            <LogIn size={48} className="mx-auto text-primary mb-3" />
            <CardTitle className="text-3xl font-bold text-primary">Welcome Back!</CardTitle>
            <CardDescription>Sign in to access your account, orders, and wishlist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Mail size={16} className="mr-2 text-muted-foreground"/>Email Address</FormLabel>
                      <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><KeyRound size={16} className="mr-2 text-muted-foreground"/>Password</FormLabel>
                      <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                       <div className="text-right">
                        <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs text-accent hover:underline">
                          <Link href="/forgot-password">Forgot password?</Link>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center text-sm">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Button variant="link" asChild className="p-0 h-auto text-accent hover:underline">
                <Link href="/signup">Sign up here</Link>
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
