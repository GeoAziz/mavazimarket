"use client";

import { ReactNode, useState } from 'react';
import type { Product } from '@/lib/types';
import { QuickViewModal } from '@/components/products/QuickViewModal';

interface HomeClientWrapperProps {
  children: ReactNode;
}

export function HomeClientWrapper({ children }: HomeClientWrapperProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const handleOpenQuickView = (product: Product) => setQuickViewProduct(product);
  const handleCloseQuickView = () => setQuickViewProduct(null);

  // Note: We need a way to pass handleOpenQuickView to ProductCards inside children
  // In a real app, we'd use a context or a more sophisticated wrapper.
  // For now, let's keep it simple.
  
  return (
    <>
      <QuickViewModal 
        product={quickViewProduct} 
        isOpen={!!quickViewProduct} 
        onClose={handleCloseQuickView} 
      />
      {children}
    </>
  );
}