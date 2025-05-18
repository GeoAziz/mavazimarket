
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Label import removed as FormLabel is used
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle, UploadCloud, DollarSign, Package, Tag, Palette, Ruler, Layers, Loader2 } from 'lucide-react';
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

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
  images: z.string().optional().describe("Comma-separated image URLs").default(""),
  sizes: z.string().optional().describe("Comma-separated sizes (e.g., S,M,L)").default(""),
  colors: z.string().optional().describe("Comma-separated colors (e.g., Red,Blue)").default(""),
  tags: z.string().optional().describe("Comma-separated tags (e.g., new-arrival,best-seller)").default(""),
  isPublished: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function AdminAddProductPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    },
  });

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    console.log("New product data:", data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Product Created!",
      description: `${data.name} has been successfully created.`,
      variant: "default",
    });
    form.reset(); // Reset form after successful submission
    setIsSubmitting(false);
  }

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
                        <FormMessage />
                        </FormItem>
                    )} />
                    <p className="text-xs text-muted-foreground mt-2">For actual image uploads, a dedicated component would be used here.</p>
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
                <CardHeader><CardTitle className="flex items-center">Variants (Simplified)</CardTitle></CardHeader>
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

            {/* Sidebar Column for Organization, etc. */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-md">
                <CardHeader><CardTitle className="flex items-center"><Layers className="mr-2 text-primary/80"/>Organization</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
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
                      <FormLabel>Subcategory (Optional)</FormLabel>
                      <FormControl><Input placeholder="e.g. T-Shirts" {...field} disabled={isSubmitting} /></FormControl>
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
                                <CardDescription className="text-xs">Make this product visible on the storefront.</CardDescription>
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
