
"use client";

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserCircle, MapPin, Mail, Phone, ShoppingBag, Edit3, MessageSquare, Loader2, Save, ShieldCheck, UserCog, Ban, CheckCircle } from 'lucide-react';
import type { User, Order, Address } from '@/lib/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const customerInfoFormSchema = z.object({
  name: z.string().min(2, "Name is too short.").default(""),
  phone: z.string().optional().default(""),
  // Address fields can be added here if making the whole address editable via this form
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

  const form = useForm<CustomerInfoFormValues>({
    resolver: zodResolver(customerInfoFormSchema),
    defaultValues: { name: "", phone: "", street: "", city: "", postalCode: "", country: "Kenya" },
  });

  useEffect(() => {
    if (!customerId) return;

    const fetchCustomerData = async () => {
      setLoading(true);
      try {
        const customerDocRef = doc(db, "users", customerId);
        const customerSnap = await getDoc(customerDocRef);
        if (customerSnap.exists()) {
          const customerData = { id: customerSnap.id, ...customerSnap.data() } as User;
          setCustomer(customerData);
          form.reset({
            name: customerData.name || "",
            phone: customerData.shippingAddress?.phone || customerData.phone || "", // Prefer shippingAddress.phone, fallback to user.phone
            street: customerData.shippingAddress?.street || "",
            city: customerData.shippingAddress?.city || "",
            postalCode: customerData.shippingAddress?.postalCode || "",
            country: customerData.shippingAddress?.country || "Kenya",
          });
        } else {
          toast({ title: "Error", description: "Customer not found.", variant: "destructive" });
          router.push("/admin/customers");
        }

        const ordersQuery = query(collection(db, "orders"), where("userId", "==", customerId), orderBy("orderDate", "desc"));
        const ordersSnapshot = await getDocs(ordersQuery);
        const fetchedOrders = ordersSnapshot.docs.map(d => {
            const data = d.data();
            return {
                ...data,
                id: d.id,
                orderDate: (data.orderDate.toDate ? data.orderDate.toDate() : new Date(data.orderDate)).toISOString(),
            } as Order;
        });
        setOrders(fetchedOrders);

      } catch (error) {
        console.error("Error fetching customer data:", error);
        toast({ title: "Error", description: "Could not fetch customer data.", variant: "destructive" });
      }
      setLoading(false);
    };

    fetchCustomerData();
  }, [customerId, toast, router, form]);

  const handleInfoSubmit = async (data: CustomerInfoFormValues) => {
    if (!customer) return;
    setIsSubmittingInfo(true);
    try {
      const userDocRef = doc(db, "users", customer.id);
      const updatedData: Partial<User> = {
        name: data.name,
        phone: data.phone, // Assuming a top-level phone field on User type for direct contact
        shippingAddress: {
          street: data.street || customer.shippingAddress?.street || "",
          city: data.city || customer.shippingAddress?.city || "",
          postalCode: data.postalCode || customer.shippingAddress?.postalCode || "",
          country: data.country || customer.shippingAddress?.country || "Kenya",
          // phone: data.phone // Or keep phone separate if it's primary contact
        }
      };
      await updateDoc(userDocRef, updatedData);
      setCustomer(prev => prev ? { ...prev, ...updatedData, shippingAddress: updatedData.shippingAddress as Address } : null);
      toast({ title: "Success", description: "Customer information updated." });
      setIsEditingInfo(false);
    } catch (error) {
      console.error("Error updating customer info:", error);
      toast({ title: "Error", description: "Failed to update customer information.", variant: "destructive" });
    }
    setIsSubmittingInfo(false);
  };
  
  // Mock actions for role/status - these would call Cloud Functions
  const handleRoleChange = (newRole: 'user' | 'admin') => {
    if (!customer) return;
    console.log(`ADMIN ACTION: Change role of ${customer.name} to ${newRole} (requires Cloud Function)`);
    toast({
      title: "Action Required (Mock)",
      description: `Would change role of ${customer.name} to ${newRole}. This needs a Cloud Function.`,
    });
    // Mock update client-side for UI feedback
    // setCustomer(prev => prev ? { ...prev, role: newRole } : null);
  };

  const handleAccountStatusToggle = () => {
    if (!customer) return;
    const newStatus = customer.disabled ? "Enable" : "Disable"; // Assuming 'disabled' field
    console.log(`ADMIN ACTION: ${newStatus} account for ${customer.name} (requires Cloud Function)`);
    toast({
      title: "Action Required (Mock)",
      description: `Would ${newStatus} account for ${customer.name}. This needs a Cloud Function.`,
    });
    // Mock update client-side for UI feedback
    // setCustomer(prev => prev ? { ...prev, disabled: !prev.disabled } : null);
  };


  if (loading) {
    return (
         <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-2/5" />
                <Skeleton className="h-10 w-36" />
            </div>
            <div className="grid md:grid-cols-3 gap-6 items-start">
                <Card className="md:col-span-1 shadow-lg"><CardHeader className="items-center text-center"><Skeleton className="h-24 w-24 rounded-full mb-3" /><Skeleton className="h-6 w-3/4 mb-1" /><Skeleton className="h-4 w-full mb-3" /><div className="mt-3 space-x-2"><Skeleton className="h-9 w-28 inline-block" /><Skeleton className="h-9 w-36 inline-block" /></div></CardHeader><Separator /><CardContent className="pt-4 space-y-2"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-full" /></CardContent></Card>
                <div className="md:col-span-2 space-y-6"><Card><CardHeader><Skeleton className="h-5 w-1/3" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card><Card><CardHeader><Skeleton className="h-5 w-1/2" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card></div>
            </div>
        </div>
    );
  }


  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <UserCircle size={48} className="text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Customer Not Found</h2>
        <p className="text-muted-foreground mb-4">The customer with ID "{customerId}" could not be found.</p>
        <Button asChild variant="outline">
          <Link href="/admin/customers">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-primary flex items-center">
          <UserCircle size={30} className="mr-3 text-accent" /> Customer Details
        </h1>
        <Button asChild variant="outline">
          <Link href="/admin/customers">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        <Card className="md:col-span-1 shadow-lg">
          <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-3 border-2 border-primary">
              <AvatarImage src={customer.profilePictureUrl || `https://placehold.co/100x100.png?text=${customer.name?.substring(0,1)}`} alt={customer.name} data-ai-hint={customer.dataAiHint || 'avatar person'}/>
              <AvatarFallback className="text-3xl bg-muted">{customer.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">{customer.name}</CardTitle>
            <CardDescription>{customer.email}</CardDescription>
            <div className="mt-3 space-x-2">
                <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setIsEditingInfo(prev => !prev)}>
                    <Edit3 size={14} className="mr-2" /> {isEditingInfo ? "Cancel Edit" : "Edit Info"}
                </Button>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 text-sm space-y-2">
             <div className="flex items-center capitalize">
                {customer.role === 'admin' ? <ShieldCheck size={16} className="mr-2 text-primary"/> : <UserCog size={16} className="mr-2 text-muted-foreground"/>}
                Role: <span className="font-medium ml-1">{customer.role || 'User'}</span>
            </div>
             <div className="flex items-center">
                {customer.disabled ? <Ban size={16} className="mr-2 text-destructive"/> : <CheckCircle size={16} className="mr-2 text-green-500"/>}
                Status: <span className="font-medium ml-1">{customer.disabled ? 'Disabled' : 'Active'} (Mock)</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2">Member since: {customer.createdAt ? (typeof customer.createdAt === 'string' ? new Date(customer.createdAt) : customer.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          {isEditingInfo && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Edit Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleInfoSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} disabled={isSubmittingInfo} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} disabled={isSubmittingInfo} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="street" render={({ field }) => (
                      <FormItem><FormLabel>Street Address</FormLabel><FormControl><Input {...field} disabled={isSubmittingInfo} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} disabled={isSubmittingInfo} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="postalCode" render={({ field }) => (
                        <FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input {...field} disabled={isSubmittingInfo} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <Button type="submit" disabled={isSubmittingInfo} className="bg-primary hover:bg-primary/90">
                      {isSubmittingInfo && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Save Changes
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
          
          <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="text-lg flex items-center"><ShieldCheck size={18} className="mr-2 text-primary/80"/>Admin Actions (Mock)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <Label htmlFor="role-select">Change Role (Requires Cloud Function)</Label>
                    <Select 
                        defaultValue={customer.role || 'user'}
                        onValueChange={(value) => handleRoleChange(value as 'user' | 'admin')}
                    >
                        <SelectTrigger id="role-select" className="mt-1">
                            <SelectValue placeholder="Select role..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button 
                    variant={customer.disabled ? "outline" : "destructive"} 
                    onClick={handleAccountStatusToggle}
                    className="w-full"
                >
                    {customer.disabled ? <CheckCircle size={16} className="mr-2"/> : <Ban size={16} className="mr-2"/>}
                    {customer.disabled ? 'Enable Account' : 'Disable Account'} (Requires Cloud Function)
                </Button>
                 <p className="text-xs text-muted-foreground">Note: Role and status changes are mocked and need backend Cloud Functions for real implementation.</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><ShoppingBag size={18} className="mr-2 text-primary/80"/>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <ul className="space-y-3">
                  {orders.slice(0, 5).map(order => (
                    <li key={order.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-md bg-muted/30 gap-2 sm:gap-0">
                      <div>
                        <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary hover:underline">Order #{order.id.substring(0,8)}...</Link>
                        <p className="text-xs text-muted-foreground">{new Date(order.orderDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto">
                        <p className="font-semibold">KSh {order.totalAmount.toLocaleString()}</p>
                        <Badge variant={
                            order.status === 'Delivered' ? 'default' :
                            order.status === 'Shipped' ? 'secondary' :
                            order.status === 'Pending' ? 'outline' : 'destructive'
                        } className={`text-xs ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>{order.status}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No orders found for this customer.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
