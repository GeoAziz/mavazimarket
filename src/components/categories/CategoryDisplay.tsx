
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
import { useEffect, useState, useCallback, useMemo } from 'react';

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
      setHasMore((prevLength) => prevLength + newProducts.length < currentProducts.length);
      setLoadingMore(false);
    }, 500); 
  }, [loadingMore, hasMore, displayedProducts.length, currentProducts, itemsPerPage]);

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 200 &&
        !loadingMore && hasMore
      ) {
        loadMoreProducts();
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [loadMoreProducts, loadingMore, hasMore]);

  // Sorting logic
  useEffect(() => {
    let sortedProducts = [...productsInCategory]; // Use original full list for sorting/filtering
    switch (sortOption) {
      case 'newest':
        // Assuming products have a date or new-arrival tag, mock sorting for now
        sortedProducts.sort((a, b) => (a.tags?.includes('new-arrival') ? -1 : 1));
        break;
      case 'price-asc':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sortedProducts.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'featured': // Default, or some specific logic
      default:
        // Potentially revert to original order or apply a 'featured' tag sort
        sortedProducts.sort((a, b) => (a.tags?.includes('best-seller') ? -1 : 1));
        break;
    }
    setCurrentProducts(sortedProducts);
  }, [sortOption, productsInCategory]);

  const handleApplyFilters = (filters: SelectedFilters) => {
    console.log("Applying filters (mock):", filters);
    // Mock filtering: For now, just log. In a real app, filter `productsInCategory`
    // and then update `currentProducts`. Example:
    // let filtered = [...productsInCategory];
    // if (filters.colors.length > 0) {
    //   filtered = filtered.filter(p => p.colors?.some(c => filters.colors.includes(c)));
    // }
    // ... other filters ...
    // setCurrentProducts(filtered);
    // For demo, let's just shuffle or take a slice to show change
    setCurrentProducts([...productsInCategory].sort(() => 0.5 - Math.random()).slice(0, 10));
  };

  const handleClearFilters = () => {
    console.log("Clearing filters (mock)");
    setCurrentProducts([...productsInCategory]); // Reset to original sorted by current sortOption
    // Re-apply current sort option
    const currentSort = sortOption;
    setSortOption('featured'); // temporary change to trigger sort useEffect
    setTimeout(() => setSortOption(currentSort),0);
  };


  return (
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
                    <SheetTitle className="text-xl">Filters</SheetTitle>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                      </Button>
                    </SheetClose>
                  </SheetHeader>
                  <div className="flex-grow overflow-y-auto">
                    <FilterSidebar 
                      currentCategorySlug={category.slug}
                      onApplyFilters={handleApplyFilters}
                      onClearFilters={handleClearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
              <SelectTrigger className="w-full sm:w-[180px]">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Adjusted md:grid-cols-2 */}
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : !loadingMore && currentProducts.length === 0 ? ( 
            <div className="text-center py-10">
              <p className="text-xl text-muted-foreground">No products found matching your criteria.</p>
            </div>
          ) : null }

          {loadingMore && (
            <div className="flex justify-center py-4">
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
                All products shown.
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
