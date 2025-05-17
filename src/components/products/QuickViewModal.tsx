
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { ShoppingCart, ExternalLink, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { toast } = useToast();

  if (!product) {
    return null;
  }

  const handleAddToCart = () => {
    console.log('Add to cart from quick view:', product.id, product.name);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
      variant: "default",
    });
    // onClose(); // Optionally close modal after adding to cart
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[750px] lg:max-w-[900px] p-0">
        <DialogHeader className="p-6 pb-0 flex flex-row items-start justify-between">
          <div className="space-y-1">
            <DialogTitle className="text-2xl font-bold text-primary">{product.name}</DialogTitle>
            {product.brand && <DialogDescription className="text-sm text-muted-foreground">Brand: {product.brand}</DialogDescription>}
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 p-6 max-h-[80vh] overflow-y-auto">
          <div className="aspect-[3/4] w-full overflow-hidden rounded-lg shadow-md">
            <Image
              src={product.images[0]}
              alt={product.name}
              width={600}
              height={800}
              className="object-cover w-full h-full"
              data-ai-hint={product.dataAiHint || 'fashion clothing'}
            />
          </div>
          <div className="space-y-4 flex flex-col">
            <p className="text-3xl font-extrabold text-foreground">KSh {product.price.toLocaleString()}</p>
            
            {/* Simplified selectors for demo - real implementation would need state */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">Color: <span className="text-muted-foreground">{product.colors[0]}</span></p>
                {/* Placeholder for color swatches */}
              </div>
            )}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">Size: <span className="text-muted-foreground">{product.sizes[0]}</span></p>
                {/* Placeholder for size selector */}
              </div>
            )}

            <DialogDescription className="text-muted-foreground leading-relaxed text-sm line-clamp-4 flex-grow">
              {product.description}
            </DialogDescription>
            
            <div className="pt-4 space-y-3 mt-auto">
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleAddToCart}>
                <ShoppingCart size={20} className="mr-2" /> Add to Cart
              </Button>
              <Button size="lg" variant="outline" className="w-full" asChild>
                <Link href={`/products/${product.slug}`} onClick={onClose}>
                  <ExternalLink size={20} className="mr-2" /> View Full Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
