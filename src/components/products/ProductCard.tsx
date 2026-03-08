
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Heart, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatKSh } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onOpenQuickView: (product: Product) => void;
}

const GUEST_WISHLIST_LOCAL_STORAGE_KEY = 'mavaziGuestWishlist';

export function ProductCard({ product, onOpenQuickView }: ProductCardProps) {
  const { toast } = useToast();
  const { currentUser, appUser } = useAuth();
  const { addToCart } = useCart();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  useEffect(() => {
    if (currentUser && appUser?.wishlist) {
      setIsInWishlist(appUser.wishlist.includes(product.id));
    } else if (!currentUser && typeof window !== 'undefined') {
      const guestWishlistData = localStorage.getItem(GUEST_WISHLIST_LOCAL_STORAGE_KEY);
      if (guestWishlistData) {
        const guestWishlist: string[] = JSON.parse(guestWishlistData);
        setIsInWishlist(guestWishlist.includes(product.id));
      }
    }
  }, [currentUser, appUser, product.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast({
      title: "Added to Cart",
      description: `${product.name} joined your collection.`,
    });
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlistLoading(true);

    if (currentUser && appUser) {
      if (!db) return;
      const userWishlistRef = doc(db, "users", currentUser.uid);
      try {
        if (isInWishlist) {
          await updateDoc(userWishlistRef, { wishlist: arrayRemove(product.id) });
          toast({ title: "Removed", description: "Item removed from wishlist." });
          setIsInWishlist(false);
        } else {
          await updateDoc(userWishlistRef, { wishlist: arrayUnion(product.id) });
          toast({ title: "Saved", description: "Added to your wishlist." });
          setIsInWishlist(true);
        }
      } catch (error) {
        console.error("Wishlist error:", error);
      }
    } else if (typeof window !== 'undefined') {
      const guestWishlistData = localStorage.getItem(GUEST_WISHLIST_LOCAL_STORAGE_KEY);
      let guestWishlist: string[] = guestWishlistData ? JSON.parse(guestWishlistData) : [];
      if (isInWishlist) {
        guestWishlist = guestWishlist.filter(id => id !== product.id);
        setIsInWishlist(false);
      } else {
        guestWishlist.push(product.id);
        setIsInWishlist(true);
      }
      localStorage.setItem(GUEST_WISHLIST_LOCAL_STORAGE_KEY, JSON.stringify(guestWishlist));
    }
    setIsWishlistLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-500 rounded-xl flex flex-col h-full group bg-card">
        <Link href={`/products/${product.slug}`} className="block relative">
          <CardHeader className="p-0">
            <div className="aspect-[3/4] w-full overflow-hidden relative bg-secondary/5">
               <Image
                src={product.images[0]}
                alt={product.name}
                width={400}
                height={533}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                data-ai-hint={product.dataAiHint || 'fashion clothing'}
              />
              <div className="absolute inset-0 bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center space-x-3 z-10">
                <Button
                  variant="default"
                  size="icon"
                  className="bg-primary text-white rounded-full h-12 w-12 shadow-xl"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart size={20} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`bg-background/95 rounded-full h-12 w-12 shadow-xl ${isInWishlist ? 'text-primary' : 'text-secondary'}`}
                  onClick={handleToggleWishlist}
                  disabled={isWishlistLoading}
                >
                  {isWishlistLoading ? <Loader2 className="animate-spin h-5 w-5"/> : <Heart size={20} fill={isInWishlist ? "currentColor" : "none"}/>}
                </Button>
              </div>
            </div>
            {product.tags?.includes('new-arrival') && (
              <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground font-bold px-3 py-1 z-20 rounded-sm">NEW</Badge>
            )}
            {product.tags?.includes('sale') && (
              <Badge variant="destructive" className="absolute top-4 right-4 font-bold px-3 py-1 z-20 rounded-sm">SALE</Badge>
            )}
          </CardHeader>
        </Link>
        <CardContent className="p-5 flex-grow">
          <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-2">{product.brand || 'MAVAZI HERITAGE'}</p>
          <Link href={`/products/${product.slug}`} className="block">
            <CardTitle className="text-xl font-heading text-secondary leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </CardTitle>
          </Link>
          <p className="text-[22px] font-bold font-heading text-primary leading-none">{formatKSh(product.price)}</p>
        </CardContent>
        <CardFooter className="px-5 pb-5 pt-0 mt-auto">
          <Button 
            variant="outline" 
            className="w-full font-bold tracking-[0.2em] text-[10px] h-10 border-2 rounded-md" 
            onClick={(e) => { e.preventDefault(); onOpenQuickView(product); }}
          >
              QUICK VIEW
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
