
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { Home, Package, ShoppingBag, Users, Settings, BarChart3, LogOut, Palette, Shirt, Layers3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/categories', label: 'Categories', icon: Layers3 },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  {
    label: 'Appearance',
    icon: Palette,
    subItems: [
      { href: '/admin/appearance/themes', label: 'Themes', icon: Shirt },
      { href: '/admin/appearance/customize', label: 'Customize', icon: Settings },
    ]
  },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r border-primary/10 bg-secondary text-secondary-foreground">
      <SidebarHeader className="p-6">
        <Link href="/admin" className="group">
          <h1 className="text-xl font-heading text-background group-data-[collapsible=icon]:hidden">
            MAVAZI<span className="text-primary ml-1">ADMIN</span>
          </h1>
          <h1 className="text-xl font-heading text-primary hidden group-data-[collapsible=icon]:block">
            M<span className="text-background">A</span>
          </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {adminNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              {item.subItems ? (
                <SidebarGroup className="py-2">
                  <SidebarGroupLabel className="flex items-center text-background/40 uppercase tracking-widest text-[10px] font-bold px-4 mb-2">
                    <item.icon size={14} className="mr-2" /> {item.label}
                  </SidebarGroupLabel>
                    {item.subItems.map(subItem => (
                      <Link href={subItem.href} key={subItem.label} passHref legacyBehavior>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === subItem.href || pathname.startsWith(`${subItem.href}/`)}
                          className={cn(
                            "pl-8 text-background/70 hover:text-background hover:bg-primary/10",
                            (pathname === subItem.href || pathname.startsWith(`${subItem.href}/`)) && 'bg-primary text-white hover:bg-primary'
                          )}
                          tooltip={subItem.label}
                        >
                          <a><subItem.icon size={16} className="mr-2 shrink-0" /><span>{subItem.label}</span></a>
                        </SidebarMenuButton>
                      </Link>
                    ))}
                </SidebarGroup>
              ) : (
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`))}
                    className={cn(
                      "text-background/70 hover:text-background hover:bg-primary/10",
                      (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`))) && 'bg-primary text-white hover:bg-primary'
                    )}
                    tooltip={item.label}
                  >
                    <a><item.icon size={18} className="mr-2 shrink-0" /><span>{item.label}</span></a>
                  </SidebarMenuButton>
                </Link>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-background/10">
        <SidebarMenu>
          <SidebarMenuItem>
             <Link href="/" passHref legacyBehavior>
              <SidebarMenuButton asChild className="text-background/50 hover:text-primary transition-colors">
                <a><LogOut size={18} className="mr-2 shrink-0" /><span>Exit to Store</span></a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
