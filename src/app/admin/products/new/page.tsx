
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
import { PlusCircle, UploadCloud, DollarSign, Package, Tag, Palette, Ruler, Layers, Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { collection, addDoc, Timestamp, getDocs, serverTimestamp } from "firebase/firestore"; 
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types"; 
import Image from "next/image";

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '');
};

const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters.").default(""),
  description: z.string().min(10, "Description must be at least 10 characters.").default(""),
  price: z.coerce.number().positive("Price must be a positive number.").default(0),
  category: z.string().min(1, "Category is required.").default(""),
  subcategory: z.string().optional().default(""),
  stockQuantity: z.coerce.number().int().min(0, "Stock can't be negative.").default(0),
  sku: z.string().optional().default(""),
  brand: z.string().optional().default(""),
  material: z.string().optional().default(""),
  // images field is for form handling, actual image URLs will be an array in Firestore
  // For file input, we don't validate FileList directly with Zod easily here.
  // We'll handle FileList in state and process it on submit.
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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
      sizes: "",
      colors: "",
      tags: "",
      isPublished: true,
      dataAiHint: ""
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setImageFiles(prevFiles => [...prevFiles, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    }
  };

  const removeImagePreview = (index: number) => {
    setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setImagePreviews(prevPreviews => {
      const newPreviews = prevPreviews.filter((_, i) => i !== index);
      // Revoke object URL for the removed preview to free up memory
      URL.revokeObjectURL(prevPreviews[index]);
      return newPreviews;
    });
  };

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    try {
      // Placeholder for Firebase Storage upload logic
      // For each file in imageFiles, upload to Storage, get downloadURL
      // For now, we'll use placeholder URLs or filenames
      const imageUrls = imageFiles.map(file => `https://placeholder.com/${file.name}`); // Mock
      
      const slug = generateSlug(data.name);
      const productData = {
        ...data,
        slug,
        images: imageUrls, // Use uploaded image URLs here
        sizes: data.sizes ? data.sizes.split(',').map(s => s.trim()).filter(s => s) : [],
        colors: data.colors ? data.colors.split(',').map(c => c.trim()).filter(c => c) : [],
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        averageRating: 0, 
      };

      const docRef = await addDoc(collection(db, "products"), productData);
      
      toast({
        title: "Product Created!",
        description: `${data.name} (ID: ${docRef.id}) has been successfully created.`,
      });
      form.reset(); 
      setImageFiles([]);
      setImagePreviews([]);
      router.push('/admin/products'); 
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

  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const selectedCategoryObj = categories.find(c => c.id === form.watch("category"));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <PlusCircle size={30} className="mr-3 text-accent" /> Add New Product
        </h1>
        <Button variant="outline" asChild>
            <Link href="/admin/products"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Product List</Link>
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
                    <FormItem>
                      <FormLabel>Product Images</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          multiple 
                          onChange={handleImageChange} 
                          disabled={isSubmitting} 
                          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                      </FormControl>
                      <FormDescription>Upload one or more product images. First image will be primary.</FormDescription>
                    </FormItem>
                    {imagePreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {imagePreviews.map((previewUrl, index) => (
                          <div key={index} className="relative group aspect-square">
                            <Image src={previewUrl} alt={`Preview ${index + 1}`} fill style={{objectFit:"cover"}} className="rounded-md" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImagePreview(index)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
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
                        value={field.value || ""} 
                        disabled={isSubmitting || !selectedCategoryObj || !selectedCategoryObj.subcategories || selectedCategoryObj.subcategories.length === 0}
                      >
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a subcategory" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {selectedCategoryObj?.subcategories?.map(subcat => (
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
            <Button type="button" variant="outline" onClick={() => {form.reset(); setImageFiles([]); setImagePreviews([]);}} disabled={isSubmitting}>Clear Form</Button>
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
