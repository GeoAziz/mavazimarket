
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast'; // For user feedback

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    console.log('Add to cart:', product.id, product.name);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
      variant: "default",
    });
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    console.log('Add to wishlist:', product.id, product.name);
    toast({
      title: "Added to Wishlist",
      description: `${product.name} has been added to your wishlist.`,
      variant: "default",
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Quick View for:', product.id, product.name);
    toast({
        title: "Quick View",
        description: `Displaying quick view for ${product.name}. (Modal to be implemented)`,
        variant: "default",
    });
    // In a future step, this would open a modal, e.g., by calling a prop function:
    // onOpenQuickView(product);
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
            {/* Hover icons overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 hover:bg-background text-primary rounded-full h-10 w-10"
                onClick={handleAddToCart}
                aria-label="Add to cart"
              >
                <ShoppingCart size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 hover:bg-background text-destructive rounded-full h-10 w-10"
                onClick={handleAddToWishlist}
                aria-label="Add to wishlist"
              >
                <Heart size={20} />
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
        <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={handleQuickView}>
            <Eye size={18} className="mr-2" /> Quick View
        </Button>
      </CardFooter>
    </Card>
  );
}
