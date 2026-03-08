
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, Layers, Loader2, AlertTriangle, Layers3 } from 'lucide-react';
import type { Category } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      if (!db) return;
      const categoriesRef = collection(db, "categories");
      const q = query(categoriesRef, orderBy("name"));
      const querySnapshot = await getDocs(q);
      const fetchedCategories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Curation sync error:", error);
      toast({ title: "Sync Error", description: "Could not fetch collections from the database.", variant: "destructive" });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const executeDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsProcessingDelete(true);
    
    try {
      await deleteDoc(doc(db!, "categories", categoryToDelete.id));
      toast({ title: "Collection Removed", description: `"${categoryToDelete.name}" has been removed from the archive.` });
      fetchCategories();
    } catch (error) {
      toast({ title: "Removal Failed", description: "Could not decommission collection.", variant: "destructive" });
    } finally {
      setIsProcessingDelete(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <AlertDialog>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading text-secondary">Heritage Curation</h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Collection & Taxonomy Management</p>
          </div>
          <Button asChild className="bg-primary text-white font-bold tracking-widest h-12 px-8">
            <Link href="/admin/categories/new">
              <PlusCircle size={18} className="mr-2" /> NEW COLLECTION
            </Link>
          </Button>
        </div>

        <Card className="shadow-2xl border-none rounded-2xl overflow-hidden">
          <CardHeader className="bg-card p-8 border-b border-primary/5">
            <CardTitle className="text-xl font-heading text-secondary flex items-center">
              <Layers3 className="mr-3 text-primary" size={20} /> Active Taxonomy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-secondary/5">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="py-6 pl-8 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Collection Name</TableHead>
                    <TableHead className="py-6 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Taxonomy Slug</TableHead>
                    <TableHead className="py-6 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Sub-Branches</TableHead>
                    <TableHead className="py-6 pr-8 text-right text-[10px] uppercase tracking-widest font-bold text-secondary/50">Archive Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                      [...Array(3)].map((_, i) => (
                          <TableRow key={`skeleton-cat-${i}`} className="border-primary/5">
                              <TableCell className="pl-8"><Skeleton className="h-4 w-3/4 rounded" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-full rounded" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-1/2 rounded" /></TableCell>
                              <TableCell className="pr-8 text-right space-x-2">
                                  <Skeleton className="h-10 w-10 rounded-xl inline-block" />
                                  <Skeleton className="h-10 w-10 rounded-xl inline-block" />
                              </TableCell>
                          </TableRow>
                      ))
                  ) : categories.length > 0 ? categories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-primary/5 transition-colors group border-primary/5">
                      <TableCell className="pl-8 font-bold text-secondary text-sm">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs font-bold uppercase tracking-tighter">{category.slug}</TableCell>
                      <TableCell className="text-secondary/60 text-xs font-medium">{category.subcategories?.length || 0} branches</TableCell>
                      <TableCell className="pr-8 text-right space-x-2">
                        <Button variant="outline" size="icon" className="h-10 w-10 border-2 border-primary/10 hover:border-primary rounded-xl" asChild>
                          <Link href={`/admin/categories/edit/${category.id}`}>
                            <Edit size={16} className="text-blue-500" />
                          </Link>
                        </Button>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="h-10 w-10 border-2 border-primary/10 hover:border-destructive rounded-xl" onClick={() => setCategoryToDelete(category)}>
                            <Trash2 size={16} className="text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4 opacity-20">
                          <Layers size={64} strokeWidth={1} />
                          <p className="font-heading text-2xl">No collections curated yet.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      {categoryToDelete && (
        <AlertDialogContent className="border-none rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-2xl text-secondary">Archive Collection?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Decommissioning "{categoryToDelete.name}" will remove it from storefront navigation. Associated designs will remain in the database but may lose their classification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteCategory} className="bg-destructive hover:bg-destructive/90 rounded-xl" disabled={isProcessingDelete}>
              {isProcessingDelete && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              CONFIRM ARCHIVE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
