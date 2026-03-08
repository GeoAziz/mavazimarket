
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube, ArrowUpRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-auto border-t-8 border-primary">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Identity */}
          <div className="space-y-6">
            <h3 className="text-3xl font-heading text-background">MAVAZI<span className="text-primary ml-1">MARKET</span></h3>
            <p className="text-sm text-background/70 leading-relaxed max-w-xs">
              Kenya's authentic destination for bold, heritage-inspired fashion. We celebrate our roots through every stitch and silhouette.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, idx) => (
                <Link key={idx} href="#" className="h-10 w-10 rounded-full border border-background/20 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300">
                  <Icon size={18} className="text-background" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Groups */}
          <div>
            <h4 className="text-sm uppercase tracking-[0.2em] font-bold text-primary mb-8">Collections</h4>
            <ul className="space-y-4 text-sm font-medium">
              {['Men\'s Heritage', 'Women\'s Elegance', 'Kids\' Discovery', 'Limited Editions'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-background/60 hover:text-background transition-colors flex items-center group">
                    {item} <ArrowUpRight size={14} className="ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-[0.2em] font-bold text-primary mb-8">Support</h4>
            <ul className="space-y-4 text-sm font-medium">
              {['Shipping Policy', 'Returns & Exchanges', 'Our Workshops', 'Contact Advisor'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-background/60 hover:text-background transition-colors flex items-center group">
                    {item} <ArrowUpRight size={14} className="ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-sm uppercase tracking-[0.2em] font-bold text-primary mb-8">Join the Story</h4>
            <p className="text-xs text-background/60">Subscribe for early access to limited heritage drops.</p>
            <div className="flex flex-col space-y-3">
              <Input type="email" placeholder="Email Address" className="bg-background/5 border-background/20 text-background placeholder:text-background/30 rounded-lg h-12" />
              <Button className="w-full bg-primary text-white font-bold h-12 tracking-widest hover:bg-primary/90 transition-all">SUBSCRIBE</Button>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-background/40 font-bold">
          <p>&copy; {new Date().getFullYear()} MAVAZI MARKET LTD.</p>
          <div className="flex space-x-8">
            <Link href="/privacy-policy" className="hover:text-background">Privacy</Link>
            <Link href="/terms-of-service" className="hover:text-background">Terms</Link>
            <Link href="#" className="hover:text-background">Accessibility</Link>
          </div>
          <p>Handcrafted in Nairobi, Kenya</p>
        </div>
      </div>
    </footer>
  );
}
