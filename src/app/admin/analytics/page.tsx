
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, CalendarDays, DollarSign, Users, TrendingUp, ShoppingCart, Loader2 } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface SalesDataPoint {
  month: string;
  sales: number;
}

const chartConfig = {
  sales: {
    label: "Sales (KSh)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface AdminStats {
    totalRevenue: number;
    totalSales: number;
    newCustomers: number; // This will remain mock for now
    conversionRate: string; // This will remain mock for now
}

export default function AdminAnalyticsPage() {
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        const ordersRef = collection(db, "orders");
        const ordersQuery = query(ordersRef, orderBy("orderDate", "asc"));
        const ordersSnapshot = await getDocs(ordersQuery);

        const monthlySales: { [key: string]: number } = {};
        let totalRevenue = 0;
        let totalSalesCount = 0;

        ordersSnapshot.forEach(doc => {
          const order = doc.data() as Order;
          const date = (order.orderDate as any).toDate ? (order.orderDate as any).toDate() : new Date(order.orderDate);
          const monthYear = format(date, "MMM yyyy");
          
          monthlySales[monthYear] = (monthlySales[monthYear] || 0) + order.totalAmount;
          totalRevenue += order.totalAmount;
          totalSalesCount++;
        });

        const formattedSalesData = Object.entries(monthlySales)
            .map(([month, sales]) => ({ month, sales }))
            .sort((a,b) => parseISO(a.month === "Jan 2024" ? "2024-01-01" : new Date(a.month).toISOString())  // Basic sort, needs improvement for proper date sorting
                        - parseISO(b.month === "Jan 2024" ? "2024-01-01" : new Date(b.month).toISOString())); // Hack for "Jan 2024" string

        setSalesData(formattedSalesData.slice(-6)); // Show last 6 months or available

        // Fetch total customers
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getCountFromServer(usersCollection);


        setStats({
            totalRevenue: totalRevenue,
            totalSales: totalSalesCount,
            newCustomers: usersSnapshot.data().count, // Using total users as proxy for new customers
            conversionRate: "3.5%" // Mock
        });

      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
      setLoading(false);
    };

    fetchAnalyticsData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary flex items-center">
        <BarChart3 size={30} className="mr-3 text-accent" /> Analytics & Reports
      </h1>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_,i) => <Card key={i} className="shadow-md h-32 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary"/></Card>)}
        </div>
      ) : stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">KSh {stats.totalRevenue.toLocaleString()}</div>
              {/* <p className="text-xs text-muted-foreground">+15.2% from last month</p> */}
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">+{stats.totalSales}</div>
              {/* <p className="text-xs text-muted-foreground">+10.1% from last month</p> */}
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">+{stats.newCustomers}</div>
              {/* <p className="text-xs text-muted-foreground">+5% from last month</p> */}
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.conversionRate} (Mock)</div>
              {/* <p className="text-xs text-muted-foreground">+0.2% from last month</p> */}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Sales Overview</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <CalendarDays size={16} />
            <span>{salesData.length > 0 ? `${salesData[0].month} - ${salesData[salesData.length - 1].month}` : 'Recent Months'}</span>
          </div>
        </CardHeader>
        <CardContent className="pl-2">
          {loading ? (
             <div className="h-[300px] w-full flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>
          ) : salesData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `KSh ${value/1000}k`} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                  <Legend />
                  <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">No sales data available for the selected period.</div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">More Analytics Placeholder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This section will display more detailed analytics and reports.</p>
          <p className="mt-2">Content coming soon!</p>
        </CardContent>
      </Card>
    </div>
  );
}
