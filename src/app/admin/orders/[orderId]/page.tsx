
"use client";

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, User, MapPin, Truck, CreditCard, FileText, Loader2, Save } from 'lucide-react';
import type { Order, CartItem as OrderItemType, Product } from '@/lib/types'; // Renamed CartItem to OrderItemType for clarity
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Define OrderItem with slug for product linking
interface EnrichedOrderItem extends OrderItemType {
  slug?: string;
  productImage?: string; // To distinguish from item.image if it's different in order
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<any | null>(null); // Replace 'any' with actual User type if available
  const [enrichedOrderItems, setEnrichedOrderItems] = useState<EnrichedOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | ''>('');

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const orderDocRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderDocRef);

        if (orderSnap.exists()) {
          const orderData = { id: orderSnap.id, ...orderSnap.data() } as Order;
           orderData.orderDate = (orderData.orderDate as any).toDate ? (orderData.orderDate as any).toDate().toISOString() : new Date(orderData.orderDate).toISOString();
          setOrder(orderData);
          setSelectedStatus(orderData.status);

          // Fetch customer details if userId exists
          if (orderData.userId) {
            const userDocRef = doc(db, "users", orderData.userId);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              setCustomer({ id: userSnap.id, ...userSnap.data() });
            }
          }

          // Enrich order items with product slugs and images
          const itemsWithDetails = await Promise.all(
            orderData.items.map(async (item) => {
              try {
                // Assuming item.id might be like 'productActualId-variantInfo' or just 'productActualId'
                // We need a robust way to get the base product ID if variants are involved.
                // For now, let's assume item.id is the actual product ID or a direct key.
                // A more robust system might store productSnapshot in order item.
                const productDocRef = doc(db, "products", item.productId || item.id); // Prefer item.productId
                const productSnap = await getDoc(productDocRef);
                if (productSnap.exists()) {
                  const productData = productSnap.data() as Product;
                  return {
                    ...item,
                    slug: productData.slug,
                    productImage: productData.images[0] || item.image,
                  };
                }
              } catch (e) { console.error("Error fetching product for order item", item.id, e); }
              return { ...item, slug: '#', productImage: item.image }; // Fallback
            })
          );
          setEnrichedOrderItems(itemsWithDetails as EnrichedOrderItem[]);

        } else {
          toast({ title: "Error", description: "Order not found.", variant: "destructive" });
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast({ title: "Error", description: "Could not fetch order details.", variant: "destructive" });
      }
      setLoading(false);
    };

    fetchOrderDetails();
  }, [orderId, toast]);

  const handleUpdateStatus = async () => {
    if (!order || !selectedStatus || selectedStatus === order.status) return;
    setIsUpdatingStatus(true);
    try {
      const orderDocRef = doc(db, "orders", orderId);
      await updateDoc(orderDocRef, { status: selectedStatus });
      setOrder(prev => prev ? { ...prev, status: selectedStatus } : null);
      toast({ title: "Success", description: `Order status updated to ${selectedStatus}.` });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({ title: "Error", description: "Failed to update order status.", variant: "destructive" });
    }
    setIsUpdatingStatus(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-3/5" />
            <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-start">
            <Card className="md:col-span-2 shadow-lg"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card>
            <div className="space-y-6"><Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card><Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent className="space-y-1"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></CardContent></Card></div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-primary flex items-center">
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
            <CardTitle className="text-xl flex items-center"><Package className="mr-2 text-primary/80"/>Items in Order ({enrichedOrderItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {enrichedOrderItems.map((item: EnrichedOrderItem) => (
                <li key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-3 border rounded-md bg-muted/30">
                  <Image
                    src={item.productImage || 'https://placehold.co/64x80.png'}
                    alt={item.name}
                    width={64}
                    height={80}
                    className="rounded-md object-cover aspect-[3/4] w-full sm:w-16"
                    data-ai-hint="product clothing"
                  />
                  <div className="flex-grow">
                    <Link href={`/products/${item.slug}`} target="_blank" className="font-semibold text-foreground hover:underline">{item.name}</Link>
                    <p className="text-sm text-muted-foreground">SKU: {item.productId || item.id}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right w-full sm:w-auto pt-2 sm:pt-0">
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
                <span className="font-medium text-foreground">KSh {order.totalAmount.toLocaleString()}</span>
              </div>
              {/* Shipping and Tax can be added here if they are part of order data */}
              <Separator className="my-1"/>
              <div className="flex justify-end space-x-4 text-lg font-bold">
                <span className="text-primary">Total:</span>
                <span className="text-primary">KSh {order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer & Order Info Column */}
        <div className="space-y-6 md:sticky md:top-24">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><Truck className="mr-2 text-primary/80"/>Order Status & Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Current Status:</span>
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
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as Order['status'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Change status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus || selectedStatus === order.status || !selectedStatus}
                className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isUpdatingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save size={16} className="mr-2" /> Update Status
              </Button>
              <p className="text-sm text-muted-foreground">Order Date: {new Date(order.orderDate).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Tracking #: MOCKTRACK123XYZ (Static)</p>
            </CardContent>
          </Card>

          {customer && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center"><User className="mr-2 text-primary/80"/>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium text-foreground">{customer.name || 'N/A'}</p>
                <p className="text-muted-foreground">{customer.email || 'N/A'}</p>
                {/* <p className="text-muted-foreground">{customer.phone || '+254 7XX XXX XXX (Mock)'}</p> */}
                <Button variant="link" size="sm" className="p-0 h-auto text-accent hover:underline" asChild>
                  <Link href={`/admin/customers/${customer.id}`}>View Customer Profile</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><MapPin className="mr-2 text-primary/80"/>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{order.shippingAddress?.street || 'N/A'}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
              <p>{order.shippingAddress?.country}</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><CreditCard className="mr-2 text-primary/80"/>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="text-muted-foreground">Method: <span className="font-medium text-foreground">{order.paymentMethod}</span></p>
              <p className="text-muted-foreground">Transaction ID: MOCKPAYID789 (Static)</p>
              <p className="text-muted-foreground">Status: <span className="text-green-600 font-medium">Paid</span> (Mock)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
