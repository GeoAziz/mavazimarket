
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose, SheetFooter } from '@/components/ui/sheet';
import { ShoppingBag, X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatKSh } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, updateQuantity, removeFromCart, totalAmount, totalItems } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[450px] p-0 flex flex-col border-l-4 border-primary">
        <SheetHeader className="p-6 border-b bg-secondary text-white">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-heading flex items-center text-white">
              <ShoppingBag className="mr-3 text-primary" /> 
              YOUR BAG <span className="ml-2 text-sm bg-primary px-2 py-0.5 rounded-full font-sans">{totalItems}</span>
            </SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                <X size={20} />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <ShoppingBag size={64} className="text-primary/20 mb-6" />
              <p className="text-lg font-heading text-secondary mb-2">Your bag is empty</p>
              <p className="text-sm text-muted-foreground mb-8">Start adding some heritage to your style.</p>
              <SheetClose asChild>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white" asChild>
                  <Link href="/#featured-products">SHOP COLLECTIONS</Link>
                </Button>
              </SheetClose>
            </div>
          ) : (
            <div className="divide-y divide-primary/5">
              {cartItems.map((item) => (
                <div key={item.id} className="py-6 flex gap-4">
                  <div className="relative h-24 w-18 rounded-md overflow-hidden bg-secondary/5 flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link href={`/products/${item.slug}`} onClick={onClose} className="font-heading text-secondary hover:text-primary transition-colors line-clamp-1 mr-2">
                          {item.name}
                        </Link>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">
                        {item.size || 'OS'} • {item.color || 'Default'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border rounded-md h-8">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus size={12} />
                        </Button>
                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus size={12} />
                        </Button>
                      </div>
                      <span className="font-bold text-primary text-sm">{formatKSh(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {cartItems.length > 0 && (
          <SheetFooter className="p-6 border-t bg-secondary/5 block space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold uppercase tracking-widest text-secondary/60">Subtotal</span>
              <span className="text-xl font-heading text-secondary">{formatKSh(totalAmount)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest">Taxes and shipping calculated at checkout</p>
            <div className="flex flex-col gap-3 pt-2">
              <Button size="lg" className="w-full bg-primary text-white font-bold tracking-widest h-14" asChild onClick={onClose}>
                <Link href="/checkout">
                  SECURE CHECKOUT <ArrowRight size={18} className="ml-2" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full border-secondary h-14 font-bold tracking-widest" asChild onClick={onClose}>
                <Link href="/cart">VIEW FULL BAG</Link>
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
