
"use client";

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowLeft, UserCircle, MapPin, ShoppingBag, Edit3, Loader2, ShieldCheck, UserCog, Ban, CheckCircle } from 'lucide-react';
import type { User, Order, Address } from '@/lib/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateCustomerRoleAction, toggleCustomerStatusAction } from './actions';

const customerInfoFormSchema = z.object({
  name: z.string().min(2, "Name is too short.").default(""),
  phone: z.string().optional().default(""),
  street: z.string().optional().default(""),
  city: z.string().optional().default(""),
  postalCode: z.string().optional().default(""),
  country: z.string().optional().default("Kenya"),
});
type CustomerInfoFormValues = z.infer<typeof customerInfoFormSchema>;

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const customerId = params.customerId as string;
  const { toast } = useToast();
  const router = useRouter();

  const [customer, setCustomer] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [isAdminActionLoading, setIsAdminActionLoading] = useState(false);

  const form = useForm<CustomerInfoFormValues>({
    resolver: zodResolver(customerInfoFormSchema),
    defaultValues: { name: "", phone: "", street: "", city: "", postalCode: "", country: "Kenya" },
  });

  useEffect(() => {
    if (!customerId) return;

    const fetchCustomerData = async () => {
      setLoading(true);
      try {
        const customerDocRef = doc(db!, "users", customerId);
        const customerSnap = await getDoc(customerDocRef);
        if (customerSnap.exists()) {
          const customerData = { id: customerSnap.id, ...customerSnap.data() } as User;
          setCustomer(customerData);
          form.reset({
            name: customerData.name || "",
            phone: customerData.shippingAddress?.phone || customerData.phone || "",
            street: customerData.shippingAddress?.street || "",
            city: customerData.shippingAddress?.city || "",
            postalCode: customerData.shippingAddress?.postalCode || "",
            country: customerData.shippingAddress?.country || "Kenya",
          });
        } else {
          toast({ title: "Error", description: "Customer not found.", variant: "destructive" });
          router.push("/admin/customers");
        }

        const ordersQuery = query(collection(db!, "orders"), where("userId", "==", customerId), orderBy("orderDate", "desc"));
        const ordersSnapshot = await getDocs(ordersQuery);
        const fetchedOrders = ordersSnapshot.docs.map(d => {
            const data = d.data();
            return {
                ...data,
                id: d.id,
                orderDate: data.orderDate?.toDate ? data.orderDate.toDate().toISOString() : new Date(data.orderDate).toISOString(),
            } as Order;
        });
        setOrders(fetchedOrders);

      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
      setLoading(false);
    };

    fetchCustomerData();
  }, [customerId, toast, router, form]);

  const handleInfoSubmit = async (data: CustomerInfoFormValues) => {
    if (!customer) return;
    setIsSubmittingInfo(true);
    try {
      const userDocRef = doc(db!, "users", customer.id);
      const updatedData: Partial<User> = {
        name: data.name,
        phone: data.phone,
        shippingAddress: {
          street: data.street || '',
          city: data.city || '',
          postalCode: data.postalCode || '',
          country: data.country || 'Kenya',
          phone: data.phone
        }
      };
      await updateDoc(userDocRef, updatedData);
      setCustomer(prev => prev ? { ...prev, ...updatedData, shippingAddress: updatedData.shippingAddress as Address } : null);
      toast({ title: "Success", description: "Customer information updated." });
      setIsEditingInfo(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    }
    setIsSubmittingInfo(false);
  };
  
  const handleRoleChange = async (newRole: 'user' | 'admin') => {
    if (!customer) return;
    setIsAdminActionLoading(true);
    const result = await updateCustomerRoleAction(customer.id, newRole);
    if (result.success) {
      setCustomer(prev => prev ? { ...prev, role: newRole } : null);
      toast({ title: "Role Updated", description: `${customer.name} is now a platform ${newRole}.` });
    } else {
      toast({ title: "Action Failed", description: result.error, variant: "destructive" });
    }
    setIsAdminActionLoading(false);
  };

  const handleAccountStatusToggle = async () => {
    if (!customer) return;
    setIsAdminActionLoading(true);
    const result = await toggleCustomerStatusAction(customer.id, !!customer.disabled);
    if (result.success) {
      setCustomer(prev => prev ? { ...prev, disabled: result.newStatus } : null);
      toast({ 
        title: result.newStatus ? "Account Disabled" : "Account Enabled", 
        description: `Security status updated for ${customer.name}.` 
      });
    } else {
      toast({ title: "Action Failed", description: result.error, variant: "destructive" });
    }
    setIsAdminActionLoading(false);
  };

  if (loading) {
    return (
         <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-2/5" />
                <Skeleton className="h-10 w-36" />
            </div>
            <div className="grid md:grid-cols-3 gap-6 items-start">
                <Card className="md:col-span-1 shadow-lg"><CardHeader className="items-center text-center"><Skeleton className="h-24 w-24 rounded-full mb-3" /><Skeleton className="h-6 w-3/4 mb-1" /><Skeleton className="h-4 w-full mb-3" /></CardHeader><Separator /><CardContent className="pt-4 space-y-2"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-full" /></CardContent></Card>
                <div className="md:col-span-2 space-y-6"><Card><CardHeader><Skeleton className="h-5 w-1/3" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card></div>
            </div>
        </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading text-secondary">Customer Hub</h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-primary">ID: {customer.id}</p>
        </div>
        <Button asChild variant="outline" className="border-secondary">
          <Link href="/admin/customers">
            <ArrowLeft className="mr-2 h-4 w-4" /> BACK TO COMMUNITY
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <Card className="shadow-2xl border-none rounded-2xl overflow-hidden">
          <CardHeader className="items-center text-center p-8 bg-secondary/5">
            <div className="relative mb-4">
              <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-xl">
                <AvatarImage src={customer.profilePictureUrl || customer.photoURL || `https://placehold.co/128x128.png?text=${customer.name?.charAt(0)}`} alt={customer.name} />
                <AvatarFallback className="text-4xl bg-muted">{customer.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              {customer.role === 'admin' && (
                <div className="absolute -top-2 -right-2 bg-primary text-white p-2 rounded-full shadow-lg">
                  <ShieldCheck size={20} />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-heading text-secondary">{customer.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
            <div className="mt-6 flex flex-col w-full gap-3">
                <Button className="w-full bg-primary text-white font-bold tracking-widest h-12" onClick={() => setIsEditingInfo(prev => !prev)}>
                    <Edit3 size={16} className="mr-2" /> {isEditingInfo ? "CANCEL REFINEMENT" : "REFINE PROFILE"}
                </Button>
            </div>
          </CardHeader>
          <Separator className="bg-primary/5" />
          <CardContent className="p-8 space-y-4">
             <div className="flex items-center justify-between text-xs uppercase font-bold tracking-widest text-secondary/60">
                <span>PLATFORM ROLE</span>
                <Badge variant={customer.role === 'admin' ? "default" : "secondary"} className="rounded-sm">
                  {customer.role || 'user'}
                </Badge>
            </div>
             <div className="flex items-center justify-between text-xs uppercase font-bold tracking-widest text-secondary/60">
                <span>LOGISTICS STATUS</span>
                <Badge className={customer.disabled ? "bg-destructive text-white" : "bg-green-600 text-white"}>
                  {customer.disabled ? 'DISABLED' : 'ACTIVE'}
                </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground pt-4 text-center">MEMBER SINCE: {customer.createdAt ? (typeof customer.createdAt === 'string' ? new Date(customer.createdAt) : (customer.createdAt as any).toDate()).toLocaleDateString() : 'N/A'}</p>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          {isEditingInfo && (
            <Card className="shadow-2xl border-none rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4">
              <CardHeader className="bg-secondary text-background p-8">
                <CardTitle className="text-xl font-heading">Refine Personal Data</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleInfoSubmit)} className="space-y-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel className="text-[10px] uppercase font-bold tracking-widest">Full Name</FormLabel><FormControl><Input {...field} disabled={isSubmittingInfo} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] uppercase font-bold tracking-widest">Phone</FormLabel><FormControl><Input {...field} disabled={isSubmittingInfo} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] uppercase font-bold tracking-widest">City</FormLabel><FormControl><Input {...field} disabled={isSubmittingInfo} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="street" render={({ field }) => (
                      <FormItem><FormLabel className="text-[10px] uppercase font-bold tracking-widest">Street Address</FormLabel><FormControl><Input {...field} disabled={isSubmittingInfo} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" disabled={isSubmittingInfo} className="h-12 px-8 bg-primary text-white font-bold tracking-widest">
                      {isSubmittingInfo ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "SYNC PROFILE"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
          
          <Card className="shadow-2xl border-none rounded-2xl overflow-hidden bg-card">
            <CardHeader className="bg-primary text-white p-8">
                <CardTitle className="text-xl font-heading flex items-center"><ShieldCheck size={24} className="mr-3 text-accent"/>Command Center Actions</CardTitle>
                <CardDescription className="text-white/70 tracking-widest uppercase text-[10px] font-bold">Secure Administrative Privileges</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Modify Heritage Access Level</Label>
                    <Select 
                        defaultValue={customer.role || 'user'}
                        onValueChange={(value) => handleRoleChange(value as 'user' | 'admin')}
                        disabled={isAdminActionLoading}
                    >
                        <SelectTrigger className="h-12 border-2 border-primary/10 focus:ring-primary rounded-xl">
                            <SelectValue placeholder="Select platform role..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="user">Standard Seeker (User)</SelectItem>
                            <SelectItem value="admin">Platform Curator (Admin)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="pt-4">
                  <Button 
                      variant={customer.disabled ? "outline" : "destructive"} 
                      onClick={handleAccountStatusToggle}
                      disabled={isAdminActionLoading}
                      className="w-full h-14 font-bold tracking-[0.2em] shadow-xl"
                  >
                      {isAdminActionLoading ? <Loader2 className="animate-spin mr-2" /> : customer.disabled ? <CheckCircle size={20} className="mr-2"/> : <Ban size={20} className="mr-2"/>}
                      {customer.disabled ? 'RECLAIM ACCOUNT (ENABLE)' : 'DECOMMISSION ACCOUNT (DISABLE)'}
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-tighter mt-4">
                    Note: These actions are synchronized with Firebase Auth & Firestore Identity Tunnels.
                  </p>
                </div>
            </CardContent>
          </Card>

          <Card className="shadow-2xl border-none rounded-2xl overflow-hidden">
            <CardHeader className="bg-secondary text-background p-8">
              <CardTitle className="text-xl font-heading flex items-center"><ShoppingBag size={24} className="mr-3 text-primary"/>Logistics History</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-2 border-primary/5 rounded-2xl bg-primary/5 gap-4">
                      <div>
                        <Link href={`/admin/orders/${order.id}`} className="font-heading text-lg text-secondary hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">Order #{order.id.substring(0,8)}</Link>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">{new Date(order.orderDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto">
                        <p className="font-heading text-primary font-bold text-xl">KSh {order.totalAmount.toLocaleString()}</p>
                        <Badge variant="outline" className={`text-[10px] font-bold mt-2 uppercase tracking-widest ${
                            order.status === 'Delivered' ? 'border-green-200 text-green-600 bg-green-50' :
                            'border-primary/20 text-primary bg-primary/5'
                        }`}>{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center opacity-20 flex flex-col items-center">
                  <ShoppingBag size={48} className="mb-4" />
                  <p className="font-heading text-xl">No heritage logistics found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
