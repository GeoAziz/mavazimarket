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
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Mail, KeyRound, User as UserIcon } from 'lucide-react';

const signupFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(6, "Password confirmation is required."),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Set error on confirmPassword field
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function SignupPage() {
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", agreeToTerms: false },
  });

  function onSubmit(data: SignupFormValues) {
    console.log("Signup attempt:", data);
    // Handle signup logic here
    alert("Account created successfully! (Mock - Redirecting to login...)");
    // router.push('/login'); // Example redirect
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-10"> {/* Adjust min-h as needed */}
       <div className="w-full max-w-md">
        <Breadcrumbs items={[{ label: 'Sign Up' }]} className="mb-4 justify-center" />
        
        <Card className="shadow-xl w-full">
          <CardHeader className="text-center">
            <UserPlus size={48} className="mx-auto text-primary mb-3" />
            <CardTitle className="text-3xl font-bold text-primary">Create Your Account</CardTitle>
            <CardDescription>Join Mavazi Market and start shopping for the latest trends!</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><UserIcon size={16} className="mr-2 text-muted-foreground"/>Full Name</FormLabel>
                      <FormControl><Input placeholder="e.g. Amina Wanjiru" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><KeyRound size={16} className="mr-2 text-muted-foreground"/>Confirm Password</FormLabel>
                      <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-muted/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          I agree to Mavazi Market's{' '}
                          <Button variant="link" asChild className="p-0 h-auto text-xs text-accent hover:underline"><Link href="/terms-of-service">Terms of Service</Link></Button>
                          {' '}and{' '}
                          <Button variant="link" asChild className="p-0 h-auto text-xs text-accent hover:underline"><Link href="/privacy-policy">Privacy Policy</Link></Button>.
                        </FormLabel>
                         <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center text-sm">
             <p className="text-muted-foreground">
              Already have an account?{' '}
              <Button variant="link" asChild className="p-0 h-auto text-accent hover:underline">
                <Link href="/login">Sign in here</Link>
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
