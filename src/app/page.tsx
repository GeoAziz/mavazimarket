import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { mockCategories, mockProducts } from '@/lib/mock-data';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const featuredProducts = mockProducts.filter(p => p.tags?.includes('best-seller') || p.tags?.includes('new-arrival')).slice(0, 8);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] w-full rounded-xl overflow-hidden shadow-2xl">
        <Image
          src="https://placehold.co/1600x900.png"
          alt="Hero Banner - Latest Collections"
          layout="fill"
          objectFit="cover"
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
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 text-lg transition-all ease-in-out duration-300" asChild>
              <Link href="/#featured-products">Shop Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white rounded-full px-8 py-3 text-lg backdrop-blur-sm" asChild>
              <Link href="/#new-arrivals">New Arrivals</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-accent/80 hover:bg-accent text-accent-foreground border-accent rounded-full px-8 py-3 text-lg backdrop-blur-sm" asChild>
              <Link href="/sale">Sale</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Category Highlights Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-10 text-primary">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {mockCategories.map((category) => (
            <Link key={category.id} href={`/${category.slug}`} className="group">
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 rounded-lg">
                <CardHeader className="p-0">
                  <div className="aspect-video relative">
                    <Image
                      src={category.image}
                      alt={category.name}
                      layout="fill"
                      objectFit="cover"
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
      </section>

      {/* Featured Products Section */}
      <section id="featured-products">
        <h2 className="text-3xl font-bold text-center mb-10 text-primary">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full px-8 py-3 text-lg transition-all ease-in-out duration-300" asChild>
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section id="new-arrivals">
        <h2 className="text-3xl font-bold text-center mb-10 text-primary">New Arrivals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {mockProducts.filter(p => p.tags?.includes('new-arrival')).slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
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
  );
}
