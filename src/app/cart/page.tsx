
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { mockCartItems } from '@/lib/mock-data';
import type { CartItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Minus, Plus, Trash2, ShoppingBag, Info, PackageOpen } from 'lucide-react'; // Added PackageOpen
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from 'react';


export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  useEffect(() => {
    setCartItems(mockCartItems);
  }, []);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) { // Remove item if quantity becomes 0 or less
      removeItem(id);
      return;
    }
    setCartItems(prevItems => 
      prevItems.map(item => item.id === id ? { ...item, quantity: newQuantity } : item)
    );
  };

  const removeItem = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxes = subtotal * 0.16; 
  const shippingFee = subtotal > 3000 ? 0 : 250; 
  const total = subtotal + taxes + shippingFee;

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Shopping Cart' }]} />
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Your Shopping Cart</h1>
        {cartItems.length > 0 && <p className="text-muted-foreground">You have {cartItems.length} item(s) in your cart.</p>}
      </div>

      {cartItems.length === 0 ? (
        <Card className="text-center py-16 shadow-xl border-dashed border-muted-foreground/30 bg-secondary/30">
          <CardHeader className="items-center">
             <PackageOpen className="mx-auto h-24 w-24 text-primary mb-6" strokeWidth={1.5}/>
            <CardTitle className="text-3xl font-semibold text-primary">Your Cart is Looking a Little Empty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Time to find some treasures!
            </p>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-10 py-6 text-lg transition-transform hover:scale-105" asChild>
              <Link href="/">Start Shopping</Link>
            </Button>
          </CardContent>
           <CardFooter className="justify-center pt-6">
             <p className="text-xs text-muted-foreground">Need help? <Link href="/contact" className="underline hover:text-primary">Contact us</Link></p>
           </CardFooter>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <Card key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4 shadow-sm hover:shadow-md transition-shadow">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={100}
                  height={120}
                  className="rounded-md object-cover w-full sm:w-24 h-32 sm:h-auto aspect-[3/4]"
                  data-ai-hint="product clothing"
                />
                <div className="flex-grow">
                  <Link href={`/products/${item.id.replace('-01', '')}`} className="hover:underline"> 
                    <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                  </Link>
                  {item.size && <p className="text-sm text-muted-foreground">Size: {item.size}</p>}
                  {item.color && <p className="text-sm text-muted-foreground">Color: {item.color}</p>}
                  <p className="text-md font-medium text-primary mt-1">KSh {item.price.toLocaleString()}</p>
                </div>
                <div className="flex flex-col sm:items-end gap-2 sm:gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
                  <div className="flex items-center border rounded-md">
                    <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Minus size={16} />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      className="w-12 h-8 text-center border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                      aria-label="Quantity"
                    />
                    <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Plus size={16} />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="text-destructive hover:text-destructive/80 self-start sm:self-end">
                    <Trash2 size={16} className="mr-1 sm:mr-0" /> <span className="sm:hidden">Remove</span>
                  </Button>
                </div>
                 <p className="sm:hidden text-md font-semibold text-right mt-2 w-full">Item Total: KSh {(item.price * item.quantity).toLocaleString()}</p>
                 <p className="hidden sm:block text-md font-semibold min-w-[100px] text-right">KSh {(item.price * item.quantity).toLocaleString()}</p>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-primary">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">KSh {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes (VAT 16%)</span>
                  <span className="font-medium text-foreground">KSh {taxes.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping Fee</span>
                  <span className="font-medium text-foreground">{shippingFee === 0 ? 'Free' : `KSh ${shippingFee.toLocaleString()}`}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-primary">Total</span>
                  <span className="text-primary">KSh {total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <Alert className="mt-4 bg-accent/10 border-accent/30">
                  <Info className="h-4 w-4 text-accent" />
                  <AlertDescription className="text-accent">
                    Free shipping on orders above KSh 3,000!
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full" asChild>
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
