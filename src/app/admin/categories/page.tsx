
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
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

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

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    setDeletingCategoryId(categoryId);
    // Note: True deletion should check for associated products and handle them (e.g., reassign, warn).
    // For this prototype, we'll directly delete the category document.
    try {
      await deleteDoc(doc(db, "categories", categoryId));
      toast({
        title: "Category Deleted (Mock)",
        description: `${categoryName} has been deleted. Reassigning products would be needed in a real app.`,
      });
      fetchCategories(); // Re-fetch to update the list
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({ title: "Error", description: "Could not delete category.", variant: "destructive" });
    }
    setDeletingCategoryId(null);
  };


  return (
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={deletingCategoryId === category.id}>
                            {deletingCategoryId === category.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={18} className="text-destructive hover:text-red-700" />}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the category "{category.name}". 
                              Products associated with this category might need manual reassignment.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteCategory(category.id, category.name)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Yes, delete category
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
  );
}
