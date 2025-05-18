
"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, Users, BarChart3, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, getDocs,getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface StatData {
  products: number;
  orders: number;
  customers: number;
  revenue: string; // Keep as string for mock or simplified total
}

export default function AdminDashboardPage() {
  const [statsData, setStatsData] = useState<StatData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const productsCollection = collection(db, "products");
        const ordersCollection = collection(db, "orders");
        const usersCollection = collection(db, "users");

        const productsSnapshot = await getCountFromServer(productsCollection);
        const ordersSnapshot = await getCountFromServer(ordersCollection);
        const usersSnapshot = await getCountFromServer(usersCollection);
        
        // For revenue, sum totalAmount from all orders for now
        let totalRevenue = 0;
        const allOrdersSnapshot = await getDocs(ordersCollection);
        allOrdersSnapshot.forEach(doc => {
            totalRevenue += doc.data().totalAmount || 0;
        });


        setStatsData({
          products: productsSnapshot.data().count,
          orders: ordersSnapshot.data().count,
          customers: usersSnapshot.data().count,
          revenue: `KSh ${totalRevenue.toLocaleString()}`, // Example of total revenue
        });
      } catch (error) {
        console.error("Error fetching admin dashboard stats:", error);
        // Set mock data on error or handle appropriately
        setStatsData({ products: 0, orders: 0, customers: 0, revenue: 'KSh 0' });
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  const stats = [
    { title: 'Total Products', value: statsData?.products, icon: Package, href: '/admin/products', color: 'text-blue-500' },
    { title: 'Total Orders', value: statsData?.orders, icon: ShoppingCart, href: '/admin/orders', color: 'text-green-500' },
    { title: 'Total Customers', value: statsData?.customers, icon: Users, href: '/admin/customers', color: 'text-purple-500' },
    { title: 'Total Revenue', value: statsData?.revenue, icon: BarChart3, href: '/admin/analytics', color: 'text-orange-500' }, // Changed from Monthly to Total
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold text-foreground">{stat.value === undefined ? 'N/A' : stat.value}</div>
              )}
              <Button variant="link" asChild className="p-0 h-auto text-xs text-accent hover:underline mt-1">
                <Link href={stat.href}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Recent Activity (Placeholder)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground"> (Activity feed placeholder) </p>
            <ul className="space-y-2 text-sm">
              <li>New order #ORD123 placed.</li>
              <li>User 'Amina W.' registered.</li>
              <li>Product 'Leather Jacket' stock updated.</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <Button asChild variant="outline"><Link href="/admin/products/new">Add New Product</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/orders">Manage Orders</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/settings">Site Settings</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
