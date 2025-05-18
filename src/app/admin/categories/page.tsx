
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
import { PlusCircle, Edit, Trash2, Layers, Loader2 } from 'lucide-react';
import type { Category } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, orderBy, deleteDoc, doc, getCountFromServer, where } from 'firebase/firestore';
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
  const [associatedProductsCount, setAssociatedProductsCount] = useState(0);
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'options' | 'finalConfirmDangerous'>('confirm');
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const categoriesRef = collection(db, "categories");
      const q = query(categoriesRef, orderBy("name"));
      const querySnapshot = await getDocs(q);
      const fetchedCategories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({ title: "Error", description: "Could not fetch categories.", variant: "destructive" });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const checkProductAssociation = async (category: Category): Promise<number> => {
    // This is a MOCK check. In a real app, you'd query Firestore products collection
    // where("category", "==", category.id) OR where("categorySlug", "==", category.slug)
    // For now, let's simulate some categories having products.
    console.log(`Mock checking products for category: ${category.name} (slug: ${category.slug})`);
    // const productsRef = collection(db, "products");
    // const q = query(productsRef, where("category", "==", category.slug)); // Assuming category stores slug
    // const snapshot = await getCountFromServer(q);
    // return snapshot.data().count;
    return category.slug === 'men' || category.slug === 'women' ? 5 : 0; // Mock
  };

  const handleDeleteCategoryClick = async (category: Category) => {
    setIsProcessingDelete(true);
    setCategoryToDelete(category);
    const count = await checkProductAssociation(category);
    setAssociatedProductsCount(count);
    setIsProcessingDelete(false);

    if (count > 0) {
      setDeleteStep('options');
    } else {
      setDeleteStep('confirm');
    }
  };

  const executeDeleteCategory = async (strategy: 'reassign' | 'deleteProducts' | 'simple' = 'simple') => {
    if (!categoryToDelete) return;
    setIsProcessingDelete(true);
    
    // MOCK Deletion logic
    console.log(`Mock Deleting category: ${categoryToDelete.name} with strategy: ${strategy}`);
    // In a real app:
    // if (strategy === 'reassign') { /* Reassign products logic */ }
    // if (strategy === 'deleteProducts') { /* Delete associated products logic */ }
    // await deleteDoc(doc(db, "categories", categoryToDelete.id));
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async operation

    toast({
      title: "Category Deleted (Mock)",
      description: `${categoryToDelete.name} has been (mock) deleted. Strategy: ${strategy}. Product reassignment/deletion would occur in a real app.`,
    });
    fetchCategories(); // Re-fetch to update the list
    setCategoryToDelete(null);
    setIsProcessingDelete(false);
    setDeleteStep('confirm'); // Reset dialog state
  };


  return (
    <AlertDialog>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary flex items-center">
            <Layers size={30} className="mr-3 text-accent" /> Manage Categories
          </h1>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/admin/categories/new">
              <PlusCircle size={20} className="mr-2" /> Add New Category
            </Link>
          </Button>
        </div>

        <Card className="shadow-lg w-full">
          <CardHeader>
            <CardTitle className="text-xl">Category List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Subcategories</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                      [...Array(3)].map((_, i) => (
                          <TableRow key={`skeleton-cat-${i}`}>
                              <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                              <TableCell className="text-right space-x-2">
                                  <Skeleton className="h-8 w-8 rounded-md inline-block" />
                                  <Skeleton className="h-8 w-8 rounded-md inline-block" />
                              </TableCell>
                          </TableRow>
                      ))
                  ) : categories.length > 0 ? categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium text-foreground whitespace-nowrap">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">{category.slug}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">{category.subcategories?.length || 0}</TableCell>
                      <TableCell className="text-right space-x-1 whitespace-nowrap">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/categories/edit/${category.id}`}>
                            <Edit size={18} className="text-blue-500 hover:text-blue-700" />
                          </Link>
                        </Button>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteCategoryClick(category)} disabled={isProcessingDelete && categoryToDelete?.id === category.id}>
                            {isProcessingDelete && categoryToDelete?.id === category.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={18} className="text-destructive hover:text-red-700" />}
                          </Button>
                        </AlertDialogTrigger>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No categories found.
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteStep === 'options' ? `Category "${categoryToDelete.name}" has Products` : 
               deleteStep === 'finalConfirmDangerous' ? `Confirm Deletion of Category & ${associatedProductsCount} Products` :
               `Delete Category "${categoryToDelete.name}"?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteStep === 'options' && (
                <>
                  This category has {associatedProductsCount} product(s) associated with it. 
                  How would you like to proceed?
                </>
              )}
              {deleteStep === 'confirm' && (
                <>
                  This action cannot be undone. This will permanently delete the category "{categoryToDelete.name}". 
                  {associatedProductsCount > 0 ? ` It has ${associatedProductsCount} associated products.` : ''}
                </>
              )}
              {deleteStep === 'finalConfirmDangerous' && (
                <>
                  You are about to delete the category "{categoryToDelete.name}" AND all its {associatedProductsCount} associated products.
                  This action is irreversible. Are you absolutely sure?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setCategoryToDelete(null); setDeleteStep('confirm');}} disabled={isProcessingDelete}>Cancel</AlertDialogCancel>
            {deleteStep === 'confirm' && (
              <AlertDialogAction 
                onClick={() => executeDeleteCategory('simple')}
                className="bg-destructive hover:bg-destructive/90"
                disabled={isProcessingDelete}
              >
                {isProcessingDelete && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, delete category
              </AlertDialogAction>
            )}
            {deleteStep === 'options' && (
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                 <Button 
                  variant="outline"
                  onClick={() => executeDeleteCategory('reassign')} // This is still mock
                  disabled={isProcessingDelete}
                  className="flex-1"
                >
                   {isProcessingDelete && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reassign Products & Delete (Mock)
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteStep('finalConfirmDangerous')}
                  disabled={isProcessingDelete}
                  className="flex-1"
                >
                   {isProcessingDelete && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete Category & Products (Mock)
                </Button>
              </div>
            )}
            {deleteStep === 'finalConfirmDangerous' && (
               <AlertDialogAction 
                onClick={() => executeDeleteCategory('deleteProducts')}
                className="bg-red-700 hover:bg-red-800"
                disabled={isProcessingDelete}
              >
                {isProcessingDelete && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Delete ALL
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
