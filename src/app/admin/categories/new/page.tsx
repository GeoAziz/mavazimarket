
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Textarea import removed as not used directly, form fields use Input
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle, Trash2, Layers, Loader2, ArrowLeft, UploadCloud } from 'lucide-react';
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image"; // For image preview

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '');
};

const subcategorySchema = z.object({
  name: z.string().min(2, "Subcategory name is too short.").default(""),
  slug: z.string().min(2, "Subcategory slug is too short, or auto-generate.").optional().default(""),
  priceRange: z.string().optional().default("KSh 0 - KSh 0"), 
});

const categoryFormSchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters.").default(""),
  slug: z.string().min(2, "Slug must be at least 2 characters.").optional().default(""),
  // image field removed for file input
  dataAiHint: z.string().optional().default(""),
  subcategories: z.array(subcategorySchema).optional().default([]),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function AdminAddCategoryPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      dataAiHint: "",
      subcategories: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subcategories",
  });

  const watchName = form.watch("name");

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const removeImagePreview = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
     const fileInput = document.getElementById('category-image-upload') as HTMLInputElement;
     if (fileInput) fileInput.value = ''; // Reset file input
  };

  async function onSubmit(data: CategoryFormValues) {
    setIsSubmitting(true);
    try {
      // Placeholder for Firebase Storage upload logic for imageFile
      // For now, we'll use a placeholder URL if a file is selected
      let imageUrl = "https://placehold.co/400x300.png"; // Default placeholder
      if (imageFile) {
        imageUrl = `https://placeholder.com/${imageFile.name}`; // Mock uploaded URL
        // In a real app: imageUrl = await uploadImageToStorage(imageFile);
      }
      
      const finalSlug = data.slug || generateSlug(data.name);
      const categoryData = {
        ...data,
        slug: finalSlug,
        image: imageUrl,
        subcategories: data.subcategories?.map(sub => ({
            ...sub,
            id: sub.slug || generateSlug(sub.name), 
            slug: sub.slug || generateSlug(sub.name)
        })) || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "categories"), categoryData);
      
      toast({
        title: "Category Created!",
        description: `${data.name} has been successfully created.`,
      });
      form.reset();
      removeImagePreview(); // Clear image preview and file state
      router.push('/admin/categories');
    } catch (error) {
      console.error("Error creating category: ", error);
      toast({
        title: "Error Creating Category",
        description: "There was an issue saving the category.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  }

  // Cleanup object URL on component unmount
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <PlusCircle size={30} className="mr-3 text-accent" /> Add New Category
        </h1>
        <Button variant="outline" asChild>
          <Link href="/admin/categories"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Category List</Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center"><Layers className="mr-2 text-primary/80"/>Category Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl><Input placeholder="e.g. Electronics" {...field} disabled={isSubmitting} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (Optional)</FormLabel>
                  <FormControl><Input placeholder={generateSlug(watchName || "category-name")} {...field} disabled={isSubmitting} /></FormControl>
                  <FormDescription>If left blank, a slug will be auto-generated from the name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormItem>
                <FormLabel className="flex items-center"><UploadCloud className="mr-2"/>Category Image</FormLabel>
                <FormControl>
                  <Input 
                    id="category-image-upload"
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    disabled={isSubmitting}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </FormControl>
                 <FormDescription>Upload an image for the category.</FormDescription>
              </FormItem>

              {imagePreview && (
                <div className="mt-2 relative group w-48 h-32 border rounded-md p-1">
                  <Image src={imagePreview} alt="Image Preview" layout="fill" objectFit="cover" className="rounded-md" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={removeImagePreview}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              )}

              <FormField control={form.control} name="dataAiHint" render={({ field }) => (
                <FormItem>
                  <FormLabel>Image AI Hint (Optional)</FormLabel>
                  <FormControl><Input placeholder="e.g. category fashion" {...field} disabled={isSubmitting} /></FormControl>
                  <FormDescription>Keywords for AI if the image is a placeholder (max 2 words).</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Subcategories</CardTitle>
              <CardDescription>Add or remove subcategories associated with this main category.</CardDescription>
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
                onClick={() => append({ name: "", slug: "", priceRange: "KSh 0 - KSh 0" })}
                disabled={isSubmitting}
              >
                <PlusCircle size={18} className="mr-2"/> Add Subcategory
              </Button>
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => {form.reset(); removeImagePreview();}} disabled={isSubmitting}>Clear Form</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle size={18} className="mr-2" />}
              {isSubmitting ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
