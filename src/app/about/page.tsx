
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Card, CardContent } from '@/components/ui/card';
import { Shirt, Globe, Users, Heart } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AboutUsPage() {
  return (
    <div className="space-y-16 pb-24">
      <Breadcrumbs items={[{ label: 'Our Story' }]} />
      
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <h1 className="text-5xl md:text-7xl font-heading text-secondary leading-tight">
          Heritage Inspired. <br />
          <span className="text-primary">Modern Crafted.</span>
        </h1>
        <div className="h-1.5 w-32 bg-accent mx-auto rounded-full"></div>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Founded in the heart of Nairobi, Mavazi Market is more than a fashion destination. 
          We are a bridge between ancestral craftsmanship and the contemporary pace of the modern Kenyan soul.
        </p>
      </section>

      <div className="relative aspect-[21/9] w-full rounded-[2rem] overflow-hidden shadow-2xl">
        <Image 
          src="https://picsum.photos/seed/mavazi-story/1600/700" 
          alt="Mavazi Market Workshop" 
          fill 
          className="object-cover"
          data-ai-hint="nairobi city fashion"
        />
        <div className="absolute inset-0 bg-secondary/40 flex items-center justify-center">
          <p className="text-white font-heading text-3xl md:text-5xl tracking-widest uppercase">The Soul of Nairobi</p>
        </div>
      </div>

      <section className="grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <h2 className="text-4xl font-heading text-secondary">The Weaver's Vision</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Mavazi Market began with a single question: Why should high-end Afrocentric style be a luxury for the few? 
            We set out to create a marketplace that honors traditional silhouettes—from the vibrant Kitenge patterns 
            to the intricate beadwork of the Rift Valley—while making them accessible for the daily lives of bold individuals.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-primary/5 rounded-2xl border-2 border-primary/10">
              <p className="text-3xl font-heading text-primary">100%</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-secondary/60">Kenyan Designed</p>
            </div>
            <div className="p-6 bg-secondary/5 rounded-2xl border-2 border-secondary/10">
              <p className="text-3xl font-heading text-secondary">15+</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-secondary/60">Local Artisans</p>
            </div>
          </div>
        </div>
        <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl">
          <Image 
            src="https://picsum.photos/seed/artisan/800/800" 
            alt="Artisan at work" 
            fill 
            className="object-cover"
            data-ai-hint="weaving fabric"
          />
        </div>
      </section>

      <section className="bg-secondary text-white rounded-[3rem] p-12 md:p-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 grid md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <Globe className="h-12 w-12 text-accent mx-auto" />
            <h3 className="text-2xl font-heading">Global Quality</h3>
            <p className="text-white/60 text-sm leading-relaxed">Export-standard finishing on every piece, ensuring your heritage lasts for generations.</p>
          </div>
          <div className="space-y-4 border-y md:border-y-0 md:border-x border-white/10 py-12 md:py-0">
            <Users className="h-12 w-12 text-accent mx-auto" />
            <h3 className="text-2xl font-heading">Community Rooted</h3>
            <p className="text-white/60 text-sm leading-relaxed">Direct support for local workshops, keeping skills alive within our borders.</p>
          </div>
          <div className="space-y-4">
            <Heart className="h-12 w-12 text-accent mx-auto" />
            <h3 className="text-2xl font-heading">Authentic Soul</h3>
            <p className="text-white/60 text-sm leading-relaxed">Designs that don't just look African—they feel like the path you walk every day.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
