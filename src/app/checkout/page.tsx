
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
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CreditCard, ShoppingBag, AlertTriangle, Loader2, CheckCircle2, Phone, Smartphone, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { placeOrderAction } from "./actions";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { formatKSh } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const MPesaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 mr-3 text-green-600">
    <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M12 6v12M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const checkoutFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(10, "Invalid phone number.").regex(/^(\+?254|0)?[71]\d{8}$/, "Invalid Kenyan phone number."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  city: z.string().min(2, "City must be at least 2 characters."),
  postalCode: z.string().optional(),
  paymentMethod: z.enum(["mpesa", "card", "paypal"], {
    required_error: "Please select a payment method.",
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { currentUser, appUser } = useAuth();
  const { cartItems, totalAmount, clearCart, isCartLoaded } = useCart();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSTKPushActive, setIsSTKPushActive] = useState(false);
  const [stkPushTimer, setStkPushTimer] = useState(30);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: "", email: "", phone: "", address: "", city: "", postalCode: "", paymentMethod: "mpesa",
    },
  });

  useEffect(() => {
    if (appUser) {
      form.reset({
        fullName: appUser.name || "",
        email: appUser.email || "",
        phone: appUser.phone || "",
        address: appUser.shippingAddress?.street || "",
        city: appUser.shippingAddress?.city || "",
        postalCode: appUser.shippingAddress?.postalCode || "",
        paymentMethod: "mpesa",
      });
    }
  }, [appUser, form]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSTKPushActive && stkPushTimer > 0) {
      timer = setTimeout(() => setStkPushTimer(stkPushTimer - 1), 1000);
    } else if (isSTKPushActive && stkPushTimer === 0) {
      // Simulate successful payment after timeout for demo
      handlePaymentSuccess();
    }
    return () => clearTimeout(timer);
  }, [isSTKPushActive, stkPushTimer]);

  const handlePaymentSuccess = async () => {
    setIsSTKPushActive(false);
    toast({ title: "Payment Received", description: "Your heritage choice has been confirmed." });
    await clearCart();
    router.push(`/profile`);
  };

  const subtotal = totalAmount;
  const taxes = subtotal * 0.16;
  const shipping = subtotal > 3000 ? 0 : 250;
  const grandTotal = subtotal + taxes + shipping;

  async function onSubmit(data: CheckoutFormValues) {
    if (data.paymentMethod === 'mpesa') {
      setIsSTKPushActive(true);
      setStkPushTimer(30);
      // In real app, call Daraja STK Push here
    } else {
      setIsSubmitting(true);
      const result = await placeOrderAction({
        userId: currentUser?.uid || null,
        formData: data,
        cartItems,
        totalAmount: grandTotal,
      });
      
      if (result.success) {
        toast({ title: "Order Confirmed!", description: "Check your email for details." });
        await clearCart();
        router.push(`/profile`);
      } else {
        toast({ title: "Checkout Error", description: result.error, variant: "destructive" });
      }
      setIsSubmitting(false);
    }
  }

  if (isCartLoaded && cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShoppingBag size={64} className="text-primary/20 mb-6" />
        <h1 className="text-4xl font-heading text-secondary mb-4">Your Bag is Empty</h1>
        <p className="text-muted-foreground mb-8">Ready to add some heritage to your style?</p>
        <Button size="lg" asChild className="rounded-full px-12 h-[52px] bg-primary text-white"><Link href="/">SHOP COLLECTIONS</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24 relative">
      <AnimatePresence>
        {isSTKPushActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-secondary/95 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <Card className="max-w-md w-full border-none shadow-2xl overflow-hidden rounded-3xl">
              <CardHeader className="bg-primary text-white text-center py-10">
                <Smartphone size={48} className="mx-auto mb-4 animate-bounce" />
                <CardTitle className="text-3xl font-heading">Confirm on Phone</CardTitle>
                <p className="text-white/70 text-sm uppercase tracking-widest font-bold mt-2">M-Pesa STK Push Sent</p>
              </CardHeader>
              <CardContent className="p-8 text-center space-y-6">
                <p className="text-secondary font-medium leading-relaxed">
                  We've sent a payment prompt to <span className="text-primary font-bold">{form.getValues('phone')}</span>. 
                  Please enter your M-Pesa PIN to complete the purchase.
                </p>
                <div className="relative h-2 w-full bg-secondary/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 30, ease: "linear" }}
                    className="absolute inset-0 bg-primary"
                  />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-tighter">Waiting for confirmation... {stkPushTimer}s</p>
              </CardContent>
              <CardFooter className="p-8 pt-0 flex flex-col gap-3">
                <Button variant="outline" className="w-full h-12 border-primary text-primary" onClick={() => setIsSTKPushActive(false)}>
                  CANCEL PAYMENT
                </Button>
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-green-600" /> Secure Daraja Connection
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Breadcrumbs items={[{ label: 'Bag', href: '/cart' }, { label: 'Secure Checkout' }]} />
      
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-heading text-secondary mb-4">Checkout</h1>
        <div className="h-1 w-24 bg-primary mx-auto rounded-full mb-6"></div>
        <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold">Secure Global Heritage Logistics</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Logistics & Payment */}
          <div className="lg:col-span-7 space-y-8">
            <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-secondary text-background p-8">
                <CardTitle className="text-2xl font-heading flex items-center">
                  <CheckCircle2 className="mr-3 text-primary" size={24} /> 1. Logistics Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] uppercase tracking-widest font-bold text-secondary/50">Full Name</FormLabel>
                    <FormControl><Input placeholder="Juma Otieno" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] uppercase tracking-widest font-bold text-secondary/50">Email</FormLabel>
                    <FormControl><Input type="email" placeholder="juma@example.com" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] uppercase tracking-widest font-bold text-secondary/50">Phone (M-Pesa / Delivery)</FormLabel>
                  <FormControl><Input placeholder="+254 7XX XXX XXX" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] uppercase tracking-widest font-bold text-secondary/50">Delivery Address</FormLabel>
                  <FormControl><Input placeholder="Lunga Lunga Rd, Unit 12" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] uppercase tracking-widest font-bold text-secondary/50">City/Town</FormLabel>
                    <FormControl><Input placeholder="Nairobi" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="postalCode" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] uppercase tracking-widest font-bold text-secondary/50">Code (Optional)</FormLabel>
                    <FormControl><Input placeholder="00100" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-secondary text-background p-8">
                <CardTitle className="text-2xl font-heading flex items-center">
                  <CheckCircle2 className="mr-3 text-primary" size={24} /> 2. Settlement Method
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid md:grid-cols-3 gap-4" disabled={isSubmitting}>
                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border-2 rounded-xl has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all cursor-pointer">
                          <FormControl><RadioGroupItem value="mpesa" /></FormControl>
                          <FormLabel className="font-bold tracking-widest text-[10px] uppercase cursor-pointer flex-1 flex items-center"><MPesaIcon /> M-PESA</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border-2 rounded-xl has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all cursor-pointer">
                          <FormControl><RadioGroupItem value="card" /></FormControl>
                          <FormLabel className="font-bold tracking-widest text-[10px] uppercase cursor-pointer flex-1 flex items-center"><CreditCard className="mr-3 text-blue-600" /> CARD</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border-2 rounded-xl has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all cursor-pointer">
                          <FormControl><RadioGroupItem value="paypal" /></FormControl>
                          <FormLabel className="font-bold tracking-widest text-[10px] uppercase cursor-pointer flex-1">PAYPAL</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>)} />
              </CardContent>
            </Card>
          </div>

          {/* Bag Summary */}
          <div className="lg:col-span-5">
            <Card className="border-none shadow-2xl rounded-2xl overflow-hidden sticky top-24">
              <CardHeader className="bg-primary text-white p-8">
                <CardTitle className="text-2xl font-heading flex items-center justify-between">
                  Bag Summary <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-sans">{cartItems.length}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <ul className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map(item => (
                    <li key={item.id} className="flex justify-between items-center group">
                      <div className="flex items-center">
                        <div className="relative h-16 w-12 rounded-md overflow-hidden bg-secondary/10 mr-4">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-heading text-sm text-secondary leading-tight">{item.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Qty: {item.quantity} • {item.size || 'OS'}</p>
                        </div>
                      </div>
                      <span className="font-bold text-secondary text-sm">{formatKSh(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <Separator className="bg-primary/10" />
                <div className="space-y-3 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/60">
                  <div className="flex justify-between"><span>Subtotal</span><span className="text-secondary">{formatKSh(subtotal)}</span></div>
                  <div className="flex justify-between"><span>Logistics</span><span className="text-secondary">{shipping === 0 ? 'FREE' : formatKSh(shipping)}</span></div>
                  <div className="flex justify-between"><span>Tax (16%)</span><span className="text-secondary">{formatKSh(taxes)}</span></div>
                </div>
                <Separator className="bg-primary/10 h-px" />
                <div className="flex justify-between items-center py-4">
                  <span className="font-heading text-xl text-secondary">Total Bag</span>
                  <span className="font-heading text-3xl text-primary font-bold">{formatKSh(grandTotal)}</span>
                </div>
                <Button type="submit" size="lg" className="w-full h-[60px] bg-secondary text-white font-bold tracking-[0.2em] text-lg rounded-xl shadow-xl shadow-secondary/20 transition-transform active:scale-[0.98]" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "COMPLETE PURCHASE"}
                </Button>
                <div className="flex items-center justify-center space-x-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-4">
                  <AlertTriangle size={14} className="text-accent" />
                  <span>Global Secure Encryption Enabled</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
