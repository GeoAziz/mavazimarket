
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Search, UserPlus } from 'lucide-react';
import { mockUser } from '@/lib/mock-data'; // Using mockUser as an example
import type { User } from '@/lib/types';

// Mocking a list of customers for demonstration
const mockCustomers: User[] = [
  mockUser,
  { ...mockUser, id: 'mockuser02', name: 'Amina Wanjiru', email: 'amina@example.com', profilePictureUrl: 'https://placehold.co/40x40.png?text=AW' },
  { ...mockUser, id: 'mockuser03', name: 'John Okello', email: 'john.o@example.com', profilePictureUrl: 'https://placehold.co/40x40.png?text=JO'  },
];


export default function AdminCustomersPage() {
  const customers: User[] = mockCustomers; // In a real app, fetch this data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <Users size={30} className="mr-3 text-accent" /> Manage Customers
        </h1>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <UserPlus size={20} className="mr-2" /> Add New Customer
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Customer List</CardTitle>
          <div className="mt-4 relative">
            <Input type="search" placeholder="Search customers (name, email...)" className="pl-10 w-full md:w-1/2" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {customers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={customer.profilePictureUrl} alt={customer.name} data-ai-hint={customer.dataAiHint || 'avatar person'} />
                        <AvatarFallback>{customer.name?.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{customer.name}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.shippingAddress?.city || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.orderHistory?.length || 0}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm">View</Button>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <p className="text-muted-foreground text-center py-4">No customers found.</p>
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
