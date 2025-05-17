"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg flex flex-col h-full group">
      <Link href={`/products/${product.slug}`} className="block">
        <CardHeader className="p-0 relative">
          <div className="aspect-[3/4] w-full overflow-hidden">
             <Image
              src={product.images[0]}
              alt={product.name}
              width={400}
              height={533}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={product.dataAiHint || 'fashion clothing'}
            />
          </div>
          {product.tags?.includes('new-arrival') && (
            <Badge variant="default" className="absolute top-2 left-2 bg-accent text-accent-foreground">New</Badge>
          )}
          {product.tags?.includes('sale') && (
            <Badge variant="destructive" className="absolute top-2 right-2">Sale</Badge>
          )}
        </CardHeader>
      </Link>
      <CardContent className="p-4 flex-grow">
        <Link href={`/products/${product.slug}`} className="block">
          <CardTitle className="text-lg font-semibold leading-tight mb-1 group-hover:text-primary transition-colors truncate">
            {product.name}
          </CardTitle>
        </Link>
        <p className="text-sm text-muted-foreground mb-2">{product.brand || product.category}</p>
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
        <div className="w-full flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
            <Link href={`/products/${product.slug}`}>
              <Eye size={18} className="mr-2" /> Quick View
            </Link>
          </Button>
          <Button className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => console.log('Add to cart:', product.id)}>
            <ShoppingCart size={18} className="mr-2" /> Add to Cart
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
