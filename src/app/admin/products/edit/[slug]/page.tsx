
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Edit3, UploadCloud, DollarSign, Package, Tag, Palette, Ruler, Layers, Save, Trash2 } from 'lucide-react';
import Link from "next/link";
import { mockProducts } from '@/lib/mock-data'; // For fetching mock product data
import { useEffect, use } from "react"; // Modified import to include 'use'

interface EditProductPageProps {
  params: { slug: string }; // The prop received might be a Promise, but React.use will resolve it to this type.
}

// Same schema as add product page
const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().positive("Price must be a positive number."),
  category: z.string().min(1, "Category is required."),
  subcategory: z.string().optional(),
  stockQuantity: z.coerce.number().int().min(0, "Stock can't be negative."),
  sku: z.string().optional(),
  brand: z.string().optional(),
  material: z.string().optional(),
  images: z.string().optional().describe("Comma-separated image URLs"),
  sizes: z.string().optional().describe("Comma-separated sizes (e.g., S,M,L)"),
  colors: z.string().optional().describe("Comma-separated colors (e.g., Red,Blue)"),
  tags: z.string().optional().describe("Comma-separated tags (e.g., new-arrival,best-seller)"),
  isPublished: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function AdminEditProductPage({ params: paramsProp }: EditProductPageProps) {
  // Use React.use to unwrap the params if it's a Promise, as suggested by the Next.js warning.
  const params = use(paramsProp);
  const { slug } = params;
  const productToEdit = mockProducts.find(p => p.slug === slug);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    // Default values will be set by useEffect
  });

  useEffect(() => {
    if (productToEdit) {
      form.reset({
        name: productToEdit.name,
        description: productToEdit.description,
        price: productToEdit.price,
        category: productToEdit.category,
        subcategory: productToEdit.subcategory,
        stockQuantity: productToEdit.stockQuantity,
        sku: productToEdit.id, // Using id as SKU for mock
        brand: productToEdit.brand,
        material: productToEdit.material,
        images: productToEdit.images.join(','),
        sizes: productToEdit.sizes.join(','),
        colors: productToEdit.colors.join(','),
        tags: productToEdit.tags?.join(','),
        isPublished: productToEdit.stockQuantity > 0, // Example logic
      });
    }
  }, [productToEdit, form, slug]); // Added slug to dependencies as productToEdit depends on it.


  function onSubmit(data: ProductFormValues) {
    console.log("Updated product data for slug", slug, ":", data);
    alert("Product updated successfully! (Mock)");
  }

  if (!productToEdit && slug) { // Check slug as well to avoid premature "not found" if params are still resolving.
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-destructive">Product Not Found</h1>
        <p className="text-muted-foreground">The product with slug "{slug}" could not be found.</p>
        <Button asChild><Link href="/admin/products">Back to Product List</Link></Button>
      </div>
    );
  }
  
  if (!productToEdit && !slug) {
     // Still loading or params not available yet
    return <div>Loading product details...</div>;
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <Edit3 size={30} className="mr-3 text-accent" /> Edit Product: {productToEdit?.name || slug}
        </h1>
         <Button variant="outline" asChild>
            <Link href="/admin/products">Back to Product List</Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
           <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Main Product Information Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center"><Package className="mr-2 text-primary/80"/>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl><Input placeholder="e.g. Men's Premium Cotton T-Shirt" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea placeholder="Detailed product description..." {...field} rows={5} /></FormControl>
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
                        <FormControl><Textarea placeholder="https://placehold.co/600x800.png" {...field} rows={2}/></FormControl>
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
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="stockQuantity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="sku" render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU (Read-only for mock)</FormLabel>
                      <FormControl><Input {...field} readOnly /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader><CardTitle className="flex items-center">Variants (Simplified)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="sizes" render={({ field }) => (
                        <FormItem><FormLabel className="flex items-center"><Ruler className="mr-2 text-primary/80"/>Sizes (comma-separated)</FormLabel>
                        <FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="colors" render={({ field }) => (
                        <FormItem><FormLabel className="flex items-center"><Palette className="mr-2 text-primary/80"/>Colors (comma-separated)</FormLabel>
                        <FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Column for Organization, etc. */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-md">
                <CardHeader><CardTitle className="flex items-center"><Layers className="mr-2 text-primary/80"/>Organization</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="men">Men</SelectItem>
                          <SelectItem value="women">Women</SelectItem>
                          <SelectItem value="kids">Kids</SelectItem>
                           <SelectItem value="accessories">Accessories</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="subcategory" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="brand" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="material" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
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
                        <FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="isPublished" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Publish Product</FormLabel>
                            </div>
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )} />
                 </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <Button type="button" variant="destructive">
              <Trash2 size={18} className="mr-2" /> Delete Product
            </Button>
            <div className="space-x-2">
                <Button type="button" variant="outline" onClick={() => productToEdit && form.reset({
                     name: productToEdit.name,
                    description: productToEdit.description,
                    price: productToEdit.price,
                    category: productToEdit.category,
                    subcategory: productToEdit.subcategory,
                    stockQuantity: productToEdit.stockQuantity,
                    sku: productToEdit.id,
                    brand: productToEdit.brand,
                    material: productToEdit.material,
                    images: productToEdit.images.join(','),
                    sizes: productToEdit.sizes.join(','),
                    colors: productToEdit.colors.join(','),
                    tags: productToEdit.tags?.join(','),
                    isPublished: productToEdit.stockQuantity > 0,
                })}>
                Reset Changes
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Save size={18} className="mr-2" /> Save Changes
                </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
