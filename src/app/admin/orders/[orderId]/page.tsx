
"use client";

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Package, User, MapPin, Truck, CreditCard, Loader2, Save, Send } from 'lucide-react';
import type { Order, CartItem as OrderItemType, Product } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { updateOrderLogisticsAction } from './actions';

interface EnrichedOrderItem extends OrderItemType {
  slug?: string;
  productImage?: string;
}

/** Valid next states for each current order status (mirrors the server state machine). */
const ALLOWED_TRANSITIONS: Record<Order['status'], Order['status'][]> = {
  Pending:    ['Processing', 'Cancelled'],
  Processing: ['Shipped',    'Cancelled'],
  Shipped:    ['Delivered'],
  Delivered:  [],
  Cancelled:  [],
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<any | null>(null);
  const [enrichedOrderItems, setEnrichedOrderItems] = useState<EnrichedOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | ''>('');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const orderDocRef = doc(db!, "orders", orderId);
        const orderSnap = await getDoc(orderDocRef);

        if (orderSnap.exists()) {
          const orderData = { id: orderSnap.id, ...orderSnap.data() } as Order;
          // Normalize dates
          orderData.orderDate = (orderData.orderDate as any).toDate ? (orderData.orderDate as any).toDate().toISOString() : new Date(orderData.orderDate as string).toISOString();
          
          setOrder(orderData);
          setSelectedStatus(orderData.status);
          setTrackingNumber(orderData.trackingNumber || '');

          if (orderData.userId) {
            const userDocRef = doc(db!, "users", orderData.userId);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              setCustomer({ id: userSnap.id, ...userSnap.data() });
            }
          }

          const itemsWithDetails = await Promise.all(
            orderData.items.map(async (item) => {
              try {
                const productDocRef = doc(db!, "products", item.productId || item.id);
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
              return { ...item, slug: '#', productImage: item.image };
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

  const handleUpdateLogistics = async () => {
    if (!order || !selectedStatus) return;
    setIsUpdating(true);
    
    const result = await updateOrderLogisticsAction({
      orderId: order.id,
      status: selectedStatus as Order['status'],
      trackingNumber: trackingNumber,
      customerEmail: customer?.email || '',
      customerName: customer?.name || 'Valued Customer'
    });

    if (result.success) {
      setOrder(prev => prev ? { ...prev, status: selectedStatus as Order['status'], trackingNumber } : null);
      toast({ 
        title: "Logistics Synced", 
        description: `Order ${selectedStatus} and customer notified via Resend.` 
      });
    } else {
      toast({ title: "Update Failed", description: result.error, variant: "destructive" });
    }
    setIsUpdating(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/2 rounded-xl" />
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Package size={64} className="text-primary/20 mb-6" />
        <h2 className="text-2xl font-heading text-secondary">Logistics Archive Not Found</h2>
        <Button asChild variant="outline" className="mt-6 border-primary text-primary">
          <Link href="/admin/orders">BACK TO ARCHIVE</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading text-secondary">Order Logistics</h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-primary">ID: #{order.id}</p>
        </div>
        <Button variant="outline" className="border-secondary" asChild>
          <Link href="/admin/orders"><ArrowLeft className="mr-2 h-4 w-4" /> BACK TO LOGISTICS</Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-2xl border-none rounded-2xl overflow-hidden">
            <CardHeader className="bg-secondary text-background p-8">
              <CardTitle className="text-xl font-heading flex items-center">
                <Package className="mr-3 text-primary" /> Curation Manifest ({enrichedOrderItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <ul className="space-y-6">
                {enrichedOrderItems.map((item) => (
                  <li key={item.id} className="flex gap-6 p-4 rounded-xl bg-primary/5 border border-primary/10 group transition-all hover:bg-primary/10">
                    <div className="relative h-24 w-18 rounded-lg overflow-hidden shadow-md">
                      <Image src={item.productImage || 'https://placehold.co/64x80.png'} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <Link href={`/products/${item.slug}`} target="_blank" className="font-heading text-lg text-secondary hover:text-primary transition-colors">{item.name}</Link>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">QTY: {item.quantity} • {item.size || 'OS'}</p>
                      </div>
                      <p className="font-heading text-primary font-bold">KSh {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Separator className="my-8 bg-primary/10" />
              <div className="flex flex-col items-end gap-2 px-4">
                <div className="flex justify-between w-full max-w-[200px] text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span>SUBTOTAL</span>
                  <span>KSh {order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between w-full max-w-[300px] text-3xl font-heading text-primary font-bold pt-4">
                  <span>TOTAL</span>
                  <span>KSh {order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8 lg:sticky lg:top-24">
          <Card className="shadow-2xl border-none rounded-2xl overflow-hidden bg-card">
            <CardHeader className="bg-primary text-white p-8">
              <CardTitle className="text-xl font-heading flex items-center"><Truck className="mr-3 text-accent" /> Logistics Management</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Shipping Status</Label>
                <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as Order['status'])}>
                  <SelectTrigger className="h-12 border-2 border-primary/10 rounded-xl focus:ring-primary">
                    <SelectValue placeholder="Update status..." />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Always show the current status so the selector has a value */}
                    {order && (
                      <SelectItem value={order.status}>{order.status} (current)</SelectItem>
                    )}
                    {order && ALLOWED_TRANSITIONS[order.status].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Tracking Number</Label>
                <div className="relative">
                  <Truck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                  <Input 
                    placeholder="e.g. MAV-12345678" 
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="pl-12 h-12 border-2 border-primary/10 rounded-xl" 
                  />
                </div>
              </div>

              <Button 
                onClick={handleUpdateLogistics}
                disabled={isUpdating || !selectedStatus}
                className="w-full h-14 bg-secondary text-white font-bold tracking-[0.2em] shadow-xl transition-all active:scale-[0.98]"
              >
                {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                SYNC LOGISTICS
              </Button>
              
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                <Send className="h-4 w-4 text-primary" />
                <p className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Automated Resend Notification Active</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-none rounded-2xl overflow-hidden">
            <CardHeader className="bg-secondary/5 border-b border-primary/5 p-6">
              <CardTitle className="text-sm font-heading flex items-center text-secondary"><User className="mr-2 text-primary" size={16} /> Destination & Identity</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {customer && (
                <div className="pb-4 border-b border-primary/5">
                  <p className="font-bold text-secondary text-sm">{customer.name}</p>
                  <p className="text-xs text-muted-foreground">{customer.email}</p>
                  <Button variant="link" size="sm" className="p-0 h-auto text-primary text-[10px] font-bold uppercase tracking-widest mt-2" asChild>
                    <Link href={`/admin/customers/${customer.id}`}>View Heritage Profile</Link>
                  </Button>
                </div>
              )}
              <div className="flex gap-3">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-1" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <p className="font-bold text-secondary">Shipping Address:</p>
                  <p>{order.shippingAddress?.street}</p>
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                  <p>{order.shippingAddress?.country}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <CreditCard className="h-4 w-4 text-primary shrink-0 mt-1" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-bold text-secondary uppercase tracking-widest">Settle via {order.paymentMethod}</p>
                  {order.mpesaTransactionId && <p className="text-[10px]">TXN: {order.mpesaTransactionId}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
