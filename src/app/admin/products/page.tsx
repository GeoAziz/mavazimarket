
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
import { PlusCircle, Edit, Trash2, Search, Loader2, AlertTriangle, FileUp, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useCallback, useRef } from 'react';
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
import { bulkCreateProductsAction } from './bulk-actions';

const ITEMS_PER_FETCH = 15;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allFetchedProducts, setAllFetchedProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const fetchProducts = useCallback(async (initialFetch = false) => {
    setFetchError(null);
    if (initialFetch) {
      setLoading(true);
      setProducts([]);
      setAllFetchedProducts([]);
      setLastVisible(null);
      setHasMore(true);
    }

    try {
      if (!db) return;
      const productsRef = collection(db, "products");
      let q = query(productsRef, orderBy("name"), limit(ITEMS_PER_FETCH));
      
      if (!initialFetch && lastVisible) {
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
      console.error("Sync Error:", error);
      setFetchError(`Failed to sync archives: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [lastVisible]);

  useEffect(() => {
    fetchProducts(true);
  }, []);

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({ title: "Invalid Format", description: "Please upload a .csv file.", variant: "destructive" });
      return;
    }

    setIsBulkUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const productsToCreate = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const product: any = {};
          headers.forEach((header, index) => {
            if (header === 'price' || header === 'stockquantity') {
              product[header === 'stockquantity' ? 'stockQuantity' : header] = Number(values[index]) || 0;
            } else if (header === 'sizes' || header === 'colors' || header === 'tags') {
              product[header] = values[index] ? values[index].split('|') : [];
            } else {
              product[header] = values[index];
            }
          });
          return product;
        });

        toast({ title: "Archiving Batch...", description: `Transmitting ${productsToCreate.length} records to the cloud vault.` });
        const result = await bulkCreateProductsAction(productsToCreate);
        
        if (result.success) {
          toast({ title: "Sync Successful", description: `Added ${result.count} heritage designs to the collection.` });
          fetchProducts(true);
        } else {
          toast({ title: "Bulk Sync Failed", description: result.error, variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Parsing Error", description: "The CSV structure is invalid.", variant: "destructive" });
      } finally {
        setIsBulkUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeletingProductId(productToDelete.id);
    try {
      await deleteDoc(doc(db!, "products", productToDelete.id));
      toast({ title: "Design Decommissioned", description: `"${productToDelete.name}" removed from archive.` });
      fetchProducts(true);
    } catch (error) {
      toast({ title: "Removal Failed", description: "Could not decommission piece.", variant: "destructive" });
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
            <h1 className="text-4xl font-heading text-secondary mb-1">Heritage Catalog</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Curation & Inventory Control</p>
          </div>
          <div className="flex gap-3">
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleBulkUpload} />
            <Button 
              variant="outline" 
              className="border-secondary h-14 px-8 font-bold tracking-widest text-[10px] shadow-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBulkUploading}
            >
              {isBulkUploading ? <Loader2 className="animate-spin mr-2" /> : <FileUp size={18} className="mr-2" />}
              BULK ACQUISITION (CSV)
            </Button>
            <Button asChild className="bg-primary text-white h-14 px-10 font-bold tracking-widest shadow-xl shadow-primary/20">
              <Link href="/admin/products/new">
                <PlusCircle size={20} className="mr-3" /> NEW DESIGN
              </Link>
            </Button>
          </div>
        </div>

        <Card className="shadow-2xl border-none rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-card p-10 border-b border-primary/5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <CardTitle className="text-2xl font-heading text-secondary flex items-center">
                <Search className="mr-4 text-primary" size={24} /> Discovery Filter
              </CardTitle>
              <div className="relative w-full md:w-1/2">
                <Input
                  type="search"
                  placeholder="Search catalog (name, category, brand)..."
                  className="pl-14 h-14 bg-primary/5 border-none rounded-2xl focus-visible:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-primary/30" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {fetchError ? (
              <div className="text-center py-32">
                <AlertTriangle size={64} className="mx-auto mb-6 text-destructive opacity-30" />
                <p className="font-heading text-2xl text-secondary">Logistics Interrupted</p>
                <p className="text-muted-foreground mt-2 mb-8">{fetchError}</p>
                <Button onClick={() => fetchProducts(true)} className="rounded-full px-10">RETRY SYNC</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-secondary/5">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="py-8 pl-10 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Visual</TableHead>
                      <TableHead className="py-8 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Design Identity</TableHead>
                      <TableHead className="py-8 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Classification</TableHead>
                      <TableHead className="py-8 text-right text-[10px] uppercase tracking-widest font-bold text-secondary/50">Valuation</TableHead>
                      <TableHead className="py-8 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Inventory</TableHead>
                      <TableHead className="py-8 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Status</TableHead>
                      <TableHead className="py-8 pr-10 text-right text-[10px] uppercase tracking-widest font-bold text-secondary/50">Curation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && products.length === 0 ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={`skeleton-prod-${i}`} className="border-primary/5">
                          <TableCell className="pl-10"><Skeleton className="h-20 w-16 rounded-xl" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-48 rounded" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32 rounded" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20 ml-auto rounded" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16 rounded" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                          <TableCell className="pr-10 text-right"><Skeleton className="h-12 w-24 rounded-xl inline-block" /></TableCell>
                        </TableRow>
                      ))
                    ) : products.map((product) => (
                      <TableRow key={product.id} className="hover:bg-primary/5 transition-all duration-300 border-primary/5 group">
                        <TableCell className="pl-10 py-6">
                          <div className="relative h-20 w-16 rounded-xl overflow-hidden border-2 border-primary/5 shadow-md">
                            <Image src={product.images?.[0] || 'https://placehold.co/100x133.png?text=No+Img'} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-bold text-secondary text-base">{product.name}</p>
                          <p className="text-[10px] uppercase font-bold text-primary tracking-widest mt-1">{product.brand || 'Authentic'}</p>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs font-bold uppercase tracking-tighter">{product.category}</TableCell>
                        <TableCell className="text-right font-heading text-primary font-bold text-lg">KSh {product.price.toLocaleString()}</TableCell>
                        <TableCell className="text-secondary/60 text-xs font-medium">{product.stockQuantity} pieces</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-widest border-2 ${
                            product.isPublished && product.stockQuantity > 0 ? 'border-green-200 text-green-600 bg-green-50' : 'border-destructive/20 text-destructive bg-destructive/5'
                          }`}>
                            {product.isPublished && product.stockQuantity > 0 ? 'ACTIVE' : 'UNPUBLISHED'}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-10 text-right space-x-3">
                          <Button variant="outline" size="icon" className="h-12 w-12 border-2 border-primary/10 hover:border-primary rounded-2xl" asChild>
                            <Link href={`/admin/products/edit/${product.slug}`}><Edit size={18} className="text-blue-500" /></Link>
                          </Button>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-12 w-12 border-2 border-primary/10 hover:border-destructive rounded-2xl" onClick={() => setProductToDelete(product)}>
                              <Trash2 size={18} className="text-destructive" />
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
        
        {hasMore && !loading && (
          <div className="flex justify-center pt-8 pb-20">
            <Button variant="outline" className="rounded-full px-12 h-14 border-secondary font-bold tracking-widest" onClick={() => fetchProducts(false)}>
              LOAD MORE DESIGNS
            </Button>
          </div>
        )}
      </div>

      {productToDelete && (
        <AlertDialogContent className="border-none rounded-[2rem] p-10">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-3xl text-secondary">Archive Design?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-lg leading-relaxed">
              This will permanently decommission <span className="text-primary font-bold">"{productToDelete.name}"</span> from the active heritage collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-4">
            <AlertDialogCancel className="rounded-2xl h-14 px-8">CANCEL</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive hover:bg-destructive/90 rounded-2xl h-14 px-8 font-bold tracking-widest shadow-xl shadow-destructive/20" disabled={!!deletingProductId}>
              {deletingProductId === productToDelete.id && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
              CONFIRM ARCHIVE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
