
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
  DialogClose
} from '@/components/ui/dialog';
import { ShoppingCart, ExternalLink, X, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { formatKSh } from '@/lib/utils';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { toast } = useToast();
  const { addToCart } = useCart();

  if (!product) {
    return null;
  }

  const handleAddToCartFromModal = () => {
    addToCart(product, 1);
    toast({
      title: "Added to Cart",
      description: `${product.name} joined your collection.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[850px] p-0 border-none rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid md:grid-cols-2">
          {/* Image Side */}
          <div className="relative aspect-[3/4] md:aspect-auto h-full bg-secondary/5">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              data-ai-hint={product.dataAiHint || 'fashion clothing'}
            />
            <div className="absolute top-4 left-4">
               <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 tracking-[0.2em] rounded-sm uppercase">Quick View</span>
            </div>
          </div>

          {/* Content Side */}
          <div className="flex flex-col p-8 md:p-12 bg-background relative">
            <DialogClose className="absolute top-6 right-6 text-secondary hover:text-primary transition-colors">
              <X size={24} />
              <span className="sr-only">Close</span>
            </DialogClose>

            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-2">{product.brand || 'MAVAZI HERITAGE'}</p>
              <DialogTitle className="text-3xl md:text-4xl font-heading text-secondary leading-tight mb-4">
                {product.name}
              </DialogTitle>
              <div className="flex items-center space-x-2 text-[10px] font-bold tracking-widest text-green-600 mb-6 uppercase">
                <ShieldCheck size={14} />
                <span>Authentic Kenyan Craftsmanship</span>
              </div>
              <p className="text-3xl font-heading text-primary font-bold">{formatKSh(product.price)}</p>
            </div>

            <div className="space-y-6 flex-grow">
              <DialogDescription className="text-muted-foreground leading-relaxed text-sm line-clamp-4">
                {product.description}
              </DialogDescription>
              
              {(product.sizes || product.colors) && (
                <div className="flex flex-wrap gap-4 text-[10px] font-bold tracking-widest text-secondary/60 uppercase">
                  {product.sizes && <span>Sizes: {product.sizes.join(', ')}</span>}
                  {product.colors && <span>Colors: {product.colors.join(', ')}</span>}
                </div>
              )}
            </div>
            
            <div className="pt-10 flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="flex-1 bg-primary text-white shadow-xl shadow-primary/20 h-[52px]" onClick={handleAddToCartFromModal}>
                <ShoppingCart size={18} className="mr-2" /> ADD TO CART
              </Button>
              <Button size="lg" variant="outline" className="flex-1 h-[52px] border-secondary text-secondary" asChild>
                <Link href={`/products/${product.slug}`} onClick={onClose}>
                  DETAILS <ExternalLink size={14} className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
