
"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, Users, BarChart3, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, getDocs, getCountFromServer, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatKSh } from '@/lib/utils';

interface StatData {
  products: number;
  orders: number;
  customers: number;
  revenue: number;
}

export default function AdminDashboardPage() {
  const [statsData, setStatsData] = useState<StatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        if (!db) return;

        const productsCollection = collection(db, "products");
        const ordersCollection = collection(db, "orders");
        const usersCollection = collection(db, "users");

        const [productsSnapshot, ordersSnapshot, usersSnapshot] = await Promise.all([
          getCountFromServer(productsCollection),
          getCountFromServer(ordersCollection),
          getCountFromServer(usersCollection)
        ]);
        
        let totalRevenue = 0;
        const allOrdersSnapshot = await getDocs(ordersCollection);
        allOrdersSnapshot.forEach(doc => {
            totalRevenue += doc.data().totalAmount || 0;
        });

        setStatsData({
          products: productsSnapshot.data().count,
          orders: ordersSnapshot.data().count,
          customers: usersSnapshot.data().count,
          revenue: totalRevenue,
        });

        // Fetch recent orders for the activity feed
        const recentOrdersQuery = query(ordersCollection, orderBy("orderDate", "desc"), limit(5));
        const recentSnap = await getDocs(recentOrdersQuery);
        setRecentOrders(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      } catch (error) {
        console.error("Error fetching admin dashboard stats:", error);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  const stats = [
    { title: 'Total Revenue', value: statsData ? formatKSh(statsData.revenue) : 'KSh 0', icon: BarChart3, href: '/admin/analytics', color: 'text-orange-500', trend: '+12.5% from last month' },
    { title: 'Total Orders', value: statsData?.orders, icon: ShoppingCart, href: '/admin/orders', color: 'text-green-500', trend: 'Lifetime volume' },
    { title: 'Total Designs', value: statsData?.products, icon: Package, href: '/admin/products', color: 'text-blue-500', trend: 'Active heritage pieces' },
    { title: 'Total Community', value: statsData?.customers, icon: Users, href: '/admin/customers', color: 'text-purple-500', trend: 'Registered members' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-heading text-secondary mb-2">Heritage Command</h1>
          <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Platform Overview & Logistics</p>
        </div>
        <Button className="bg-primary text-white font-bold tracking-widest" asChild>
          <Link href="/admin/products/new"><Package className="mr-2 h-4 w-4"/> ADD NEW DESIGN</Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg border-none hover:shadow-xl transition-all duration-300 group overflow-hidden bg-card">
            <div className="h-1 w-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full bg-secondary/5 group-hover:bg-primary/10 transition-colors`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary/20" />
              ) : (
                <>
                  <div className="text-3xl font-heading text-secondary mb-1">{stat.value === undefined ? 'N/A' : stat.value}</div>
                  <div className="flex items-center text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    {stat.trend}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-2 shadow-xl border-none rounded-2xl overflow-hidden">
          <CardHeader className="bg-secondary text-white p-6">
            <CardTitle className="text-xl font-heading flex items-center">
              <ShoppingCart className="mr-3 text-primary" size={20} /> Recent Logistics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length > 0 ? (
              <div className="divide-y divide-primary/5">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-6 hover:bg-primary/5 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary font-bold text-xs uppercase">
                        #{order.id.substring(0,4)}
                      </div>
                      <div>
                        <p className="font-bold text-secondary text-sm">{order.shippingAddress?.street?.substring(0,20)}...</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {new Date(order.orderDate?.toDate ? order.orderDate.toDate() : order.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-primary font-bold">{formatKSh(order.totalAmount)}</p>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        order.status === 'Delivered' ? 'border-green-200 text-green-600 bg-green-50' : 
                        'border-primary/20 text-primary bg-primary/5'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-heading text-lg">No recent activity found.</p>
              </div>
            )}
            <div className="p-4 bg-secondary/5 text-center">
              <Button variant="link" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-accent" asChild>
                <Link href="/admin/orders">View All Logistics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-none rounded-2xl overflow-hidden bg-card">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-heading text-secondary">Quick Curation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0">
            <Button variant="outline" className="w-full h-14 justify-start border-2 border-primary/10 hover:border-primary text-secondary font-bold tracking-widest group" asChild>
              <Link href="/admin/products/new">
                <Package className="mr-3 h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                NEW HERITAGE DESIGN
              </Link>
            </Button>
            <Button variant="outline" className="w-full h-14 justify-start border-2 border-primary/10 hover:border-primary text-secondary font-bold tracking-widest group" asChild>
              <Link href="/admin/categories/new">
                <TrendingUp className="mr-3 h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                CREATE COLLECTION
              </Link>
            </Button>
            <Button variant="outline" className="w-full h-14 justify-start border-2 border-primary/10 hover:border-primary text-secondary font-bold tracking-widest group" asChild>
              <Link href="/admin/settings">
                <Users className="mr-3 h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                SITE SETTINGS
              </Link>
            </Button>
            
            <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">Stock Watch</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Low stock items</span>
                  <span className="font-bold text-secondary">0 (Mock)</span>
                </div>
                <div className="h-1 w-full bg-secondary/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-full opacity-20"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
