
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// Label import was already removed as unused
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { mockCartItems, mockUser } from '@/lib/mock-data';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ShoppingBag, AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// M-Pesa icon (simple SVG)
const MPesaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 mr-2 text-green-600">
    <path d="M12 .5C5.649.5.5 5.649.5 12S5.649 23.5 12 23.5 23.5 18.351 23.5 12 18.351.5 12 .5zm0 21.5C6.757 22 2 17.243 2 12S6.757 2 12 2s10 4.757 10 10-4.757 10-10 10z"/>
    <path d="M12.04 5.96c-2.97 0-5.38 2.41-5.38 5.38s2.41 5.38 5.38 5.38 5.38-2.41 5.38-5.38-2.41-5.38-5.38-5.38zm0 9.26c-2.14 0-3.88-1.74-3.88-3.88s1.74-3.88 3.88-3.88 3.88 1.74 3.88 3.88-1.74 3.88-3.88 3.88z"/>
    <path d="M13.86 10.38l-1.62 3.4h-.4l-1.63-3.4h.5l1.38 2.93 1.37-2.93z"/>
  </svg>
);


const checkoutFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(10, "Phone number must be at least 10 digits.").regex(/^(\+?254|0)?[71]\d{8}$/, "Invalid Kenyan phone number."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  city: z.string().min(2, "City must be at least 2 characters."),
  postalCode: z.string().optional(),
  paymentMethod: z.enum(["mpesa", "card", "paypal"], {
    required_error: "You need to select a payment method.",
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: mockUser.name || "",
      email: mockUser.email || "",
      phone: "", 
      address: mockUser.shippingAddress?.street || "",
      city: mockUser.shippingAddress?.city || "",
      postalCode: mockUser.shippingAddress?.postalCode || "",
      paymentMethod: "mpesa",
    },
  });

  async function onSubmit(data: CheckoutFormValues) {
    setIsSubmitting(true);
    console.log("Checkout data:", data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    
    toast({
      title: "Order Placed Successfully!",
      description: `Payment Method: ${data.paymentMethod}. We'll process your order shortly.`,
      variant: "default",
    });
    // form.reset(); // Optionally reset form or redirect
    setIsSubmitting(false);
    // router.push('/order-confirmation'); // Example redirect
  }

  const subtotal = mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxes = subtotal * 0.16;
  const shippingFee = subtotal > 3000 ? 0 : 250;
  const total = subtotal + taxes + shippingFee;

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Shopping Cart', href: '/cart' }, { label: 'Checkout' }]} />
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Checkout</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Customer Information & Payment */}
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-primary">Shipping & Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-xl font-medium mb-4 text-foreground">Customer Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Juma Otieno" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Phone Number (M-Pesa)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. +254712345678" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-medium mb-4 text-foreground">Shipping Address</h3>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Lunga Lunga Rd, House No. 10" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City/Town</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Nairobi" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 00100" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <Separator />

              <section>
                <h3 className="text-xl font-medium mb-4 text-foreground">Payment Method</h3>
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                          disabled={isSubmitting}
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md has-[:checked]:bg-accent/10 has-[:checked]:border-accent transition-all">
                            <FormControl>
                              <RadioGroupItem value="mpesa" disabled={isSubmitting} />
                            </FormControl>
                            <MPesaIcon />
                            <FormLabel className="font-medium cursor-pointer flex-1">M-Pesa</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md has-[:checked]:bg-accent/10 has-[:checked]:border-accent transition-all">
                            <FormControl>
                              <RadioGroupItem value="card" disabled={isSubmitting} />
                            </FormControl>
                            <CreditCard className="h-5 w-5 mr-2 text-blue-600"/>
                            <FormLabel className="font-medium cursor-pointer flex-1">Credit/Debit Card</FormLabel>
                          </FormItem>
                           <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md has-[:checked]:bg-accent/10 has-[:checked]:border-accent transition-all">
                            <FormControl>
                              <RadioGroupItem value="paypal" disabled={isSubmitting} />
                            </FormControl>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-700" viewBox="0 0 24 24" fill="currentColor"><path d="M8.332 21.084c.24.027.507.04.708.04.14 0 .28-.007.42-.02a.75.75 0 00.6-.874l-.663-4.047c-.068-.415.147-.818.54-.986l.002-.002c2.728-1.163 4.213-3.95 3.927-7.217-.21-2.396-1.898-4.295-4.188-4.828C7.765 3.813 6.29 4.092 5.05 5.16c-1.24 1.068-1.854 2.635-1.707 4.31.183 2.086 1.43 3.785 3.29 4.539l.112.045c.45.18.65.69.456 1.129l-.654 1.436c-.27.596.077 1.3.696 1.535l.003.001c.11.042.223.077.335.105l.001.001zm6.27-15.194c2.014.476 3.488 2.112 3.676 4.19.257 2.87-1.05 5.336-3.494 6.386l-.003.001c-.34.146-.74.013-.943-.317l.003.004-.74-1.623a.75.75 0 00-1.106-.393c-1.653.79-3.244.165-3.987-1.39-.742-1.553-.39-3.355.822-4.452 1.212-1.097 2.768-1.405 4.245-1.074.06.013.12.03.178.05l.003.001c.2.067.413.03.58-.093l.002-.002.956-.714a.75.75 0 00.01-.953z"/></svg>
                            <FormLabel className="font-medium cursor-pointer flex-1">PayPal</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("paymentMethod") === "card" && (
                  <Alert variant="default" className="mt-4 bg-blue-50 border-blue-200 text-blue-700">
                    <CreditCard className="h-4 w-4 !text-blue-700" /> 
                    <AlertDescription>
                      Card payment details will be collected on the next step via a secure Stripe/Payment Gateway page.
                    </AlertDescription>
                  </Alert>
                )}
                 {form.watch("paymentMethod") === "mpesa" && (
                  <Alert variant="default" className="mt-4 bg-green-50 border-green-200 text-green-700">
                     <MPesaIcon />
                    <AlertDescription>
                      You will receive an M-Pesa STK push on your phone to complete the payment. Ensure your phone is nearby.
                    </AlertDescription>
                  </Alert>
                )}
              </section>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="lg:col-span-1 sticky top-24 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-primary flex items-center">
                <ShoppingBag size={28} className="mr-2"/> Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {mockCartItems.map(item => (
                  <li key={item.id} className="flex justify-between items-start text-sm">
                    <div className="flex items-start">
                      <Image src={item.image} alt={item.name} width={48} height={64} className="rounded mr-3 object-cover" data-ai-hint="product clothing"/>
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity} {item.size ? `| Size: ${item.size}`: ''}</p>
                      </div>
                    </div>
                    <span className="font-medium text-foreground">KSh {(item.price * item.quantity).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">KSh {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes (16%)</span>
                  <span className="font-medium text-foreground">KSh {taxes.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-foreground">{shippingFee === 0 ? 'Free' : `KSh ${shippingFee.toLocaleString()}`}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-primary">Total</span>
                <span className="text-primary">KSh {total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </CardContent>
            <div className="p-6 pt-0">
               <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </Button>
              <Alert variant="destructive" className="mt-4 text-xs">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  By placing your order, you agree to our <a href="/terms-of-service" className="underline hover:text-destructive-foreground/80">Terms of Service</a> and <a href="/privacy-policy" className="underline hover:text-destructive-foreground/80">Privacy Policy</a>.
                </AlertDescription>
              </Alert>
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
}
