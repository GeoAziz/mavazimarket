
"use client";

import Link from 'next/link';
import { Search, ShoppingCart, User, Menu as MenuIcon, X as XIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useState } from 'react';
import type { NavItem } from '@/lib/types';
import { mockCategories } from '@/lib/mock-data';

const navItems: NavItem[] = [
  ...mockCategories.map(cat => ({
    label: cat.name,
    href: `/${cat.slug}`,
    sublinks: cat.subcategories.map(subcat => ({
      label: subcat.name,
      href: `/${cat.slug}/${subcat.slug}`
    }))
  })),
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
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
            item.sublinks ? (
              <div key={item.label} className="relative group">
                <Link href={item.href} className="text-foreground hover:text-primary transition-colors px-3 py-2 flex items-center">
                  {item.label} <ChevronDown size={16} className="ml-1" />
                </Link>
                <div className="absolute left-0 mt-0 w-48 bg-background border border-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                  {item.sublinks.map(sub => (
                    <Link key={sub.label} href={sub.href} className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground">
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={item.label} href={item.href} className="text-foreground hover:text-primary transition-colors px-3 py-2">
                {item.label}
              </Link>
            )
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
              {/* Optional: Add a badge for cart items count */}
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

                  <nav className="flex-grow overflow-y-auto p-4">
                    <Accordion type="single" collapsible className="w-full">
                      {navItems.map((item) => (
                        item.sublinks ? (
                          <AccordionItem value={item.label} key={item.label}>
                            <AccordionTrigger className="py-3 text-left hover:no-underline">
                              <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="flex-1">{item.label}</Link>
                            </AccordionTrigger>
                            <AccordionContent className="pl-4">
                              {item.sublinks.map(sub => (
                                <Link key={sub.label} href={sub.href} onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-muted-foreground hover:text-primary">
                                  {sub.label}
                                </Link>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        ) : (
                          <Link key={item.label} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="block py-3 font-medium text-foreground hover:text-primary">
                            {item.label}
                          </Link>
                        )
                      ))}
                    </Accordion>
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
