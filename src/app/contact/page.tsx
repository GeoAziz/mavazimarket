"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  message: z.string().min(10, "Message must be at least 10 characters.").max(500, "Message too long."),
});
type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactUsPage() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  function onSubmit(data: ContactFormValues) {
    console.log("Contact form submission:", data);
    alert("Message sent! We'll get back to you soon. (Mock)");
    form.reset();
  }

  return (
    <div className="space-y-10">
      <Breadcrumbs items={[{ label: 'Contact Us' }]} />
      
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">
          Get In Touch
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          We'd love to hear from you! Whether you have a question about our products, your order, or just want to say hello, feel free to reach out.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* Contact Information */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-primary">Contact Information</CardTitle>
            <CardDescription>Reach us through any of the following channels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start">
              <MapPin size={24} className="text-accent mr-4 mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Our Office</h4>
                <p className="text-muted-foreground text-sm">123 Mavazi Towers, Biashara Street, Nairobi, Kenya</p>
              </div>
            </div>
            <div className="flex items-start">
              <Mail size={24} className="text-accent mr-4 mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Email Us</h4>
                <a href="mailto:support@mavazimarket.co.ke" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  support@mavazimarket.co.ke
                </a>
              </div>
            </div>
            <div className="flex items-start">
              <Phone size={24} className="text-accent mr-4 mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Call Us</h4>
                <a href="tel:+254700123456" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  +254 700 123 456
                </a>
                <p className="text-xs text-muted-foreground">(Mon - Fri, 9 AM - 5 PM EAT)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-primary">Send Us a Message</CardTitle>
            <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl><Input placeholder="e.g. Question about an order" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl><Textarea placeholder="Your message..." rows={5} {...field} className="resize-none" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Sending..." : <><Send size={16} className="mr-2"/> Send Message</>}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
       {/* Map Placeholder - Optional */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-6 text-primary">Find Us Here</h2>
        <div className="aspect-video bg-muted rounded-xl shadow-md flex items-center justify-center text-muted-foreground">
          {/* Replace with an actual map embed if needed */}
          <MapPin size={64} />
          <p className="ml-4">Map showing our office location in Nairobi (Placeholder)</p>
        </div>
      </section>
    </div>
  );
}
