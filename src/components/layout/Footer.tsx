import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">Mavazi<span className="text-accent">Market</span></h3>
            <p className="text-sm mb-4">
              Discover the latest trends in fashion. Quality clothing for men, women, and kids, delivered to your doorstep in Kenya.
            </p>
            <div className="flex space-x-3">
              <Link href="#" aria-label="Facebook" className="text-secondary-foreground hover:text-primary transition-colors">
                <Facebook size={24} />
              </Link>
              <Link href="#" aria-label="Instagram" className="text-secondary-foreground hover:text-primary transition-colors">
                <Instagram size={24} />
              </Link>
              <Link href="#" aria-label="Twitter" className="text-secondary-foreground hover:text-primary transition-colors">
                <Twitter size={24} />
              </Link>
              <Link href="#" aria-label="Youtube" className="text-secondary-foreground hover:text-primary transition-colors">
                <Youtube size={24} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/profile" className="hover:text-primary transition-colors">My Account</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping Info</Link></li>
              <li><Link href="/returns" className="hover:text-primary transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Stay Updated</h4>
            <p className="text-sm mb-3">Subscribe to our newsletter for the latest collections and offers.</p>
            <form className="flex space-x-2">
              <Input type="email" placeholder="Enter your email" className="bg-background text-foreground placeholder-muted-foreground" />
              <Button type="submit" variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">Subscribe</Button>
            </form>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border/50 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Mavazi Market. All rights reserved.</p>
          <p className="mt-1">Designed for the Kenyan Fashion Enthusiast.</p>
        </div>
      </div>
    </footer>
  );
}

// Placeholder pages for links (can be created later)
// /faq, /shipping, /returns, /privacy-policy, /terms-of-service
