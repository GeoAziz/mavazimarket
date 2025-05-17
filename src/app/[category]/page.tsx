
import { ProductCard } from '@/components/products/ProductCard';
import { FilterSidebar } from '@/components/products/FilterSidebar';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { mockProducts, mockCategories } from '@/lib/mock-data';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Filter, X } from 'lucide-react';

export async function generateStaticParams() {
  return mockCategories.map((category) => ({
    category: category.slug,
  }));
}

interface CategoryPageProps {
  params: { category: string };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const categorySlug = params.category;
  const category = mockCategories.find(c => c.slug === categorySlug);

  if (!category) {
    // Or redirect to a 404 page
    return <div className="text-center py-10">Category not found.</div>;
  }

  const productsInCategory: Product[] = mockProducts.filter(
    (product) => product.category === category.id
  );

  // Simple pagination (mock)
  const itemsPerPage = 9;
  const totalPages = Math.ceil(productsInCategory.length / itemsPerPage);
  const currentPage = 1; // For UI demonstration
  const paginatedProducts = productsInCategory.slice(0, itemsPerPage);


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
        {/* Filter Sidebar for Desktop */}
        <div className="hidden lg:block lg:w-1/4 xl:w-1/5">
           <FilterSidebar currentCategorySlug={category.slug} />
        </div>

        {/* Products Grid */}
        <div className="lg:w-3/4 xl:w-4/5">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <p className="text-muted-foreground text-sm">Showing {paginatedProducts.length} of {productsInCategory.length} products</p>
            
            {/* Mobile Filter Trigger */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Filter size={16} className="mr-2" /> Filters
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
                    <FilterSidebar currentCategorySlug={category.slug} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Select defaultValue="featured">
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

          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xl text-muted-foreground">No products found in this category yet.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 space-x-2">
              <Button variant="outline" disabled={currentPage === 1}>Previous</Button>
              {[...Array(totalPages)].map((_, i) => (
                <Button key={i + 1} variant={currentPage === i + 1 ? 'default' : 'outline'}>
                  {i + 1}
                </Button>
              ))}
              <Button variant="outline" disabled={currentPage === totalPages}>Next</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
