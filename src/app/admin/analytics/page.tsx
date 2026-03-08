
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, CalendarDays, DollarSign, Users, TrendingUp, ShoppingCart, Loader2 } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, getCountFromServer, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/lib/types';
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { DateRangePicker } from '@/components/ui/date-range-picker'; // Assuming you have this or similar
import type { DateRange } from 'react-day-picker';

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
    totalCustomers: number;
    conversionRate: string; 
}

export default function AdminAnalyticsPage() {
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const endDate = new Date();
    const startDate = subMonths(endDate, 5); // Default to last 6 months (5 months back + current month)
    return { from: startOfMonth(startDate), to: endOfMonth(endDate) };
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!dateRange || !dateRange.from || !dateRange.to) {
        setLoadingStats(false);
        setLoadingChart(false);
        return;
      }

      setLoadingStats(true);
      setLoadingChart(true);

      try {
        const ordersRef = collection(db, "orders");
        // Base query for orders within the date range
        const ordersQuery = query(
          ordersRef,
          where("orderDate", ">=", Timestamp.fromDate(dateRange.from)),
          where("orderDate", "<=", Timestamp.fromDate(dateRange.to)),
          orderBy("orderDate", "asc")
        );
        
        const ordersSnapshot = await getDocs(ordersQuery);

        const monthlySales: { [key: string]: number } = {};
        let currentRangeTotalRevenue = 0;
        let currentRangeTotalSalesCount = 0;

        ordersSnapshot.forEach(doc => {
          const order = doc.data() as Order;
          // Ensure orderDate is a Date object
          const orderDateTimestamp = order.orderDate as any;
          const date = orderDateTimestamp.toDate ? orderDateTimestamp.toDate() : new Date(orderDateTimestamp);
          
          const monthYear = format(date, "MMM yyyy");
          
          monthlySales[monthYear] = (monthlySales[monthYear] || 0) + order.totalAmount;
          currentRangeTotalRevenue += order.totalAmount;
          currentRangeTotalSalesCount++;
        });

        const formattedSalesData = Object.entries(monthlySales)
            .map(([month, sales]) => ({ month, sales }))
            .sort((a, b) => parseISO(new Date(a.month).toISOString()) - parseISO(new Date(b.month).toISOString()));

        setSalesData(formattedSalesData);
        setLoadingChart(false);

        // Fetch total customers (not filtered by date range)
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getCountFromServer(usersCollection);

        setStats({
            totalRevenue: currentRangeTotalRevenue,
            totalSales: currentRangeTotalSalesCount,
            totalCustomers: usersSnapshot.data().count, 
            conversionRate: "3.5%" // Mock - Explain this limitation
        });

      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setSalesData([]);
        setStats({ totalRevenue: 0, totalSales: 0, totalCustomers: 0, conversionRate: "N/A" });
      }
      setLoadingStats(false);
      setLoadingChart(false); // Ensure chart loading also stops on error
    };

    fetchAnalyticsData();
  }, [dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <BarChart3 size={30} className="mr-3 text-accent" /> Analytics & Reports
        </h1>
        <DateRangePicker
            initialDateFrom={dateRange?.from}
            initialDateTo={dateRange?.to}
            onUpdate={(values) => {
              if (values.range.from && values.range.to) {
                setDateRange({ from: values.range.from, to: values.range.to });
              } else if (values.range.from && !values.range.to) {
                setDateRange({ from: values.range.from, to: values.range.from }); // Single day selection
              } else {
                setDateRange(undefined); // Or handle as needed
              }
            }}
            align="end"
            locale="en-GB"
            showCompare={false}
         />
      </div>

      {loadingStats ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_,i) => <Card key={i} className="shadow-md h-32 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary"/></Card>)}
        </div>
      ) : stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue (Selected Range)</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">KSh {stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sales (Selected Range)</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">+{stats.totalSales}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">+{stats.totalCustomers}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.conversionRate}</div>
               <p className="text-xs text-muted-foreground">(Mock - Requires visitor tracking)</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Sales Overview</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <CalendarDays size={16} />
            <span>
              {dateRange?.from && dateRange.to 
                ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}` 
                : 'Select date range'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pl-2">
          {loadingChart ? (
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
          <p className="mt-2">Popular products, customer demographics, etc. (Coming Soon)</p>
        </CardContent>
      </Card>
    </div>
  );
}
