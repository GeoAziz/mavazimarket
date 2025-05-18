
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
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Search, FileDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { Order } from '@/lib/types';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, orderBy, limit, startAfter, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';


const ITEMS_PER_PAGE = 10;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [allFetchedOrders, setAllFetchedOrders] = useState<Order[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // For client-side pagination after initial fetch if not using infinite scroll
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // For server-side pagination/infinite scroll (if preferred over client-side pagination)
  // const [loadingMore, setLoadingMore] = useState(false);
  // const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  // const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const ordersRef = collection(db, "orders");
        // Simple fetch all for now, can add server-side pagination later
        const q = query(ordersRef, orderBy("orderDate", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                orderDate: (data.orderDate.toDate ? data.orderDate.toDate() : new Date(data.orderDate)).toISOString(),
            } as Order;
        });
        setOrders(fetchedOrders);
        setAllFetchedOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);


  const filteredOrders = useMemo(() => {
    return allFetchedOrders.filter(order =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.shippingAddress.street && order.shippingAddress.street.toLowerCase().includes(searchTerm.toLowerCase())) || // Mocking customer name with address
      order.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allFetchedOrders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const handleSelectOrder = (orderId: string, checked: boolean | string) => {
    setSelectedOrderIds(prev =>
      checked ? [...prev, orderId] : prev.filter(id => id !== orderId)
    );
  };

  const handleSelectAll = (checked: boolean | string) => {
    if (checked) {
      setSelectedOrderIds(paginatedOrders.map(o => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const isAllSelected = paginatedOrders.length > 0 && selectedOrderIds.length === paginatedOrders.length;
  const isSomeSelected = selectedOrderIds.length > 0 && selectedOrderIds.length < paginatedOrders.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <ShoppingCart size={30} className="mr-3 text-accent" /> Manage Orders
        </h1>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <FileDown size={20} className="mr-2" /> Export Orders (Mock)
        </Button>
      </div>

      <Card className="shadow-lg w-full">
        <CardHeader>
          <CardTitle className="text-xl">Order List</CardTitle>
          <div className="mt-4 relative">
            <Input
              type="search"
              placeholder="Search orders (ID, customer, status...)"
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
                      aria-label="Select all orders on this page"
                    />
                  </TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer (Mock)</TableHead>
                  <TableHead className="text-right">Total (KSh)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && paginatedOrders.length === 0 ? (
                    [...Array(5)].map((_, i) => (
                        <TableRow key={`skeleton-order-${i}`}>
                            <TableCell><Skeleton className="h-5 w-5 rounded" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-16 inline-block" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-24 rounded-full" /></TableCell>
                            <TableCell className="text-right space-x-2">
                                <Skeleton className="h-8 w-8 rounded-md inline-block" />
                                <Skeleton className="h-8 w-8 rounded-md inline-block" />
                            </TableCell>
                        </TableRow>
                    ))
                ) : paginatedOrders.length > 0 ? paginatedOrders.map((order) => (
                  <TableRow key={order.id} data-state={selectedOrderIds.includes(order.id) ? "selected" : ""}>
                    <TableCell>
                       <Checkbox
                        checked={selectedOrderIds.includes(order.id)}
                        onCheckedChange={(checked) => handleSelectOrder(order.id, checked)}
                        aria-label={`Select order ${order.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-foreground whitespace-nowrap">{order.id}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {order.shippingAddress?.street?.substring(0,15) || 'N/A'}...
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground whitespace-nowrap">{order.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        order.status === 'Delivered' ? 'default' :
                        order.status === 'Shipped' ? 'secondary' :
                        order.status === 'Pending' ? 'outline' : 'destructive'
                      }
                      className={`whitespace-nowrap ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2 whitespace-nowrap">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/orders/${order.id}`}>View</Link>
                      </Button>
                      {/* <Button variant="ghost" size="sm" onClick={() => alert(`Edit order ${order.id} (mock)`)}>Edit</Button> */}
                    </TableCell>
                  </TableRow>
                )) : (
                   <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No orders found.
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
       {selectedOrderIds.length > 0 && (
        <div className="mt-4 p-2 bg-muted rounded-md text-sm text-muted-foreground">
          {selectedOrderIds.length} order(s) selected. (Bulk actions placeholder)
        </div>
      )}
    </div>
  );
}
