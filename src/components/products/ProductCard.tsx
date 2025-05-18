
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: Product;
  onOpenQuickView: (product: Product) => void;
}

export function ProductCard({ product, onOpenQuickView }: ProductCardProps) {
  const { toast } = useToast();
  const { currentUser, appUser } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  useEffect(() => {
    if (appUser && appUser.wishlist) {
      setIsInWishlist(appUser.wishlist.includes(product.id));
    } else {
      setIsInWishlist(false);
    }
  }, [appUser, product.id]);


  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (!currentUser) {
      toast({ title: "Please Login", description: "You need to be logged in to add items to your cart.", variant: "destructive" });
      return;
    }
    // TODO: Implement actual add to cart logic (e.g., update Firestore or context)
    console.log('Add to cart:', product.id, product.name);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart. (Mock)`,
      variant: "default",
    });
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      toast({ title: "Please Login", description: "You need to be logged in to manage your wishlist.", variant: "destructive" });
      return;
    }
    if (!appUser) {
        toast({ title: "Error", description: "User profile not loaded.", variant: "destructive" });
        return;
    }

    setIsWishlistLoading(true);
    const userWishlistRef = doc(db, "users", currentUser.uid);

    try {
      if (isInWishlist) {
        await updateDoc(userWishlistRef, {
          wishlist: arrayRemove(product.id)
        });
        toast({ title: "Removed from Wishlist", description: `${product.name} removed from your wishlist.` });
        setIsInWishlist(false);
      } else {
        await updateDoc(userWishlistRef, {
          wishlist: arrayUnion(product.id)
        });
        toast({ title: "Added to Wishlist", description: `${product.name} added to your wishlist.` });
        setIsInWishlist(true);
      }
      // Optionally, refetch appUser or update context to reflect change immediately across app
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast({ title: "Error", description: "Could not update wishlist. Please try again.", variant: "destructive" });
    } finally {
        setIsWishlistLoading(false);
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenQuickView(product);
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg flex flex-col h-full group">
      <Link href={`/products/${product.slug}`} className="block relative">
        <CardHeader className="p-0">
          <div className="aspect-[3/4] w-full overflow-hidden relative">
             <Image
              src={product.images[0]}
              alt={product.name}
              width={400}
              height={533}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={product.dataAiHint || 'fashion clothing'}
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 hover:bg-background text-primary rounded-full h-10 w-10"
                onClick={handleAddToCart}
                aria-label="Add to cart"
                disabled={!currentUser}
              >
                <ShoppingCart size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`bg-background/80 hover:bg-background rounded-full h-10 w-10 ${isInWishlist ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
                onClick={handleToggleWishlist}
                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                disabled={isWishlistLoading || !currentUser}
              >
                <Heart size={20} fill={isInWishlist ? "currentColor" : "none"}/>
              </Button>
            </div>
          </div>
          {product.tags?.includes('new-arrival') && (
            <Badge variant="default" className="absolute top-2 left-2 bg-accent text-accent-foreground z-20">New</Badge>
          )}
          {product.tags?.includes('sale') && (
            <Badge variant="destructive" className="absolute top-2 right-2 z-20">Sale</Badge>
          )}
        </CardHeader>
      </Link>
      <CardContent className="p-4 flex-grow">
        <Link href={`/products/${product.slug}`} className="block">
          <CardTitle className="text-lg font-semibold leading-tight mb-1 group-hover:text-primary transition-colors truncate" title={product.name}>
            {product.name}
          </CardTitle>
        </Link>
        <p className="text-sm text-muted-foreground mb-2 truncate">{product.brand || product.category}</p>
        <p className="text-xl font-bold text-primary">KSh {product.price.toLocaleString()}</p>
        {product.averageRating && (
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className={`w-4 h-4 ${i < Math.floor(product.averageRating!) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.365 2.448a1 1 0 00-.364 1.118l1.287 3.958c.3.921-.755 1.688-1.54 1.118l-3.365-2.448a1 1 0 00-1.175 0l-3.365 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.958a1 1 0 00-.364-1.118L2.05 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
              </svg>
            ))}
            <span className="ml-1 text-xs text-muted-foreground">({product.reviews?.length || 0})</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={handleQuickViewClick}>
            <Eye size={18} className="mr-2" /> Quick View
        </Button>
      </CardFooter>
    </Card>
  );
}
