
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, getDocs, startAfter, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

const ITEMS_PER_FETCH = 10; // Number of products to fetch each time

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allFetchedProducts, setAllFetchedProducts] = useState<Product[]>([]); // For client-side search
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(async (initialFetch = false) => {
    if (!hasMore && !initialFetch) return;

    if (initialFetch) {
      setLoading(true);
      setProducts([]);
      setAllFetchedProducts([]);
      setLastVisible(null);
      setHasMore(true); // Reset hasMore for a fresh fetch
    } else {
      setLoadingMore(true);
    }

    try {
      const productsRef = collection(db, "products");
      let q;
      if (initialFetch || !lastVisible) {
        q = query(productsRef, orderBy("name"), limit(ITEMS_PER_FETCH));
      } else {
        q = query(productsRef, orderBy("name"), startAfter(lastVisible), limit(ITEMS_PER_FETCH));
      }

      const documentSnapshots = await getDocs(q);
      const newProducts = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      
      setProducts(prev => initialFetch ? newProducts : [...prev, ...newProducts]);
      setAllFetchedProducts(prev => initialFetch ? newProducts : [...prev, ...newProducts]); // Keep a separate list for search
      
      const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(lastDoc || null);
      setHasMore(documentSnapshots.docs.length === ITEMS_PER_FETCH);

    } catch (error) {
      console.error("Error fetching products:", error);
      setHasMore(false); // Stop trying if error
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastVisible, hasMore]);

  useEffect(() => {
    fetchProducts(true); // Initial fetch
  }, [fetchProducts]); // fetchProducts is memoized, safe to add

  useEffect(() => {
    if (!searchTerm) {
      setProducts(allFetchedProducts); // If search is cleared, show all fetched products
      // Potentially re-enable infinite scroll if it was stopped by search
      setHasMore(allFetchedProducts.length > 0 && allFetchedProducts.length % ITEMS_PER_FETCH === 0); 
      return;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = allFetchedProducts.filter(product =>
      product.name.toLowerCase().includes(lowerSearchTerm) ||
      product.category.toLowerCase().includes(lowerSearchTerm) ||
      (product.subcategory && product.subcategory.toLowerCase().includes(lowerSearchTerm)) ||
      (product.brand && product.brand.toLowerCase().includes(lowerSearchTerm))
    );
    setProducts(filtered);
    setHasMore(false); // Disable infinite scroll when searching client-side
  }, [searchTerm, allFetchedProducts]);


  const handleSelectProduct = (productId: string, checked: boolean | string) => {
    setSelectedProductIds(prev =>
      checked ? [...prev, productId] : prev.filter(id => id !== productId)
    );
  };

  const handleSelectAll = (checked: boolean | string) => {
    if (checked) {
      setSelectedProductIds(products.map(p => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const isAllSelected = products.length > 0 && selectedProductIds.length === products.length;
  const isSomeSelected = selectedProductIds.length > 0 && selectedProductIds.length < products.length;

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (searchTerm) return; // Don't load more if searching
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200 && hasMore && !loadingMore) {
        fetchProducts();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchProducts, hasMore, loadingMore, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Manage Products</h1>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/admin/products/new">
            <PlusCircle size={20} className="mr-2" />
            Add New Product
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Product List</CardTitle>
           <div className="mt-4 relative">
            <Input
              type="search"
              placeholder="Search products (name, category, brand...)"
              className="pl-10 w-full md:w-1/2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                      aria-label="Select all products on this page"
                    />
                  </TableHead>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price (KSh)</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && products.length === 0 ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell><Skeleton className="h-5 w-5 rounded" /></TableCell>
                      <TableCell><Skeleton className="h-16 w-12 rounded-md" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-1/4" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-1/4" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 rounded-full" /></TableCell>
                      <TableCell className="text-right space-x-1">
                        <Skeleton className="h-8 w-8 rounded-md inline-block" />
                        <Skeleton className="h-8 w-8 rounded-md inline-block" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : products.length > 0 ? products.map((product) => (
                  <TableRow key={product.id} data-state={selectedProductIds.includes(product.id) ? "selected" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProductIds.includes(product.id)}
                        onCheckedChange={(checked) => handleSelectProduct(product.id, checked)}
                        aria-label={`Select product ${product.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Image
                        src={product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/48x64.png'}
                        alt={product.name}
                        width={48}
                        height={64}
                        className="rounded-md object-cover"
                        data-ai-hint={product.dataAiHint || 'product clothing'}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                    <TableCell className="text-muted-foreground">{product.category}{product.subcategory ? `/${product.subcategory}` : ''}</TableCell>
                    <TableCell className="text-muted-foreground">{product.price.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{product.stockQuantity}</TableCell>
                    <TableCell>
                      <Badge variant={product.stockQuantity > 0 ? 'default' : 'destructive'}
                            className={product.stockQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/products/edit/${product.slug}`}>
                          <Edit size={18} className="text-blue-500 hover:text-blue-700" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => alert(`Delete ${product.name}? (Mock)`)}>
                        <Trash2 size={18} className="text-destructive hover:text-red-700" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
                {loadingMore && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary my-4" />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {!loading && !hasMore && products.length > 0 && !searchTerm && (
            <p className="text-center text-sm text-muted-foreground py-4">All products loaded.</p>
          )}
        </CardContent>
      </Card>

      {selectedProductIds.length > 0 && (
        <div className="mt-4 p-2 bg-muted rounded-md text-sm text-muted-foreground">
          {selectedProductIds.length} product(s) selected. (Bulk actions placeholder)
        </div>
      )}
    </div>
  );
}
