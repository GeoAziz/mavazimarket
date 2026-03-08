import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import type { Product, Category as CategoryType } from '@/lib/types';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { HomeClientWrapper } from '@/components/home/HomeClientWrapper';
import placeholderData from '@/app/lib/placeholder-images.json';

async function getFeaturedProducts() {
  if (!db) return [];
  try {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("isPublished", "==", true), limit(8));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

async function getCategories() {
  if (!db) return [];
  try {
    const categoriesRef = collection(db, "categories");
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CategoryType));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();
  const categories = await getCategories();

  return (
    <div className="space-y-16">
      <HomeClientWrapper>
        {/* Hero Section */}
        <section className="relative h-[70vh] md:h-[80vh] w-full rounded-2xl overflow-hidden shadow-2xl bg-secondary">
          <Image
            src={placeholderData.hero.url}
            alt={placeholderData.hero.alt}
            fill
            style={{ objectFit: "cover" }}
            priority
            data-ai-hint={placeholderData.hero.dataAiHint}
            className="opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/40 to-transparent flex flex-col items-start justify-center p-8 md:p-16">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-heading text-background mb-6 leading-tight">
                Authentic Style, <br />
                <span className="text-accent">Afrocentric</span> Soul.
              </h1>
              <p className="text-lg md:text-xl text-background/90 mb-10 max-w-lg font-light leading-relaxed">
                Discover the latest heritage-inspired collections for modern Kenyans. Bold textures, timeless quality.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 py-7 text-lg uppercase tracking-wider font-semibold shadow-lg shadow-primary/20" asChild>
                  <Link href="/#featured-products">Shop Heritage</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-secondary rounded-full px-10 py-7 text-lg uppercase tracking-wider font-semibold" asChild>
                  <Link href="/about">Our Story</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Category Highlights */}
        <section>
          <div className="flex items-end justify-between mb-10">
            <div className="text-left">
              <h2 className="text-4xl font-heading text-secondary mb-2">Shop by Category</h2>
              <div className="h-1 w-24 bg-primary rounded-full"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link key={category.id} href={`/${category.slug}`} className="group">
                <Card className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl">
                  <CardHeader className="p-0">
                    <div className="aspect-[4/5] relative">
                      <Image
                        src={category.image || 'https://placehold.co/400x500.png'}
                        alt={category.name}
                        fill
                        style={{ objectFit: "cover" }}
                        className="group-hover:scale-110 transition-transform duration-700"
                        data-ai-hint={category.dataAiHint || 'fashion model'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent group-hover:from-secondary/60 transition-colors duration-500"></div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <CardTitle className="text-3xl font-heading text-background mb-2">
                          {category.name}
                        </CardTitle>
                        <div className="text-accent flex items-center group-hover:pl-2 transition-all duration-300">
                          Explore Collection <ChevronRight size={20} className="ml-1" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section id="featured-products">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading text-secondary mb-4">Featured Selection</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Handpicked pieces that represent the best of Mavazi Market craftsmanship.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-16">
            <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-full px-12 py-4 text-lg font-bold" asChild>
              <Link href="/men">View All Designs</Link>
            </Button>
          </div>
        </section>

        {/* AI Style Advisor Teaser */}
        <section className="bg-primary rounded-[2rem] p-10 md:p-20 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-accent opacity-20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>
          
          <div className="relative z-10">
            <Sparkles className="mx-auto h-16 w-16 text-accent mb-6" />
            <h2 className="text-4xl md:text-5xl font-heading text-white mb-6">AI Personal Stylist</h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Unlock a tailored shopping experience. Our AI analyzes your heritage and history to suggest pieces that resonate with your unique path.
            </p>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-secondary rounded-full px-12 py-8 text-xl font-bold uppercase tracking-widest shadow-xl" asChild>
              <Link href="/style-advisor">Consult My Advisor</Link>
            </Button>
          </div>
        </section>
      </HomeClientWrapper>
    </div>
  );
}