
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
import { LogIn as LoginIcon, KeyRound, Mail, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";

const loginFormSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});
type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      toast({
        title: "Welcome Back",
        description: "Successfully signed in to Mavazi Market.",
      });

      const adminEmail = "admin@mixostore.com";
      if (user.email === adminEmail) {
        router.push('/admin');
      } else {
        router.push('/profile');
      }
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Failed to log in. Please check your credentials.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password.";
      }
      toast({
        title: "Sign In Failed",
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
        <Breadcrumbs items={[{ label: 'Login' }]} className="mb-8 justify-center" />
        
        <Card className="shadow-2xl border-none overflow-hidden rounded-2xl">
          <CardHeader className="text-center bg-secondary text-background pt-10 pb-8 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
            <div className="mx-auto bg-primary/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <ShieldCheck size={40} className="text-primary" />
            </div>
            <CardTitle className="text-4xl font-heading mb-2">Welcome Back</CardTitle>
            <CardDescription className="text-background/60 tracking-widest uppercase text-[10px] font-bold">
              Sign in to your heritage account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest font-bold text-secondary/50">Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                          <Input placeholder="you@example.com" {...field} className="pl-12" disabled={isSubmitting} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel className="text-xs uppercase tracking-widest font-bold text-secondary/50">Password</FormLabel>
                        <Link href="/forgot-password" size="sm" className="text-[10px] uppercase font-bold text-primary hover:text-accent transition-colors">
                          Forgot Password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                          <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} className="pl-12 pr-12" disabled={isSubmitting} />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-[52px] bg-primary text-white font-bold tracking-widest text-base shadow-lg shadow-primary/20" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : "SIGN IN"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center pb-10 pt-0">
            <p className="text-xs text-muted-foreground font-medium">
              Don't have an account yet?
            </p>
            <Button variant="link" asChild className="mt-1 font-bold text-primary tracking-widest text-[10px]">
              <Link href="/signup">JOIN THE COMMUNITY</Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
