
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
import { Home, Package, ShoppingBag, Users, Settings, BarChart3, LogOut, Palette, Shirt } from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
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
    <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/admin" className="text-xl font-bold text-primary group-data-[collapsible=icon]:hidden">
          Mavazi<span className="text-accent">Admin</span>
        </Link>
         <Link href="/admin" className="text-xl font-bold text-primary hidden group-data-[collapsible=icon]:block">
          M<span className="text-accent">A</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {adminNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              {item.subItems ? (
                <SidebarGroup>
                  <SidebarGroupLabel className="flex items-center">
                    <item.icon size={18} className="mr-2" /> {item.label}
                  </SidebarGroupLabel>
                    {item.subItems.map(subItem => (
                      <Link href={subItem.href} key={subItem.label} passHref legacyBehavior>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === subItem.href || pathname.startsWith(`${subItem.href}/`)}
                          className={cn(
                            "pl-8",
                            (pathname === subItem.href || pathname.startsWith(`${subItem.href}/`)) && 'bg-sidebar-accent text-sidebar-accent-foreground'
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
                      (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`))) && 'bg-sidebar-accent text-sidebar-accent-foreground'
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
      <SidebarFooter className="p-2 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
             <Link href="/" passHref legacyBehavior>
              <SidebarMenuButton asChild tooltip="Logout (Back to Store for now)">
                <a><LogOut size={18} className="mr-2 shrink-0" /><span>Logout</span></a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
