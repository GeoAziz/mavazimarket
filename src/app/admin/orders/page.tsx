
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
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Search, FileDown, ChevronLeft, ChevronRight, Loader2, Package } from 'lucide-react';
import type { Order } from '@/lib/types';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { formatKSh } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

export default function AdminOrdersPage() {
  const [allFetchedOrders, setAllFetchedOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        if (!db) return;
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, orderBy("orderDate", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                orderDate: data.orderDate?.toDate ? data.orderDate.toDate().toISOString() : data.orderDate,
            } as Order;
        });
        setAllFetchedOrders(fetchedOrders);
      } catch (error) {
        console.error("Logistics sync error:", error);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return allFetchedOrders.filter(order =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allFetchedOrders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading text-secondary">Logistics Command</h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Order Lifecycle Management</p>
        </div>
        <Button className="bg-secondary text-white font-bold tracking-widest h-12 px-8">
          <FileDown size={18} className="mr-2" /> EXPORT HERITAGE DATA
        </Button>
      </div>

      <Card className="shadow-2xl border-none rounded-2xl overflow-hidden">
        <CardHeader className="bg-card p-8 border-b border-primary/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <CardTitle className="text-xl font-heading text-secondary flex items-center">
              <ShoppingBag className="mr-3 text-primary" size={20} /> Active Logistics
            </CardTitle>
            <div className="relative w-full md:w-1/2">
              <Input
                type="search"
                placeholder="Search logistics (ID, location, status...)"
                className="pl-12 h-12 bg-primary/5 border-none rounded-xl focus-visible:ring-primary/20"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/5">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="py-6 pl-8 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Logistics ID</TableHead>
                  <TableHead className="py-6 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Curation Date</TableHead>
                  <TableHead className="py-6 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Destination</TableHead>
                  <TableHead className="py-6 text-right text-[10px] uppercase tracking-widest font-bold text-secondary/50">Total Value</TableHead>
                  <TableHead className="py-6 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Status</TableHead>
                  <TableHead className="py-6 pr-8 text-right text-[10px] uppercase tracking-widest font-bold text-secondary/50">Curation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    [...Array(5)].map((_, i) => (
                        <TableRow key={`skeleton-order-${i}`} className="border-primary/5">
                            <TableCell className="pl-8"><Skeleton className="h-4 w-24 rounded" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20 rounded" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32 rounded" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-4 w-16 inline-block rounded" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                            <TableCell className="pr-8 text-right"><Skeleton className="h-10 w-20 rounded-xl" /></TableCell>
                        </TableRow>
                    ))
                ) : paginatedOrders.length > 0 ? paginatedOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-primary/5 transition-colors group border-primary/5">
                    <TableCell className="pl-8 font-bold text-secondary text-sm">
                      #{order.id.substring(0,8)}...
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-bold uppercase tracking-tighter">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-secondary font-medium text-xs">
                      {order.shippingAddress?.street?.substring(0,25) || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right font-heading text-primary font-bold">
                      {formatKSh(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 border-2 ${
                        order.status === 'Delivered' ? 'border-green-200 text-green-600 bg-green-50' :
                        order.status === 'Shipped' ? 'border-blue-200 text-blue-600 bg-blue-50' :
                        order.status === 'Cancelled' ? 'border-destructive/20 text-destructive bg-destructive/5' :
                        'border-primary/20 text-primary bg-primary/5'
                      }`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      <Button variant="outline" size="sm" className="h-10 border-2 border-primary/10 hover:border-primary font-bold tracking-widest text-[10px] rounded-xl" asChild>
                        <Link href={`/admin/orders/${order.id}`}>VIEW DETAILS</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                   <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4 opacity-20">
                        <Package size={64} strokeWidth={1} />
                        <p className="font-heading text-2xl">No logistics archives found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 pb-12">
          <Button variant="outline" size="sm" className="h-12 px-6 font-bold tracking-widest rounded-xl border-secondary"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> PREVIOUS
          </Button>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Archive Page {currentPage} of {totalPages}
          </span>
          <Button variant="outline" size="sm" className="h-12 px-6 font-bold tracking-widest rounded-xl border-secondary"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            NEXT <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
