
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, Users, BarChart3 } from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    { title: 'Total Products', value: '150', icon: Package, href: '/admin/products', color: 'text-blue-500' },
    { title: 'Total Orders', value: '320', icon: ShoppingCart, href: '/admin/orders', color: 'text-green-500' },
    { title: 'Total Customers', value: '85', icon: Users, href: '/admin/customers', color: 'text-purple-500' },
    { title: 'Monthly Revenue', value: 'KSh 450,000', icon: BarChart3, href: '/admin/reports', color: 'text-orange-500' },
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
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
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
            <CardTitle className="text-xl">Recent Activity</CardTitle>
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
