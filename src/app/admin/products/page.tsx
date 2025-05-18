
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
import { PlusCircle, Edit, Trash2, Search, Loader2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, getDocs, startAfter, DocumentData, QueryDocumentSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ITEMS_PER_FETCH = 10;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allFetchedProducts, setAllFetchedProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { toast } = useToast();
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);


  const fetchProducts = useCallback(async (initialFetch = false) => {
    console.log("AdminProductsPage: fetchProducts called. Initial:", initialFetch, "HasMore:", hasMore, "LoadingMore:", loadingMore);
    if (!hasMore && !initialFetch) {
      console.log("AdminProductsPage: No more products to fetch or not initial fetch.");
      return;
    }
    if (loadingMore && !initialFetch) {
      console.log("AdminProductsPage: Already loading more, returning.");
      return;
    }

    setFetchError(null);
    if (initialFetch) {
      setLoading(true);
      setProducts([]);
      setAllFetchedProducts([]);
      setLastVisible(null);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const productsRef = collection(db, "products");
      let q;
      if (initialFetch || !lastVisible) {
        console.log("AdminProductsPage: Querying initial batch.");
        q = query(productsRef, orderBy("name"), limit(ITEMS_PER_FETCH));
      } else {
        console.log("AdminProductsPage: Querying next batch after:", lastVisible?.id);
        q = query(productsRef, orderBy("name"), startAfter(lastVisible), limit(ITEMS_PER_FETCH));
      }

      const documentSnapshots = await getDocs(q);
      console.log("AdminProductsPage: Firestore query executed. Docs found:", documentSnapshots.docs.length, "Empty:", documentSnapshots.empty);

      const newProducts = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      console.log("AdminProductsPage: New products mapped:", newProducts.length);

      setProducts(prev => initialFetch ? newProducts : [...prev, ...newProducts]);
      setAllFetchedProducts(prev => initialFetch ? newProducts : [...prev, ...newProducts]);
      
      const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(lastDoc || null);
      const currentHasMore = documentSnapshots.docs.length === ITEMS_PER_FETCH;
      setHasMore(currentHasMore);
      console.log("AdminProductsPage: Updated lastVisible:", lastDoc?.id, "HasMore:", currentHasMore);

    } catch (error: any) {
      console.error("AdminProductsPage: Error fetching products:", error);
      setFetchError(`Failed to load products: ${error.message}. Please check your network connection and try again.`);
      setHasMore(false);
    } finally {
      if (initialFetch) setLoading(false);
      setLoadingMore(false);
      console.log("AdminProductsPage: fetchProducts finished. Loading:", initialFetch ? false : loading, "LoadingMore:", false);
    }
  }, [lastVisible, hasMore, loadingMore]); // Include loadingMore in dependencies

  useEffect(() => {
    fetchProducts(true); // Initial fetch
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Runs only once on mount

  useEffect(() => {
    if (!searchTerm) {
      setProducts(allFetchedProducts);
      // Recalculate hasMore based on full list if search is cleared
      if (allFetchedProducts.length > 0) {
        const isPotentiallyMore = allFetchedProducts.length % ITEMS_PER_FETCH === 0;
        // This is a heuristic. If the last fetch filled the page, assume there might be more.
        // A more robust way would be to know the total count or if the last fetch was exactly ITEMS_PER_FETCH.
        setHasMore(isPotentiallyMore);
      } else {
        setHasMore(true); // If no products fetched at all, assume we can still try fetching more initially
      }
      return;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = allFetchedProducts.filter(product =>
      product.name.toLowerCase().includes(lowerSearchTerm) ||
      product.category.toLowerCase().includes(lowerSearchTerm) ||
      (product.slug && product.slug.toLowerCase().includes(lowerSearchTerm)) ||
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

  useEffect(() => {
    const handleScroll = () => {
      if (searchTerm || loadingMore || !hasMore) return;
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 300) {
        fetchProducts(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchProducts, searchTerm, loadingMore, hasMore]);

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeletingProductId(productToDelete.id);
    try {
      await deleteDoc(doc(db, "products", productToDelete.id));
      toast({
        title: "Product Deleted",
        description: `${productToDelete.name} has been successfully deleted.`,
      });
      // Refetch products after deletion
      fetchProducts(true);
      setSelectedProductIds(prev => prev.filter(id => id !== productToDelete.id));
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({ title: "Error", description: "Could not delete product.", variant: "destructive" });
    } finally {
      setDeletingProductId(null);
      setProductToDelete(null);
    }
  };


  return (
    <AlertDialog>
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
            {fetchError && (
              <div className="text-center py-10 text-destructive bg-destructive/10 p-4 rounded-md">
                <AlertTriangle size={48} className="mx-auto mb-4" />
                <p className="text-xl font-semibold">Error Loading Products</p>
                <p>{fetchError}</p>
                <Button onClick={() => fetchProducts(true)} className="mt-4">Try Again</Button>
              </div>
            )}
            {!fetchError && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={isAllSelected || (isSomeSelected && 'indeterminate')}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all products on this page"
                          disabled={products.length === 0}
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
                    ) : !loading && products.length === 0 && !searchTerm ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                          No products found in the database. Try adding some!
                        </TableCell>
                      </TableRow>
                    ): !loading && products.length === 0 && searchTerm ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                            No products found matching your search term "{searchTerm}".
                            </TableCell>
                        </TableRow>
                    ) : (
                      products.map((product) => (
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
                          <TableCell className="font-medium text-foreground whitespace-nowrap">{product.name}</TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">{product.category}{product.subcategory ? `/${product.subcategory}` : ''}</TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">{product.price.toLocaleString()}</TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">{product.stockQuantity}</TableCell>
                          <TableCell>
                            <Badge variant={product.isPublished && product.stockQuantity > 0 ? 'default' : 'destructive'}
                                  className={product.isPublished && product.stockQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {product.isPublished && product.stockQuantity > 0 ? 'Published' : product.stockQuantity === 0 ? 'Out of Stock' : 'Unpublished'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-1 whitespace-nowrap">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/admin/products/edit/${product.slug}`}>
                                <Edit size={18} className="text-blue-500 hover:text-blue-700" />
                              </Link>
                            </Button>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(product)} disabled={deletingProductId === product.id}>
                                {deletingProductId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={18} className="text-destructive hover:text-red-700" />}
                              </Button>
                            </AlertDialogTrigger>
                          </TableCell>
                        </TableRow>
                      ))
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
            )}
            {!loading && !loadingMore && !hasMore && products.length > 0 && !searchTerm && (
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
      {productToDelete && (
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product
                "{productToDelete.name}".
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
                onClick={handleDeleteProduct}
                className="bg-destructive hover:bg-destructive/90"
                disabled={deletingProductId === productToDelete.id}
            >
                {deletingProductId === productToDelete.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, delete product
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
