
"use client";

import Link from 'next/link';
import { Search, ShoppingCart, User, Menu as MenuIcon, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState } from 'react';
import type { NavItem } from '@/lib/types';
// mockCategories is no longer used directly for top-level nav items

const navItems: NavItem[] = [
  // Categories are removed from top-level navigation
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Sale', href: '/sale'},
  // Consider adding a generic "Shop" or "All Products" link if desired, e.g.:
  // { label: 'Shop', href: '/products' },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-primary">
          Mavazi<span className="text-accent">Market</span>
        </Link>

        {/* Desktop Search Bar - hidden on small screens */}
        <div className="hidden md:flex flex-grow max-w-xl mx-4 relative">
          <Input type="search" placeholder="Search products..." className="pr-10 rounded-full" />
          <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
            <Search className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-4">
          {navItems.map((item) => (
            // Simplified: No sublinks handled here as categories are removed from top nav
            <Link key={item.label} href={item.href} className="text-foreground hover:text-primary transition-colors px-3 py-2">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-3">
          <Link href="/profile" aria-label="User Profile">
            <Button variant="ghost" size="icon">
              <User className="h-6 w-6 text-foreground hover:text-primary" />
            </Button>
          </Link>
          <Link href="/cart" aria-label="Shopping Cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-6 w-6 text-foreground hover:text-primary" />
              {/* <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span> */}
            </Button>
          </Link>
          
          {/* Mobile Menu Trigger */}
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MenuIcon className="h-6 w-6 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background p-0 flex flex-col">
                <SheetHeader className="flex flex-row justify-between items-center p-4 border-b">
                  <SheetTitle asChild>
                    <Link href="/" className="text-xl font-bold text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                      Mavazi<span className="text-accent">Market</span>
                    </Link>
                  </SheetTitle>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                      <XIcon className="h-6 w-6" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetClose>
                </SheetHeader>
                
                <div className="flex-grow flex flex-col">
                  {/* Mobile Search Bar */}
                  <div className="p-4 border-b md:hidden">
                    <div className="relative">
                      <Input type="search" placeholder="Search products..." className="pr-10 rounded-full" />
                      <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                        <Search className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>

                  <nav className="flex-grow overflow-y-auto p-4 space-y-2">
                     {/* Explicitly add category links for mobile if desired */}
                    <Link href="/men" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 font-medium text-foreground hover:text-primary">Men</Link>
                    <Link href="/women" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 font-medium text-foreground hover:text-primary">Women</Link>
                    <Link href="/kids" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 font-medium text-foreground hover:text-primary">Kids</Link>
                    <hr className="my-2"/>
                    {navItems.map((item) => (
                      <Link key={item.label} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="block py-2 font-medium text-foreground hover:text-primary">
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="p-4 border-t mt-auto">
                     <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full mb-2">Login</Button>
                     </Link>
                     <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="default" className="w-full bg-primary hover:bg-primary/90">Sign Up</Button>
                     </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
       {/* Mobile Search Bar - visible on small screens, outside of menu */}
       <div className="md:hidden px-4 pb-3 border-t md:border-none">
          <div className="relative">
            <Input type="search" placeholder="Search products..." className="pr-10 rounded-full" />
            <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
              <Search className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
    </header>
  );
}
