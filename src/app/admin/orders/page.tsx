
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Search, FileDown } from 'lucide-react';
import { mockOrders } from '@/lib/mock-data';
import type { Order } from '@/lib/types';

export default function AdminOrdersPage() {
  const orders: Order[] = mockOrders; // In a real app, fetch this data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <ShoppingCart size={30} className="mr-3 text-accent" /> Manage Orders
        </h1>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <FileDown size={20} className="mr-2" /> Export Orders
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Order List</CardTitle>
          <div className="mt-4 relative">
            <Input type="search" placeholder="Search orders (ID, customer, status...)" className="pl-10 w-full md:w-1/2" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Total (KSh)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-foreground">{order.id}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-muted-foreground">{order.shippingAddress.street.substring(0,10)}... (Mock Name)</TableCell> 
                    <TableCell className="text-right text-muted-foreground">{order.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        order.status === 'Delivered' ? 'default' :
                        order.status === 'Shipped' ? 'secondary' :
                        order.status === 'Pending' ? 'outline' : 'destructive'
                      }
                      className={
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm">View</Button>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No orders found.</p>
          )}
        </CardContent>
      </Card>
       {/* Pagination (Placeholder) */}
       <div className="flex justify-center mt-6">
        <Button variant="outline" className="mr-2">Previous</Button>
        <Button variant="outline">Next</Button>
      </div>
    </div>
  );
}
