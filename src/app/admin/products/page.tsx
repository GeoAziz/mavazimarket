
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
import { PlusCircle, Edit, Trash2, Search, Loader2, AlertTriangle, FileDown, FileUp } from 'lucide-react';
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
    if (!hasMore && !initialFetch) return;
    if (loadingMore && !initialFetch) return;

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
      const productsRef = collection(db!, "products");
      let q;
      if (initialFetch || !lastVisible) {
        q = query(productsRef, orderBy("name"), limit(ITEMS_PER_FETCH));
      } else {
        q = query(productsRef, orderBy("name"), startAfter(lastVisible), limit(ITEMS_PER_FETCH));
      }

      const documentSnapshots = await getDocs(q);
      const newProducts = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

      setProducts(prev => initialFetch ? newProducts : [...prev, ...newProducts]);
      setAllFetchedProducts(prev => initialFetch ? newProducts : [...prev, ...newProducts]);
      
      const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(lastDoc || null);
      setHasMore(documentSnapshots.docs.length === ITEMS_PER_FETCH);

    } catch (error: any) {
      console.error("AdminProductsPage: Error fetching products:", error);
      setFetchError(`Failed to load products: ${error.message}.`);
      setHasMore(false);
    } finally {
      if (initialFetch) setLoading(false);
      setLoadingMore(false);
    }
  }, [lastVisible, hasMore, loadingMore]);

  useEffect(() => {
    fetchProducts(true);
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setProducts(allFetchedProducts);
      return;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = allFetchedProducts.filter(product =>
      product.name.toLowerCase().includes(lowerSearchTerm) ||
      product.category.toLowerCase().includes(lowerSearchTerm) ||
      (product.brand && product.brand.toLowerCase().includes(lowerSearchTerm))
    );
    setProducts(filtered);
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

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeletingProductId(productToDelete.id);
    try {
      await deleteDoc(doc(db!, "products", productToDelete.id));
      toast({
        title: "Product Deleted",
        description: `${productToDelete.name} has been successfully deleted.`,
      });
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
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading text-secondary">Heritage Catalog</h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Product Inventory & Curation</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-secondary h-12 px-6 font-bold tracking-widest text-[10px]">
              <FileUp size={16} className="mr-2" /> BULK UPLOAD (CSV)
            </Button>
            <Button asChild className="bg-primary text-white h-12 px-8 font-bold tracking-widest">
              <Link href="/admin/products/new">
                <PlusCircle size={18} className="mr-2" /> NEW DESIGN
              </Link>
            </Button>
          </div>
        </div>

        <Card className="shadow-2xl border-none rounded-2xl overflow-hidden">
          <CardHeader className="bg-card p-8 border-b border-primary/5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <CardTitle className="text-xl font-heading text-secondary flex items-center">
                <Package className="mr-3 text-primary" size={20} /> Active Inventory
              </CardTitle>
              <div className="relative w-full md:w-1/2">
                <Input
                  type="search"
                  placeholder="Search heritage designs..."
                  className="pl-12 h-12 bg-primary/5 border-none rounded-xl focus-visible:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {fetchError && (
              <div className="text-center py-24 text-destructive">
                <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
                <p className="font-heading text-xl">Logistics Interrupted</p>
                <p className="text-sm opacity-70 mb-6">{fetchError}</p>
                <Button onClick={() => fetchProducts(true)}>RETRY SYNC</Button>
              </div>
            )}
            {!fetchError && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-secondary/5">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="w-[50px] pl-8">
                        <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
                      </TableHead>
                      <TableHead className="py-6 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Visual</TableHead>
                      <TableHead className="py-6 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Product Identity</TableHead>
                      <TableHead className="py-6 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Category</TableHead>
                      <TableHead className="py-6 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Valuation</TableHead>
                      <TableHead className="py-6 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Inventory</TableHead>
                      <TableHead className="py-6 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Status</TableHead>
                      <TableHead className="py-6 pr-8 text-right text-[10px] uppercase tracking-widest font-bold text-secondary/50">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && products.length === 0 ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={`skeleton-${i}`} className="border-primary/5">
                          <TableCell className="pl-8"><Skeleton className="h-5 w-5 rounded" /></TableCell>
                          <TableCell><Skeleton className="h-16 w-12 rounded-md" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-3/4 rounded" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-1/2 rounded" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-1/4 rounded" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-1/4 rounded" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                          <TableCell className="pr-8 text-right"><Skeleton className="h-10 w-20 rounded-xl inline-block" /></TableCell>
                        </TableRow>
                      ))
                    ) : products.map((product) => (
                      <TableRow key={product.id} className="hover:bg-primary/5 transition-colors border-primary/5">
                        <TableCell className="pl-8">
                          <Checkbox checked={selectedProductIds.includes(product.id)} onCheckedChange={(checked) => handleSelectProduct(product.id, checked)} />
                        </TableCell>
                        <TableCell>
                          <div className="relative h-16 w-12 rounded-lg overflow-hidden border border-primary/10 shadow-sm">
                            <Image src={product.images?.[0] || 'https://placehold.co/48x64.png'} alt={product.name} fill className="object-cover" />
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-secondary text-sm">{product.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs uppercase font-bold tracking-tighter">{product.category}</TableCell>
                        <TableCell className="font-heading text-primary font-bold">KSh {product.price.toLocaleString()}</TableCell>
                        <TableCell className="text-secondary/60 text-xs font-medium">{product.stockQuantity} units</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-widest border-2 ${
                            product.isPublished && product.stockQuantity > 0 ? 'border-green-200 text-green-600 bg-green-50' : 'border-destructive/20 text-destructive bg-destructive/5'
                          }`}>
                            {product.isPublished && product.stockQuantity > 0 ? 'LIVE' : 'UNPUBLISHED'}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-8 text-right space-x-2">
                          <Button variant="outline" size="icon" className="h-10 w-10 border-2 border-primary/10 hover:border-primary rounded-xl" asChild>
                            <Link href={`/admin/products/edit/${product.slug}`}><Edit size={16} className="text-blue-500" /></Link>
                          </Button>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-10 w-10 border-2 border-primary/10 hover:border-destructive rounded-xl" onClick={() => setProductToDelete(product)}>
                              <Trash2 size={16} className="text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {productToDelete && (
        <AlertDialogContent className="border-none rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-2xl text-secondary">Archive Heritage?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently decommission "{productToDelete.name}" from the active collection. This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive hover:bg-destructive/90 rounded-xl" disabled={!!deletingProductId}>
              {deletingProductId === productToDelete.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              CONFIRM ARCHIVE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
