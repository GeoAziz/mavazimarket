
"use client";

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserCircle, MapPin, Mail, Phone, ShoppingBag, Edit3, MessageSquare, Loader2 } from 'lucide-react';
import type { User, Order } from '@/lib/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const customerId = params.customerId as string;
  const { toast } = useToast();

  const [customer, setCustomer] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId) return;

    const fetchCustomerData = async () => {
      setLoading(true);
      try {
        // Fetch customer details
        const customerDocRef = doc(db, "users", customerId);
        const customerSnap = await getDoc(customerDocRef);
        if (customerSnap.exists()) {
          setCustomer({ id: customerSnap.id, ...customerSnap.data() } as User);
        } else {
          toast({ title: "Error", description: "Customer not found.", variant: "destructive" });
        }

        // Fetch customer orders
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
  }, [customerId, toast]);

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
        {/* Customer Profile Card */}
        <Card className="md:col-span-1 shadow-lg">
          <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-3 border-2 border-primary">
              <AvatarImage src={customer.profilePictureUrl || `https://placehold.co/100x100.png?text=${customer.name?.substring(0,1)}`} alt={customer.name} data-ai-hint={customer.dataAiHint || 'avatar person'}/>
              <AvatarFallback className="text-3xl bg-muted">{customer.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">{customer.name}</CardTitle>
            <CardDescription>{customer.email}</CardDescription>
            <div className="mt-3 space-x-2">
                <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Edit3 size={14} className="mr-2" /> Edit (Mock)
                </Button>
                 <Button variant="outline" size="sm">
                    <MessageSquare size={14} className="mr-2" /> Message (Mock)
                </Button>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 text-sm space-y-2">
            <div className="flex items-center">
                <Phone size={14} className="mr-2 text-muted-foreground"/>
                <span>{customer.phone || '+254 7XX XXX XXX (N/A)'}</span>
            </div>
            <div className="flex items-center">
                <MapPin size={14} className="mr-2 text-muted-foreground"/>
                <span>{customer.shippingAddress?.street || 'N/A'}, {customer.shippingAddress?.city || 'N/A'}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2">Member since: {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}</p>
          </CardContent>
        </Card>

        {/* Order History & Activity */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><ShoppingBag size={18} className="mr-2 text-primary/80"/>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <ul className="space-y-3">
                  {orders.slice(0, 5).map(order => ( // Show last 5 orders
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
              {orders.length > 5 && (
                 <Button variant="link" className="mt-3 text-accent p-0 h-auto" asChild>
                    <Link href="#">View All Orders ({orders.length}) (Mock)</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Customer Notes & Activity (Placeholder)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="Add notes about this customer..." rows={3} />
              <Button size="sm" className="mt-2">Save Note (Mock)</Button>
              <Separator className="my-4"/>
              <p className="text-sm text-muted-foreground">No activity logged yet.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
