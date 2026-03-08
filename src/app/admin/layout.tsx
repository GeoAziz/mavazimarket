
"use client"; // Changed to client component for auth check

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// Metadata can still be exported from a client component, but won't be used for static generation in the same way.
// For dynamic titles based on auth, it would be managed within the component itself.
// export const metadata: Metadata = {
// title: 'Mavazi Market - Admin',
// description: 'Admin panel for Mavazi Market',
// };

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { currentUser, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.push('/login?redirect=/admin'); // Redirect to login if not authenticated
      } else if (!isAdmin) {
        router.push('/'); // Redirect to homepage if authenticated but not admin
      }
    }
  }, [currentUser, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading Admin Panel...</p>
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    // This state should ideally be brief due to the redirect,
    // but it's a fallback while redirecting.
    return (
         <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 bg-muted/40">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
