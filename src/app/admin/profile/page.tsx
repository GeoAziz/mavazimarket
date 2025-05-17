
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { UserCircle, Edit3, KeyRound, Mail, Save } from 'lucide-react';
import { mockUser } from '@/lib/mock-data'; // Using mockUser for placeholder

const adminProfileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
});
type AdminProfileFormValues = z.infer<typeof adminProfileFormSchema>;

const adminPasswordFormSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters."),
  newPassword: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(6, "Password confirmation is required."),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});
type AdminPasswordFormValues = z.infer<typeof adminPasswordFormSchema>;


export default function AdminProfilePage() {
  // Mock admin user data
  const adminUser = {
    name: "Admin User",
    email: "admin@mavazimarket.co.ke",
    profilePictureUrl: mockUser.profilePictureUrl, // Reuse for placeholder
    dataAiHint: "admin avatar"
  };

  const profileForm = useForm<AdminProfileFormValues>({
    resolver: zodResolver(adminProfileFormSchema),
    defaultValues: { name: adminUser.name, email: adminUser.email },
  });

  const passwordForm = useForm<AdminPasswordFormValues>({
    resolver: zodResolver(adminPasswordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  function onProfileSubmit(data: AdminProfileFormValues) {
    console.log("Admin profile update:", data);
    alert("Admin profile updated (Mock)");
  }

  function onPasswordSubmit(data: AdminPasswordFormValues) {
    console.log("Admin password change:", data);
    alert("Admin password changed (Mock)");
    passwordForm.reset();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary flex items-center">
        <UserCircle size={30} className="mr-3 text-accent" /> Admin Profile
      </h1>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        {/* Profile Card */}
        <Card className="md:col-span-1 shadow-lg">
          <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-3 border-2 border-primary">
              <AvatarImage src={adminUser.profilePictureUrl} alt={adminUser.name} data-ai-hint={adminUser.dataAiHint} />
              <AvatarFallback className="text-3xl bg-muted">{adminUser.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">{adminUser.name}</CardTitle>
            <CardDescription>{adminUser.email}</CardDescription>
            <Button variant="outline" size="sm" className="mt-2">
              <Edit3 size={14} className="mr-2" /> Change Picture
            </Button>
          </CardHeader>
        </Card>

        {/* Edit Profile and Password Forms */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><Mail size={18} className="mr-2 text-primary/80"/>Edit Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField control={profileForm.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={profileForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                     <Save size={16} className="mr-2" /> Save Profile
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><KeyRound size={18} className="mr-2 text-primary/80"/>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                     <Save size={16} className="mr-2" /> Update Password
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
