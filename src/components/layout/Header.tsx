
"use client";

import Link from 'next/link';
import { Search, ShoppingCart, User, Menu as MenuIcon, X as XIcon, Sparkles, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { CartDrawer } from '@/components/cart/CartDrawer';
import type { NavItem } from '@/lib/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const navItems: NavItem[] = [
  { label: 'Men', href: '/men' },
  { label: 'Women', href: '/women' },
  { label: 'Kids', href: '/kids' },
  { label: 'Advisor', href: '/style-advisor' },
  { label: 'Sale', href: '/sale' },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const { totalItems } = useCart();
  const [lang, setLang] = useState('EN');

  return (
    <header className="bg-background border-b-2 border-primary/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group">
          <h1 className="text-3xl font-heading text-secondary transition-colors group-hover:text-primary leading-none">
            MAVAZI<span className="text-primary group-hover:text-accent transition-colors ml-1">MARKET</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1 font-bold">Authentic Afrocentric Soul</p>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link 
              key={item.label} 
              href={item.href} 
              className="text-sm uppercase tracking-widest font-bold text-foreground hover:text-primary transition-colors py-2 flex items-center gap-2"
            >
              {item.label === 'Advisor' && <Sparkles size={14} className="text-accent" />}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-2">
          {/* Language Toggle Placeholder */}
          <div className="hidden sm:block mr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-[10px] font-bold tracking-widest gap-1 uppercase">
                  <Globe size={14} className="text-primary" /> {lang}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLang('EN')}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang('SW')}>Kiswahili (Soon)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden md:flex relative mr-4">
            <Input type="search" placeholder="Search heritage..." className="w-48 lg:w-64 h-10 bg-secondary/5 border-none focus-visible:ring-primary/20 rounded-full pl-10 text-xs" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
              <User className="h-5 w-5 text-secondary" />
            </Button>
          </Link>

          <Button 
            variant="ghost" 
            size="icon" 
            className="relative rounded-full hover:bg-primary/10"
            onClick={() => setIsCartDrawerOpen(true)}
          >
            <ShoppingCart className="h-5 w-5 text-secondary" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-lg">
                {totalItems}
              </span>
            )}
          </Button>
          
          <CartDrawer isOpen={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />
          
          {/* Mobile Menu Trigger */}
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MenuIcon className="h-6 w-6 text-secondary" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px] border-l-4 border-primary">
                <SheetHeader className="pb-8">
                  <SheetTitle className="text-left font-heading text-3xl">MENU</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-6">
                  {navItems.map((item) => (
                    <Link 
                      key={item.label} 
                      href={item.href} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-2xl font-heading text-secondary hover:text-primary transition-colors flex items-center gap-3"
                    >
                      {item.label}
                      {item.label === 'Advisor' && <Sparkles className="text-accent" />}
                    </Link>
                  ))}
                </nav>
                <div className="mt-12 pt-8 border-t border-primary/10 space-y-4">
                  <Button variant="outline" className="w-full py-6 text-lg border-primary text-primary" asChild>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>SIGN IN</Link>
                  </Button>
                  <Button className="w-full py-6 text-lg bg-primary text-white" asChild>
                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>JOIN COMMUNITY</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
