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
import { Users, Search, UserPlus, ChevronLeft, ChevronRight, Loader2, ShieldCheck, UserCog, Ban, CheckCircle } from 'lucide-react';
import type { User } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const ITEMS_PER_PAGE = 10;

export default function AdminCustomersPage() {
  const [allFetchedCustomers, setAllFetchedCustomers] = useState<User[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        if (!db) return;
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("name"));
        const querySnapshot = await getDocs(q);
        const fetchedCustomers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setAllFetchedCustomers(fetchedCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast({ title: "Error", description: "Could not sync community archives.", variant: "destructive" });
      }
      setLoading(false);
    };
    fetchCustomers();
  }, [toast]);


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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading text-secondary mb-1">Community Hub</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Identity & Access Management</p>
        </div>
        <Button variant="outline" className="border-secondary h-12 px-8 font-bold tracking-widest text-[10px]" disabled>
          <UserPlus size={18} className="mr-2" /> NEW USER (PHASE 2)
        </Button>
      </div>

      <Card className="shadow-2xl border-none rounded-2xl overflow-hidden bg-card">
        <CardHeader className="bg-card p-8 border-b border-primary/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <CardTitle className="text-xl font-heading text-secondary flex items-center">
              <Users className="mr-3 text-primary" size={20} /> Active Members
            </CardTitle>
            <div className="relative w-full md:w-1/2">
              <Input
                type="search"
                placeholder="Search community (name, email, city...)"
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
                  <TableHead className="w-[50px] pl-8">
                     <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="py-6 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Seeker</TableHead>
                  <TableHead className="py-6 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Identity Anchor (Email)</TableHead>
                  <TableHead className="py-6 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Base (City)</TableHead>
                  <TableHead className="py-6 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Access Level</TableHead>
                  <TableHead className="py-6 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Logistics Status</TableHead>
                  <TableHead className="py-6 pr-8 text-right text-[10px] uppercase tracking-widest font-bold text-secondary/50">Command</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    [...Array(5)].map((_, i) => (
                        <TableRow key={`skeleton-customer-${i}`} className="border-primary/5">
                            <TableCell className="pl-8"><Skeleton className="h-5 w-5 rounded" /></TableCell>
                            <TableCell><div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-4 w-24" /></div></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                            <TableCell className="pr-8 text-right"><Skeleton className="h-10 w-24 rounded-xl inline-block" /></TableCell>
                        </TableRow>
                    ))
                ) : paginatedCustomers.length > 0 ? paginatedCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-primary/5 transition-colors group border-primary/5">
                    <TableCell className="pl-8">
                       <Checkbox
                        checked={selectedCustomerIds.includes(customer.id)}
                        onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-primary/5">
                          <AvatarImage src={customer.photoURL || customer.profilePictureUrl || `https://placehold.co/40x40.png?text=${customer.name?.charAt(0)}`} alt={customer.name} />
                          <AvatarFallback>{customer.name?.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-secondary text-sm">{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-medium">{customer.email}</TableCell>
                    <TableCell className="text-secondary/60 text-xs font-bold uppercase tracking-tighter">{customer.shippingAddress?.city || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-widest ${customer.role === 'admin' ? 'border-primary/20 text-primary bg-primary/5' : 'border-secondary/10 text-secondary/60'}`}>
                        {customer.role === 'admin' ? <ShieldCheck className="h-3 w-3 mr-1" /> : <UserCog className="h-3 w-3 mr-1" />}
                        {customer.role || 'user'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-widest ${customer.disabled ? 'border-destructive/20 text-destructive bg-destructive/5' : 'border-green-200 text-green-600 bg-green-50'}`}>
                        {customer.disabled ? <Ban className="h-3 w-3 mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                        {customer.disabled ? 'DISABLED' : 'ACTIVE'}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      <Button variant="outline" size="sm" className="h-10 border-2 border-primary/10 hover:border-primary font-bold tracking-widest text-[10px] rounded-xl" asChild>
                        <Link href={`/admin/customers/${customer.id}`}>REFINE ACCESS</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4 opacity-20">
                        <Users size={64} strokeWidth={1} />
                        <p className="font-heading text-2xl">No community archives found.</p>
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
            Identity Page {currentPage} of {totalPages}
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
