
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
import { QuickViewModal } from '@/components/products/QuickViewModal';

interface CategoryDisplayProps {
  category: Category;
  productsInCategory: Product[];
}

type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating';

export function CategoryDisplay({ category, productsInCategory }: CategoryDisplayProps) {
  const [allProductsInOriginalCategory] = useState<Product[]>(productsInCategory); // Store original list
  const [filteredAndSortedProducts, setFilteredAndSortedProducts] = useState<Product[]>(productsInCategory);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [activeFilters, setActiveFilters] = useState<SelectedFilters | null>(null);
  const itemsPerPage = 9;

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const handleOpenQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const handleCloseQuickView = () => {
    setQuickViewProduct(null);
  };

  const sortProducts = useCallback((products: Product[], option: SortOption): Product[] => {
    let sorted = [...products];
    switch (option) {
      case 'newest':
        // Assuming products have a 'dateAdded' or similar, or using tags
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
        // Mock "featured" - could be by best-seller tag or a predefined order
        sorted.sort((a, b) => (a.tags?.includes('best-seller') === b.tags?.includes('best-seller') ? 0 : a.tags?.includes('best-seller') ? -1 : 1));
        break;
    }
    return sorted;
  }, []);

  const applyFiltersAndSort = useCallback((filters: SelectedFilters | null, currentSort: SortOption) => {
    let productsToProcess = [...allProductsInOriginalCategory];

    if (filters) {
      productsToProcess = productsToProcess.filter(p => {
        let passPrice = true;
        let passColors = true;
        let passSizes = true;
        let passBrands = true;
        let passMaterials = true;
        let passSubcategories = true;

        if (filters.priceRange) {
          passPrice = p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1];
        }
        if (filters.colors.length > 0) {
          passColors = p.colors?.some(c => filters.colors.includes(c)) ?? false;
        }
        if (filters.sizes.length > 0) {
          passSizes = p.sizes?.some(s => filters.sizes.includes(s)) ?? false;
        }
        if (filters.brands.length > 0) {
          passBrands = p.brand ? filters.brands.includes(p.brand) : false;
        }
        if (filters.materials.length > 0) {
          passMaterials = p.material ? filters.materials.includes(p.material) : false;
        }
        if (filters.subcategories.length > 0 && p.subcategory) {
            const categoryDetails = category.subcategories.find(sc => sc.name === p.subcategory);
            if (categoryDetails) {
                 passSubcategories = filters.subcategories.includes(categoryDetails.slug);
            } else {
                passSubcategories = false;
            }
        }

        return passPrice && passColors && passSizes && passBrands && passMaterials && passSubcategories;
      });
    }
    
    const sorted = sortProducts(productsToProcess, currentSort);
    setFilteredAndSortedProducts(sorted);
    setDisplayedProducts(sorted.slice(0, itemsPerPage));
    setHasMore(sorted.length > itemsPerPage);
  }, [allProductsInOriginalCategory, sortProducts, itemsPerPage, category.subcategories]);


  useEffect(() => {
    applyFiltersAndSort(activeFilters, sortOption);
  }, [sortOption, activeFilters, applyFiltersAndSort]);
  

  const loadMoreProducts = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const currentLength = displayedProducts.length;
    const newProducts = filteredAndSortedProducts.slice(currentLength, currentLength + itemsPerPage);
    
    setTimeout(() => { // Simulate network delay
      setDisplayedProducts((prev) => [...prev, ...newProducts]);
      setHasMore(displayedProducts.length + newProducts.length < filteredAndSortedProducts.length);
      setLoadingMore(false);
    }, 500); 
  }, [loadingMore, hasMore, displayedProducts, filteredAndSortedProducts, itemsPerPage]);

  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 300 &&
        !loadingMore && hasMore
      ) {
        loadMoreProducts();
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [loadMoreProducts, loadingMore, hasMore]);

  const handleApplyFilters = (filters: SelectedFilters) => {
    setActiveFilters(filters);
  };

  const handleClearFilters = () => {
    setActiveFilters(null);
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
                Showing {displayedProducts.length} of {filteredAndSortedProducts.length} products
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
                          // Consider closing the sheet automatically after applying
                          const closeButton = document.querySelector('[data-radix-dialog-close]') as HTMLElement | null;
                          closeButton?.click();
                        }}
                        onClearFilters={() => {
                            handleClearFilters();
                            const closeButton = document.querySelector('[data-radix-dialog-close]') as HTMLElement | null;
                            closeButton?.click();
                        }}
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
            ) : !loadingMore && filteredAndSortedProducts.length === 0 ? ( 
              <div className="text-center py-16">
                <Filter size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">No products found matching your criteria.</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or check back later!</p>
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
            {!hasMore && displayedProducts.length > 0 && filteredAndSortedProducts.length > itemsPerPage && (
               <div className="text-center py-6 text-muted-foreground">
                  You've reached the end of the products.
               </div>
            )}
             {!hasMore && displayedProducts.length > 0 && displayedProducts.length === filteredAndSortedProducts.length && filteredAndSortedProducts.length > 0 && (
               <div className="text-center py-6 text-muted-foreground">
                  All {filteredAndSortedProducts.length} product(s) shown.
               </div>
             )}
          </div>
        </div>
      </div>
    </>
  );
}
