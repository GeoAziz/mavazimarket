
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle, UploadCloud, DollarSign, Package, Tag, Palette, Ruler, Layers, Loader2 } from 'lucide-react';
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types"; // For fetching categories

// Function to generate slug (simplified)
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, ''); // Remove all non-word chars
};

const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().positive("Price must be a positive number."),
  category: z.string().min(1, "Category is required."),
  subcategory: z.string().optional().default(""),
  stockQuantity: z.coerce.number().int().min(0, "Stock can't be negative.").default(0),
  sku: z.string().optional().default(""),
  brand: z.string().optional().default(""),
  material: z.string().optional().default(""),
  images: z.string().optional().describe("Comma-separated image URLs").default(""), // Storing as string for simplicity
  sizes: z.string().optional().describe("Comma-separated sizes (e.g., S,M,L)").default(""),
  colors: z.string().optional().describe("Comma-separated colors (e.g., Red,Blue)").default(""),
  tags: z.string().optional().describe("Comma-separated tags (e.g., new-arrival,best-seller)").default(""),
  isPublished: z.boolean().default(true),
  dataAiHint: z.string().optional().default(""),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function AdminAddProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]); // To populate category select

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catCol = collection(db, "categories");
        const catSnapshot = await getDocs(catCol);
        setCategories(catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
      } catch (error) {
        console.error("Error fetching categories: ", error);
        toast({ title: "Error", description: "Could not load categories.", variant: "destructive" });
      }
    };
    fetchCategories();
  }, [toast]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      subcategory: "",
      stockQuantity: 0,
      sku: "",
      brand: "",
      material: "",
      images: "",
      sizes: "",
      colors: "",
      tags: "",
      isPublished: true,
      dataAiHint: ""
    },
  });

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    try {
      const slug = generateSlug(data.name);
      const productData = {
        ...data,
        slug,
        images: data.images ? data.images.split(',').map(img => img.trim()).filter(img => img) : [],
        sizes: data.sizes ? data.sizes.split(',').map(s => s.trim()).filter(s => s) : [],
        colors: data.colors ? data.colors.split(',').map(c => c.trim()).filter(c => c) : [],
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        averageRating: 0, // Default average rating
        // reviews will be a subcollection, so not stored directly on product
      };

      const docRef = await addDoc(collection(db, "products"), productData);
      console.log("New product created with ID: ", docRef.id);
      
      toast({
        title: "Product Created!",
        description: `${data.name} has been successfully created.`,
      });
      form.reset(); // Reset form after successful submission
      router.push('/admin/products'); // Redirect to product list
    } catch (error) {
      console.error("Error creating product: ", error);
      toast({
        title: "Error Creating Product",
        description: "There was an issue saving the product. Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  }

  const selectedCategoryObj = categories.find(c => c.id === form.watch("category"));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <PlusCircle size={30} className="mr-3 text-accent" /> Add New Product
        </h1>
        <Button variant="outline" asChild>
            <Link href="/admin/products">Back to Product List</Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center"><Package className="mr-2 text-primary/80"/>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl><Input placeholder="e.g. Men's Premium Cotton T-Shirt" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea placeholder="Detailed product description..." {...field} rows={5} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card className="shadow-md">
                 <CardHeader><CardTitle className="flex items-center"><UploadCloud className="mr-2 text-primary/80"/>Media</CardTitle></CardHeader>
                 <CardContent>
                    <FormField control={form.control} name="images" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Image URLs (comma-separated)</FormLabel>
                        <FormControl><Textarea placeholder="https://placehold.co/600x800.png, https://placehold.co/600x800.png" {...field} rows={2} disabled={isSubmitting}/></FormControl>
                         <FormDescription>Enter image URLs separated by commas. First image is the primary.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="dataAiHint" render={({ field }) => (
                        <FormItem className="mt-4">
                        <FormLabel>Image AI Hint (Optional)</FormLabel>
                        <FormControl><Input placeholder="e.g. mens t-shirt" {...field} disabled={isSubmitting} /></FormControl>
                        <FormDescription>Keywords for AI if images are placeholders (max 2 words).</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )} />
                 </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader><CardTitle className="flex items-center"><DollarSign className="mr-2 text-primary/80"/>Pricing & Inventory</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                   <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (KSh)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g. 1200" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="stockQuantity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g. 50" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="sku" render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU (Optional)</FormLabel>
                      <FormControl><Input placeholder="e.g. MAV-TSH-BLK-M" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader><CardTitle className="flex items-center">Variants</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="sizes" render={({ field }) => (
                        <FormItem><FormLabel className="flex items-center"><Ruler className="mr-2 text-primary/80"/>Sizes (comma-separated)</FormLabel>
                        <FormControl><Input placeholder="e.g. S,M,L,XL" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="colors" render={({ field }) => (
                        <FormItem><FormLabel className="flex items-center"><Palette className="mr-2 text-primary/80"/>Colors (comma-separated)</FormLabel>
                        <FormControl><Input placeholder="e.g. Black,White,Navy" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
                    )} />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-md">
                <CardHeader><CardTitle className="flex items-center"><Layers className="mr-2 text-primary/80"/>Organization</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting || categories.length === 0}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="subcategory" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value} 
                        disabled={isSubmitting || !selectedCategoryObj || selectedCategoryObj.subcategories.length === 0}
                      >
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a subcategory" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {selectedCategoryObj?.subcategories.map(subcat => (
                            <SelectItem key={subcat.slug} value={subcat.slug}>{subcat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="brand" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand (Optional)</FormLabel>
                      <FormControl><Input placeholder="e.g. Mavazi Basics" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="material" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material (Optional)</FormLabel>
                      <FormControl><Input placeholder="e.g. Cotton" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
              <Card className="shadow-md">
                 <CardHeader><CardTitle className="flex items-center"><Tag className="mr-2 text-primary/80"/>Tags & Status</CardTitle></CardHeader>
                 <CardContent className="space-y-4">
                    <FormField control={form.control} name="tags" render={({ field }) => (
                        <FormItem><FormLabel>Tags (comma-separated)</FormLabel>
                        <FormControl><Input placeholder="e.g. new-arrival, best-seller, sale" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="isPublished" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Publish Product</FormLabel>
                                <FormDescription className="text-xs">Make this product visible on the storefront.</FormDescription>
                            </div>
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl>
                        </FormItem>
                    )} />
                 </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSubmitting}>Clear Form</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creating..." : <><PlusCircle size={18} className="mr-2" /> Create Product</>}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
