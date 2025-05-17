import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Store } from 'lucide-react';
import Image from 'next/image';

export default function AboutUsPage() {
  return (
    <div className="space-y-10">
      <Breadcrumbs items={[{ label: 'About Us' }]} />
      
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">
          About Mavazi<span className="text-accent">Market</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Your premier destination for contemporary fashion in Kenya. We bring you the latest trends and timeless classics for men, women, and children, blending quality with affordability.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <Image 
            src="https://placehold.co/800x600.png" 
            alt="Mavazi Market Team" 
            width={800} 
            height={600} 
            className="rounded-xl shadow-lg"
            data-ai-hint="diverse team working"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-primary">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed">
            Mavazi Market was born from a passion for fashion and a desire to make stylish, high-quality clothing accessible to everyone in Kenya. We believe that what you wear is a powerful form of self-expression, and we're here to provide you with the pieces that tell your unique story.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            From bustling city streets to serene landscapes, Kenya's vibrant culture inspires our collections. We curate items that are not only on-trend but also comfortable and durable, perfect for your everyday life and special occasions.
          </p>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 text-center">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <Store size={48} className="mx-auto text-accent mb-3" />
            <CardTitle className="text-2xl font-semibold text-primary">Our Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We offer a diverse range of apparel and accessories, carefully selected to meet the varied tastes and needs of our customers. From local Kenyan designs to international trends, find your perfect fit with us.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <Target size={48} className="mx-auto text-accent mb-3" />
            <CardTitle className="text-2xl font-semibold text-primary">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To empower individuals through fashion by providing an inspiring, convenient, and enjoyable shopping experience, with a focus on quality, style, and customer satisfaction.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <Users size={48} className="mx-auto text-accent mb-3" />
            <CardTitle className="text-2xl font-semibold text-primary">Our Community</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We are more than just a store; we are a community of fashion lovers. We are committed to supporting local designers and promoting sustainable practices within the Kenyan fashion industry.
            </p>
          </CardContent>
        </Card>
      </section>
      
      <section className="text-center py-10 bg-secondary rounded-xl">
          <h2 className="text-3xl font-bold text-primary mb-4">Join Our Journey</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Follow us on social media and subscribe to our newsletter to stay updated on new arrivals, exclusive offers, and fashion tips.
          </p>
          {/* Social media links can be added here */}
      </section>

    </div>
  );
}
