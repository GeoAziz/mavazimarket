
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
import { PlusCircle, Edit, Trash2, Layers, Loader2, AlertTriangle, Layers3, FolderTree } from 'lucide-react';
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
import Image from 'next/image';

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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-heading text-secondary mb-1">Heritage Curation</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Collection & Taxonomy Management</p>
          </div>
          <Button asChild className="bg-primary text-white font-bold tracking-widest h-14 px-10 shadow-xl shadow-primary/20">
            <Link href="/admin/categories/new">
              <PlusCircle size={20} className="mr-3" /> NEW COLLECTION
            </Link>
          </Button>
        </div>

        <Card className="shadow-2xl border-none rounded-3xl overflow-hidden">
          <CardHeader className="bg-card p-10 border-b border-primary/5">
            <CardTitle className="text-2xl font-heading text-secondary flex items-center">
              <Layers3 className="mr-4 text-primary" size={24} /> Active Taxonomy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-secondary/5">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="py-8 pl-10 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Visual</TableHead>
                    <TableHead className="py-8 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Collection Name</TableHead>
                    <TableHead className="py-8 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Taxonomy Slug</TableHead>
                    <TableHead className="py-8 text-[10px] uppercase tracking-widest font-bold text-secondary/50">Sub-Branches</TableHead>
                    <TableHead className="py-8 pr-10 text-right text-[10px] uppercase tracking-widest font-bold text-secondary/50">Archive Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                      [...Array(3)].map((_, i) => (
                          <TableRow key={`skeleton-cat-${i}`} className="border-primary/5">
                              <TableCell className="pl-10"><Skeleton className="h-16 w-16 rounded-xl" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-3/4 rounded" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-full rounded" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-1/2 rounded" /></TableCell>
                              <TableCell className="pr-10 text-right space-x-2">
                                  <Skeleton className="h-12 w-12 rounded-xl inline-block" />
                                  <Skeleton className="h-12 w-12 rounded-xl inline-block" />
                              </TableCell>
                          </TableRow>
                      ))
                  ) : categories.length > 0 ? categories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-primary/5 transition-all duration-300 group border-primary/5">
                      <TableCell className="pl-10">
                        <div className="relative h-16 w-16 rounded-xl overflow-hidden border-2 border-primary/5 shadow-md">
                          <Image 
                            src={category.image || 'https://placehold.co/100x100.png?text=Collection'} 
                            alt={category.name} 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-secondary text-base">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs font-bold uppercase tracking-tighter">{category.slug}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-secondary/60 text-xs font-medium">
                          <FolderTree size={14} className="text-primary" />
                          {category.subcategories?.length || 0} branches
                        </div>
                      </TableCell>
                      <TableCell className="pr-10 text-right space-x-3">
                        <Button variant="outline" size="icon" className="h-12 w-12 border-2 border-primary/10 hover:border-primary rounded-2xl transition-all" asChild>
                          <Link href={`/admin/categories/edit/${category.id}`}>
                            <Edit size={18} className="text-blue-500" />
                          </Link>
                        </Button>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="h-12 w-12 border-2 border-primary/10 hover:border-destructive rounded-2xl transition-all" onClick={() => setCategoryToDelete(category)}>
                            <Trash2 size={18} className="text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-96 text-center">
                        <div className="flex flex-col items-center justify-center space-y-6 opacity-20">
                          <Layers size={80} strokeWidth={1} />
                          <p className="font-heading text-3xl">No collections curated yet.</p>
                          <Button asChild variant="outline" className="border-secondary opacity-100"><Link href="/admin/categories/new">INITIALIZE FIRST COLLECTION</Link></Button>
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
        <AlertDialogContent className="border-none rounded-[2rem] p-10 max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-3xl text-secondary">Archive Collection?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground leading-relaxed text-lg">
              Decommissioning <span className="text-primary font-bold">"{categoryToDelete.name}"</span> will remove it from storefront navigation. Associated designs will remain in the database but may lose their classification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-4">
            <AlertDialogCancel className="rounded-2xl h-14 px-8" onClick={() => setCategoryToDelete(null)}>CANCEL</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteCategory} className="bg-destructive hover:bg-destructive/90 rounded-2xl h-14 px-8 font-bold tracking-widest shadow-xl shadow-destructive/20" disabled={isProcessingDelete}>
              {isProcessingDelete && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
              CONFIRM ARCHIVE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
