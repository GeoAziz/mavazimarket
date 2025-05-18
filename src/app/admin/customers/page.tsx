
"use client";

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
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Search, UserPlus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { User } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, orderBy, limit, startAfter, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

const ITEMS_PER_PAGE = 10; // For client-side pagination

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [allFetchedCustomers, setAllFetchedCustomers] = useState<User[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // For server-side infinite scroll (optional, current setup is client-side pagination)
  // const [loadingMore, setLoadingMore] = useState(false);
  // const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  // const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, "users");
        // Simple fetch all for now, can add server-side pagination later
        const q = query(usersRef, orderBy("name")); // Assuming 'name' field exists for sorting
        const querySnapshot = await getDocs(q);
        const fetchedCustomers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setCustomers(fetchedCustomers);
        setAllFetchedCustomers(fetchedCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
      setLoading(false);
    };
    fetchCustomers();
  }, []);


  const filteredCustomers = useMemo(() => {
    return allFetchedCustomers.filter(customer =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.shippingAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allFetchedCustomers, searchTerm]);

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCustomers, currentPage]);

  const handleSelectCustomer = (customerId: string, checked: boolean | string) => {
    setSelectedCustomerIds(prev =>
      checked ? [...prev, customerId] : prev.filter(id => id !== customerId)
    );
  };

  const handleSelectAll = (checked: boolean | string) => {
    if (checked) {
      setSelectedCustomerIds(paginatedCustomers.map(c => c.id));
    } else {
      setSelectedCustomerIds([]);
    }
  };

  const isAllSelected = paginatedCustomers.length > 0 && selectedCustomerIds.length === paginatedCustomers.length;
  const isSomeSelected = selectedCustomerIds.length > 0 && selectedCustomerIds.length < paginatedCustomers.length;


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <Users size={30} className="mr-3 text-accent" /> Manage Customers
        </h1>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <UserPlus size={20} className="mr-2" /> Add New Customer (Mock)
        </Button>
      </div>

      <Card className="shadow-lg w-full">
        <CardHeader>
          <CardTitle className="text-xl">Customer List</CardTitle>
          <div className="mt-4 relative">
            <Input
              type="search"
              placeholder="Search customers (name, email, city...)"
              className="pl-10 w-full md:w-1/2"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                     <Checkbox
                      checked={isAllSelected || (isSomeSelected && 'indeterminate')}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all customers on this page"
                    />
                  </TableHead>
                  <TableHead className="w-[60px]">Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Total Orders (Mock)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && paginatedCustomers.length === 0 ? (
                    [...Array(5)].map((_, i) => (
                        <TableRow key={`skeleton-customer-${i}`}>
                            <TableCell><Skeleton className="h-5 w-5 rounded" /></TableCell>
                            <TableCell><Skeleton className="h-9 w-9 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell className="text-right space-x-2">
                                <Skeleton className="h-8 w-8 rounded-md inline-block" />
                                <Skeleton className="h-8 w-8 rounded-md inline-block" />
                            </TableCell>
                        </TableRow>
                    ))
                ) : paginatedCustomers.length > 0 ? paginatedCustomers.map((customer) => (
                  <TableRow key={customer.id} data-state={selectedCustomerIds.includes(customer.id) ? "selected" : ""}>
                    <TableCell>
                       <Checkbox
                        checked={selectedCustomerIds.includes(customer.id)}
                        onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked)}
                        aria-label={`Select customer ${customer.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={customer.profilePictureUrl || `https://placehold.co/40x40.png?text=${customer.name?.substring(0,1)}`} alt={customer.name} data-ai-hint={customer.dataAiHint || 'avatar person'} />
                        <AvatarFallback>{customer.name?.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium text-foreground whitespace-nowrap">{customer.name}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{customer.email}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{customer.shippingAddress?.city || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{customer.orderHistory?.length || 0}</TableCell>
                    <TableCell className="text-right space-x-2 whitespace-nowrap">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/customers/${customer.id}`}>View</Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => alert(`Edit customer ${customer.name} (mock)`)}>Edit</Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No customers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
      {selectedCustomerIds.length > 0 && (
        <div className="mt-4 p-2 bg-muted rounded-md text-sm text-muted-foreground">
          {selectedCustomerIds.length} customer(s) selected. (Bulk actions placeholder)
        </div>
      )}
    </div>
  );
}
