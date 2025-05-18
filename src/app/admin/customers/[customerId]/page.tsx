
"use client";

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserCircle, MapPin, Mail, Phone, ShoppingBag, Edit3, MessageSquare } from 'lucide-react';
import { mockUser, mockOrders } from '@/lib/mock-data'; // Using mockUser as an example
import type { User, Order } from '@/lib/types';
import Link from 'next/link';

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const customerId = params.customerId as string;

  // Find the customer from mock data - in a real app, this would be a fetch
  const customer: User | undefined = customerId === mockUser.id ? mockUser : 
    (customerId === 'mockuser02' ? { ...mockUser, id: 'mockuser02', name: 'Amina Wanjiru', email: 'amina@example.com', profilePictureUrl: 'https://placehold.co/40x40.png?text=AW' } : 
    (customerId === 'mockuser03' ? { ...mockUser, id: 'mockuser03', name: 'John Okello', email: 'john.o@example.com', profilePictureUrl: 'https://placehold.co/40x40.png?text=JO'  } : undefined));
  
  // Filter mock orders for this customer
  const customerOrders: Order[] = mockOrders.filter(order => order.id.includes(customerId.slice(-2))); // Simple mock filter

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary flex items-center">
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
              <AvatarImage src={customer.profilePictureUrl} alt={customer.name} data-ai-hint={customer.dataAiHint || 'avatar person'}/>
              <AvatarFallback className="text-3xl bg-muted">{customer.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">{customer.name}</CardTitle>
            <CardDescription>{customer.email}</CardDescription>
            <div className="mt-3 space-x-2">
                <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Edit3 size={14} className="mr-2" /> Edit Customer
                </Button>
                 <Button variant="outline" size="sm">
                    <MessageSquare size={14} className="mr-2" /> Send Message
                </Button>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 text-sm space-y-2">
            <div className="flex items-center">
                <Phone size={14} className="mr-2 text-muted-foreground"/>
                <span>+254 7XX XXX XXX (Mock)</span>
            </div>
            <div className="flex items-center">
                <MapPin size={14} className="mr-2 text-muted-foreground"/>
                <span>{customer.shippingAddress?.street}, {customer.shippingAddress?.city}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2">Member since: Jan 15, 2023 (Mock)</p>
          </CardContent>
        </Card>

        {/* Order History & Activity */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><ShoppingBag size={18} className="mr-2 text-primary/80"/>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {customerOrders.length > 0 ? (
                <ul className="space-y-3">
                  {customerOrders.slice(0, 3).map(order => ( // Show last 3 orders
                    <li key={order.id} className="flex justify-between items-center p-3 border rounded-md bg-muted/30">
                      <div>
                        <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary hover:underline">Order #{order.id}</Link>
                        <p className="text-xs text-muted-foreground">{new Date(order.orderDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
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
              {customerOrders.length > 3 && (
                 <Button variant="link" className="mt-3 text-accent p-0 h-auto" asChild>
                    <Link href="#">View All Orders ({customerOrders.length})</Link>
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
              <Button size="sm" className="mt-2">Save Note</Button>
              <Separator className="my-4"/>
              <p className="text-sm text-muted-foreground">No activity logged yet.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Need to add Textarea to ui components if not already there
// For now, assuming Textarea is available or we can add it later.
// Let's ensure Textarea is imported if it's a shadcn component.
// It is, so import it.
import { Textarea } from '@/components/ui/textarea';

