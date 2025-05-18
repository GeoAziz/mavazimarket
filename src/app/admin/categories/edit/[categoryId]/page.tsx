
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Save, Trash2, Layers, Loader2, ArrowLeft, PlusCircle } from 'lucide-react';
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, use } from "react"; // Added use
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import type { Category as CategoryType } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface EditCategoryPageProps {
  params: { categoryId: string }; 
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '');
};

const subcategorySchema = z.object({
  id: z.string().optional().default(""), // Keep existing ID or allow new one
  name: z.string().min(2, "Subcategory name is too short.").default(""),
  slug: z.string().min(2, "Subcategory slug is too short, or auto-generate.").optional().default(""),
  priceRange: z.string().optional().default("KSh 0 - KSh 0"),
});

const categoryFormSchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters.").default(""),
  slug: z.string().min(2, "Slug must be at least 2 characters.").optional().default(""),
  image: z.string().url("Must be a valid URL.").optional().or(z.literal("")).default("https://placehold.co/400x300.png"),
  dataAiHint: z.string().optional().default(""),
  subcategories: z.array(subcategorySchema).optional().default([]),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function AdminEditCategoryPage({ params }: EditCategoryPageProps) {
  const { categoryId } = use(params); // Unwtrapping params
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryType | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: categoryFormSchema.parse({}), // Initialize with Zod defaults
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subcategories",
  });
  
  const watchName = form.watch("name");

  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) {
        setIsLoadingCategory(false); // Stop loading if no categoryId
        toast({ title: "Error", description: "Category ID is missing.", variant: "destructive" });
        router.push('/admin/categories');
        return;
      }
      setIsLoadingCategory(true);
      try {
        const categoryDocRef = doc(db, "categories", categoryId);
        const docSnap = await getDoc(categoryDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as CategoryType;
          setCategoryToEdit({ ...data, id: docSnap.id });
          form.reset({
            name: data.name || "",
            slug: data.slug || "",
            image: data.image || "https://placehold.co/400x300.png",
            dataAiHint: data.dataAiHint || "",
            subcategories: data.subcategories?.map(sub => ({
                id: sub.id || sub.slug || "", // Ensure ID exists
                name: sub.name || "",
                slug: sub.slug || "",
                priceRange: sub.priceRange || "KSh 0 - KSh 0",
            })) || [],
          });
        } else {
          toast({ title: "Error", description: "Category not found.", variant: "destructive" });
          setCategoryToEdit(null);
          router.push('/admin/categories');
        }
      } catch (error) {
        console.error("Error fetching category:", error);
        toast({ title: "Error", description: "Could not fetch category data.", variant: "destructive" });
      }
      setIsLoadingCategory(false);
    };
    fetchCategory();
  }, [categoryId, form, toast, router]);

  async function onSubmit(data: CategoryFormValues) {
    if (!categoryToEdit) return;
    setIsSubmitting(true);
    try {
      const categoryDocRef = doc(db, "categories", categoryToEdit.id);
      const finalSlug = data.slug || generateSlug(data.name);
      const updatedCategoryData = {
        ...data,
        slug: finalSlug,
        subcategories: data.subcategories?.map(sub => ({
            ...sub,
            id: sub.id || sub.slug || generateSlug(sub.name), // Ensure new/existing subs get an ID
            slug: sub.slug || generateSlug(sub.name)
        })) || [],
        updatedAt: Timestamp.now(),
      };
      await updateDoc(categoryDocRef, updatedCategoryData);
      toast({
        title: "Category Updated!",
        description: `${data.name} has been successfully updated.`,
      });
      router.push('/admin/categories');
    } catch (error) {
      console.error("Error updating category:", error);
      toast({ title: "Error", description: "Could not update category.", variant: "destructive" });
    }
    setIsSubmitting(false);
  }

  if (isLoadingCategory) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/5" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  
  if (!categoryToEdit && !isLoadingCategory) { 
    return (
      <div className="space-y-6 text-center py-10">
        <h1 className="text-3xl font-bold text-destructive">Category Not Found</h1>
        <Button asChild><Link href="/admin/categories"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Category List</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <Layers size={30} className="mr-3 text-accent" /> Edit Category: {categoryToEdit?.name}
        </h1>
        <Button variant="outline" asChild>
          <Link href="/admin/categories"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Category List</Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">Category Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl><Input {...field} disabled={isSubmitting} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl><Input placeholder={generateSlug(watchName || "category-name")} {...field} disabled={isSubmitting} /></FormControl>
                   <FormDescription>If left blank and name changes, slug will be auto-regenerated based on new name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="image" render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl><Input {...field} disabled={isSubmitting} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="dataAiHint" render={({ field }) => (
                <FormItem>
                  <FormLabel>Image AI Hint (Optional)</FormLabel>
                  <FormControl><Input {...field} disabled={isSubmitting} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Subcategories</CardTitle>
              <CardDescription>Manage subcategories for this category.</CardDescription>
            </CardHeader>
            <CardContent>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end border p-4 rounded-md mb-4">
                   <FormField control={form.control} name={`subcategories.${index}.name`} render={({ field: subField }) => (
                    <FormItem>
                      <FormLabel>Subcategory Name</FormLabel>
                      <FormControl><Input {...subField} placeholder="e.g. Smartphones" disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`subcategories.${index}.slug`} render={({ field: subField }) => (
                    <FormItem>
                      <FormLabel>Subcategory Slug (Optional)</FormLabel>
                      <FormControl><Input {...subField} placeholder={generateSlug(form.watch(`subcategories.${index}.name`) || "sub-name")} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`subcategories.${index}.priceRange`} render={({ field: subField }) => (
                    <FormItem>
                      <FormLabel>Price Range String</FormLabel>
                      <FormControl><Input {...subField} placeholder="KSh 10k - 50k" disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={isSubmitting}>
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => append(subcategorySchema.parse({}))} // Use schema default for new subcategory
                disabled={isSubmitting}
              >
                <PlusCircle size={18} className="mr-2"/> Add Subcategory
              </Button>
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save size={18} className="mr-2" />}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
