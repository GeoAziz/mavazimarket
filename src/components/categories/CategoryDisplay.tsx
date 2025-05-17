
"use client";

import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/products/ProductCard';
import { FilterSidebar, type SelectedFilters } from '@/components/products/FilterSidebar';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Filter, X, Loader2 } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { QuickViewModal } from '@/components/products/QuickViewModal'; // Import QuickViewModal

interface CategoryDisplayProps {
  category: Category;
  productsInCategory: Product[];
}

type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating';

export function CategoryDisplay({ category, productsInCategory }: CategoryDisplayProps) {
  const [currentProducts, setCurrentProducts] = useState<Product[]>(productsInCategory);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const itemsPerPage = 9;

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const handleOpenQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const handleCloseQuickView = () => {
    setQuickViewProduct(null);
  };

  // Initial products to display based on currentProducts and pagination
  useEffect(() => {
    const initialBatch = currentProducts.slice(0, itemsPerPage);
    setDisplayedProducts(initialBatch);
    setHasMore(initialBatch.length < currentProducts.length);
  }, [currentProducts, itemsPerPage]);

  const loadMoreProducts = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const currentLength = displayedProducts.length;
    const newProducts = currentProducts.slice(currentLength, currentLength + itemsPerPage);
    
    setTimeout(() => {
      setDisplayedProducts((prev) => [...prev, ...newProducts]);
      setHasMore((prevLength) => prevLength + newProducts.length < currentProducts.length); // Incorrect logic previously
      setLoadingMore(false);
    }, 500); 
  }, [loadingMore, hasMore, displayedProducts.length, currentProducts, itemsPerPage]);

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 300 && // Trigger a bit earlier
        !loadingMore && hasMore
      ) {
        loadMoreProducts();
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [loadMoreProducts, loadingMore, hasMore]);

  // Sorting logic (applied to the full productsInCategory list, then sliced for display)
  const sortProducts = useCallback((products: Product[], option: SortOption): Product[] => {
    let sorted = [...products];
    switch (option) {
      case 'newest':
        sorted.sort((a, b) => (a.tags?.includes('new-arrival') === b.tags?.includes('new-arrival') ? 0 : a.tags?.includes('new-arrival') ? -1 : 1));
        break;
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'featured':
      default:
        sorted.sort((a, b) => (a.tags?.includes('best-seller') === b.tags?.includes('best-seller') ? 0 : a.tags?.includes('best-seller') ? -1 : 1));
        break;
    }
    return sorted;
  }, []);
  
  useEffect(() => {
    setCurrentProducts(sortProducts(productsInCategory, sortOption));
  }, [sortOption, productsInCategory, sortProducts]);


  const handleApplyFilters = (filters: SelectedFilters) => {
    console.log("Applying filters (mock):", filters);
    // In a real app, filter `productsInCategory` based on `filters`
    // then sort the result using `sortProducts(filtered, sortOption)`
    // For demo, let's shuffle or take a slice to show change
    // This mock logic will be improved when we wire up actual filtering
    const mockFiltered = [...productsInCategory]
      .filter(p => {
        let pass = true;
        if (filters.priceRange) {
          pass = pass && p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1];
        }
        if (filters.colors.length > 0) {
          pass = pass && p.colors?.some(c => filters.colors.includes(c));
        }
        // Add more filter conditions here
        return pass;
      })
      .sort(() => 0.5 - Math.random()) // Mock: shuffle to show change
      .slice(0, Math.max(5, productsInCategory.length - Math.floor(Math.random() * 5))); // Mock: reduce count

    setCurrentProducts(sortProducts(mockFiltered, sortOption)); // Apply current sort to mock filtered
  };

  const handleClearFilters = () => {
    console.log("Clearing filters");
    setCurrentProducts(sortProducts(productsInCategory, sortOption)); // Reset to original, sorted by current option
  };

  return (
    <>
      <QuickViewModal 
        product={quickViewProduct} 
        isOpen={!!quickViewProduct} 
        onClose={handleCloseQuickView} 
      />
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: category.name }]} />
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">{category.name} Collection</h1>
          <p className="text-lg text-muted-foreground">
            Explore our wide range of {category.name.toLowerCase()} clothing and accessories.
          </p>
        </div>
        <Separator />

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="hidden lg:block lg:w-1/4 xl:w-1/5 sticky top-24 self-start">
            <FilterSidebar 
              currentCategorySlug={category.slug} 
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />
          </div>

          <div className="lg:w-3/4 xl:w-4/5">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <p className="text-muted-foreground text-sm">
                Showing {displayedProducts.length} of {currentProducts.length} products
              </p>

              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">
                      <Filter size={16} className="mr-2" /> Filters & Sort
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col">
                    <SheetHeader className="p-4 border-b flex flex-row justify-between items-center">
                      <SheetTitle className="text-xl text-primary">Filters</SheetTitle>
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <X className="h-5 w-5" />
                          <span className="sr-only">Close</span>
                        </Button>
                      </SheetClose>
                    </SheetHeader>
                    <div className="flex-grow overflow-y-auto">
                      <FilterSidebar 
                        currentCategorySlug={category.slug}
                        onApplyFilters={(filters) => {
                          handleApplyFilters(filters);
                          // Potentially close sheet here: document.querySelector('[data-radix-dialog-close]')?.click();
                        }}
                        onClearFilters={handleClearFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Avg. Customer Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {displayedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onOpenQuickView={handleOpenQuickView}/>
                ))}
              </div>
            ) : !loadingMore && currentProducts.length === 0 ? ( 
              <div className="text-center py-10">
                <p className="text-xl text-muted-foreground">No products found matching your criteria.</p>
              </div>
            ) : null }

            {loadingMore && (
              <div className="flex justify-center py-6">
                <Button variant="outline" disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading more...
                </Button>
              </div>
            )}
            {!hasMore && displayedProducts.length > 0 && currentProducts.length > itemsPerPage && (
               <div className="text-center py-6 text-muted-foreground">
                  You've reached the end of the products.
               </div>
            )}
             {!hasMore && displayedProducts.length > 0 && displayedProducts.length === currentProducts.length && currentProducts.length > 0 && (
               <div className="text-center py-6 text-muted-foreground">
                  All {currentProducts.length} product(s) shown.
               </div>
             )}
          </div>
        </div>
      </div>
    </>
  );
}
