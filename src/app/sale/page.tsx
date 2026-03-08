
"use client"; // Required for QuickViewModal state

import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { mockProducts } from '@/lib/mock-data';
import type { Product } from '@/lib/types';
import { useState } from 'react'; // For QuickViewModal state
import { QuickViewModal } from '@/components/products/QuickViewModal'; // Import QuickViewModal

export default function SalePage() {
  const saleProducts: Product[] = mockProducts.filter(p => p.tags?.includes('sale') || p.price < 2000).slice(0, 8);

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const handleOpenQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const handleCloseQuickView = () => {
    setQuickViewProduct(null);
  };

  return (
    <>
      <QuickViewModal 
        product={quickViewProduct} 
        isOpen={!!quickViewProduct} 
        onClose={handleCloseQuickView} 
      />
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: 'Sale' }]} />
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <Percent size={48} className="mx-auto text-primary mb-3" />
            <CardTitle className="text-3xl md:text-4xl font-bold text-primary">
              Current Sale Offers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center mb-8">
              Check out our amazing deals on selected items! Limited time only.
            </p>
            {saleProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {saleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onOpenQuickView={handleOpenQuickView} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-10">No sale items available at the moment. Check back soon!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
