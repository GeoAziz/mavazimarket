
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Mail, KeyRound, User as UserIcon, Loader2, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { handleUserSignupCompletion } from "./actions";
import { motion } from "framer-motion";

const signupFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(6, "Password confirmation is required."),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms.",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], 
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", agreeToTerms: false },
  });

  async function onSubmit(data: SignupFormValues) {
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await updateProfile(user, { 
        displayName: data.fullName 
      });

      const signupResult = await handleUserSignupCompletion(user.uid, {
        fullName: data.fullName,
        email: data.email,
      });

      if (signupResult.success) {
        toast({
          title: "Karibu! Welcome",
          description: "Your Mavazi Market account is ready.",
        });
        router.push('/login');
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      let errorMessage = "Failed to create account. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered.";
      }
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12">
       <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
       >
        <Breadcrumbs items={[{ label: 'Sign Up' }]} className="mb-8 justify-center" />
        
        <Card className="shadow-2xl border-none overflow-hidden rounded-2xl">
          <CardHeader className="text-center bg-primary text-white pt-10 pb-8 relative">
            <Sparkles size={24} className="absolute top-6 right-6 text-accent animate-pulse" />
            <div className="mx-auto bg-white/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <UserPlus size={40} className="text-white" />
            </div>
            <CardTitle className="text-4xl font-heading mb-2">Create Account</CardTitle>
            <CardDescription className="text-white/70 tracking-widest uppercase text-[10px] font-bold">
              Join our heritage-inspired community
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                 <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest font-bold text-secondary/50">Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                          <Input placeholder="e.g. Amina Wanjiru" {...field} className="pl-12" disabled={isSubmitting} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest font-bold text-secondary/50">Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                          <Input type="email" placeholder="you@example.com" {...field} className="pl-12" disabled={isSubmitting} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest font-bold text-secondary/50">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                          <Input type="password" placeholder="••••••••" {...field} className="pl-12" disabled={isSubmitting} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest font-bold text-secondary/50">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                          <Input type="password" placeholder="••••••••" {...field} className="pl-12" disabled={isSubmitting} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider cursor-pointer">
                          I agree to the <Link href="/terms" className="text-primary hover:underline">Terms</Link> & <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                        </FormLabel>
                         <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-[52px] bg-secondary text-white font-bold tracking-widest text-base shadow-lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : "CREATE ACCOUNT"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center pb-10 pt-0">
             <p className="text-xs text-muted-foreground font-medium">
              Already a member?
            </p>
            <Button variant="link" asChild className="mt-1 font-bold text-primary tracking-widest text-[10px]">
              <Link href="/login">SIGN IN HERE</Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
