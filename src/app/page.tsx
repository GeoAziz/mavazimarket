
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import type { Product, Category as CategoryType } from '@/lib/types';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { QuickViewModal } from '@/components/products/QuickViewModal';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state


export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const productsRef = collection(db, "products");
        
        // Fetch featured products (e.g., tagged with 'best-seller' or 'new-arrival', limit 8)
        const featuredQuery = query(productsRef, where("tags", "array-contains-any", ["best-seller", "new-arrival"]), limit(8));
        const featuredSnapshot = await getDocs(featuredQuery);
        const featured = featuredSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setFeaturedProducts(featured);

        // Fetch new arrivals (e.g., tagged with 'new-arrival', limit 4)
        // For more accurate "newest", you'd sort by a 'createdAt' timestamp if available
        const newArrivalsQuery = query(productsRef, where("tags", "array-contains", "new-arrival"), limit(4));
        const newArrivalsSnapshot = await getDocs(newArrivalsQuery);
        const arrivals = newArrivalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setNewArrivals(arrivals.length > 0 ? arrivals : featured.slice(0,4)); // Fallback if no specific new arrivals
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      setLoadingProducts(false);
    };

    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const categoriesRef = collection(db, "categories");
        const categoriesSnapshot = await getDocs(categoriesRef);
        const cats = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CategoryType));
        setCategories(cats);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
      setLoadingCategories(false);
    };

    fetchProducts();
    fetchCategories();
  }, []);

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
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="relative h-[60vh] md:h-[70vh] w-full rounded-xl overflow-hidden shadow-2xl">
          <Image
            src="https://placehold.co/1600x900.png" // Replace with dynamic image if needed
            alt="Hero Banner - Latest Collections"
            fill
            style={{objectFit:"cover"}}
            priority
            data-ai-hint="fashion models runway"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-6">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-md">
              Discover Your Style
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl drop-shadow-sm">
              Explore the freshest collections for men, women, and kids. Quality fashion, uniquely Kenyan.
            </p>
            <div className="space-x-2 md:space-x-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 py-6 text-lg transition-all ease-in-out duration-300 hover:scale-105" asChild>
                <Link href="/#featured-products">Shop Now</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Category Highlights Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-10 text-primary">Shop by Category</h2>
          {loadingCategories ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1,2,3].map(i => <Skeleton key={i} className="h-64 w-full rounded-lg" />)}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {categories.map((category) => (
                <Link key={category.id} href={`/${category.slug}`} className="group">
                  <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 rounded-lg">
                    <CardHeader className="p-0">
                      <div className="aspect-video relative">
                        <Image
                          src={category.image || 'https://placehold.co/400x300.png'}
                          alt={category.name}
                          fill
                          style={{objectFit:"cover"}}
                          className="group-hover:scale-105 transition-transform duration-300"
                          data-ai-hint={category.dataAiHint || 'fashion category'}
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300"></div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 bg-background">
                      <CardTitle className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Explore all {category.name.toLowerCase()} products</p>
                      <Button variant="link" className="text-accent p-0 mt-2 h-auto group-hover:underline">
                        View Collection <ChevronRight size={16} className="ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No categories found.</p>
          )}
        </section>

        {/* Featured Products Section */}
        <section id="featured-products">
          <h2 className="text-3xl font-bold text-center mb-10 text-primary">Featured Products</h2>
          {loadingProducts ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-lg" />)}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onOpenQuickView={handleOpenQuickView} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No featured products available at the moment.</p>
          )}
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full px-8 py-3 text-lg transition-all ease-in-out duration-300" asChild>
              {/* This should ideally link to a page showing all products, perhaps /products or a main category */}
              <Link href="/men">View All Products</Link>
            </Button>
          </div>
        </section>

        {/* New Arrivals Section */}
        <section id="new-arrivals">
          <h2 className="text-3xl font-bold text-center mb-10 text-primary">New Arrivals</h2>
           {loadingProducts ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-lg" />)}
            </div>
          ) : newArrivals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} onOpenQuickView={handleOpenQuickView} />
              ))}
            </div>
          ) : (
             <p className="text-center text-muted-foreground">No new arrivals to show right now. Check back soon!</p>
          )}
        </section>

        {/* AI Style Advisor Teaser */}
        <section className="bg-secondary rounded-xl p-8 md:p-12 text-center shadow-lg">
          <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
          <h2 className="text-3xl font-bold text-primary mb-4">Need Style Advice?</h2>
          <p className="text-lg text-secondary-foreground mb-6 max-w-xl mx-auto">
            Let our AI Style Advisor help you find the perfect look based on your preferences and purchase history.
          </p>
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 transition-all ease-in-out duration-300" asChild>
            <Link href="/style-advisor">Try it Now</Link>
          </Button>
        </section>
      </div>
    </>
  );
}
