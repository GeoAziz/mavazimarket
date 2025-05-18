
"use client";

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, User, MapPin, Truck, CreditCard, FileText } from 'lucide-react';
import { mockOrders, mockProducts } from '@/lib/mock-data'; // Assuming mockOrders contains detailed items
import type { Order, CartItem } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  // Find the order from mock data - in a real app, this would be a fetch
  const order: Order | undefined = mockOrders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Package size={48} className="text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-4">The order with ID "{orderId}" could not be found.</p>
        <Button asChild variant="outline">
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Link>
        </Button>
      </div>
    );
  }
  
  // Enhance mock items with images if not already present
  const orderItemsWithDetails = order.items.map(item => {
    const productDetails = mockProducts.find(p => p.id.startsWith(item.id.split('-')[0] + '-' + item.id.split('-')[1])); // Basic matching
    return {
      ...item,
      image: productDetails?.images[0] || item.image, // Fallback to item.image if productDetails not found
      slug: productDetails?.slug || '#',
    };
  });


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <FileText size={30} className="mr-3 text-accent" /> Order Details: #{order.id}
        </h1>
        <Button asChild variant="outline">
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        {/* Order Items */}
        <Card className="md:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><Package className="mr-2 text-primary/80"/>Items in Order ({orderItemsWithDetails.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {orderItemsWithDetails.map((item: CartItem & {slug?: string}) => (
                <li key={item.id} className="flex items-start space-x-4 p-3 border rounded-md bg-muted/30">
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    width={64} 
                    height={80} 
                    className="rounded-md object-cover aspect-[3/4]"
                    data-ai-hint="product clothing" 
                  />
                  <div className="flex-grow">
                    <Link href={`/products/${item.slug}`} target="_blank" className="font-semibold text-foreground hover:underline">{item.name}</Link>
                    <p className="text-sm text-muted-foreground">SKU: {item.id}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">KSh {(item.price * item.quantity).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">KSh {item.price.toLocaleString()} each</p>
                  </div>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <div className="space-y-1 text-right text-sm">
              <div className="flex justify-end space-x-4">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium text-foreground">KSh {order.totalAmount.toLocaleString()}</span> {/* This should be subtotal before tax/ship in a real app */}
              </div>
              <div className="flex justify-end space-x-4">
                <span className="text-muted-foreground">Shipping:</span>
                <span className="font-medium text-foreground">KSh 0 (Mock)</span>
              </div>
              <div className="flex justify-end space-x-4">
                <span className="text-muted-foreground">Tax (VAT 16%):</span>
                <span className="font-medium text-foreground">KSh {(order.totalAmount * 0.16).toLocaleString(undefined, {minimumFractionDigits: 2})} (Mock)</span>
              </div>
              <Separator className="my-1"/>
              <div className="flex justify-end space-x-4 text-lg font-bold">
                <span className="text-primary">Total:</span>
                <span className="text-primary">KSh {order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer & Order Info */}
        <div className="space-y-6 md:sticky md:top-24">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><Truck className="mr-2 text-primary/80"/>Order Status & Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={
                        order.status === 'Delivered' ? 'default' :
                        order.status === 'Shipped' ? 'secondary' :
                        order.status === 'Pending' ? 'outline' : 'destructive'
                      }
                      className={`px-3 py-1 text-xs font-semibold ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Order Date: {new Date(order.orderDate).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Tracking #: MOCKTRACK123XYZ</p>
              <Button variant="outline" size="sm" className="w-full mt-3">Update Status (Mock)</Button>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><User className="mr-2 text-primary/80"/>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-medium text-foreground">Amina Wanjiru (Mock)</p>
              <p className="text-muted-foreground">amina@example.com</p>
              <p className="text-muted-foreground">+254 712 345 678</p>
              <Button variant="link" size="sm" className="p-0 h-auto text-accent hover:underline" asChild>
                <Link href={`/admin/customers/${mockUser.id}`}>View Customer Profile</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><MapPin className="mr-2 text-primary/80"/>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><CreditCard className="mr-2 text-primary/80"/>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="text-muted-foreground">Method: <span className="font-medium text-foreground">{order.paymentMethod}</span></p>
              <p className="text-muted-foreground">Transaction ID: MOCKPAYID789</p>
              <p className="text-muted-foreground">Status: <span className="text-green-600 font-medium">Paid</span></p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
