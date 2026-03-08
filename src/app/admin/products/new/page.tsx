
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
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore"; 
import { db } from "@/lib/firebase";
import { uploadImage } from "@/lib/storage";
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
  sizes: z.string().optional().default(""),
  colors: z.string().optional().default(""),
  tags: z.string().optional().default(""),
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
        if (!db) return;
        const catCol = collection(db, "categories");
        const catSnapshot = await getDocs(catCol);
        setCategories(catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };
    fetchCategories();
  }, []);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "", description: "", price: 0, category: "", subcategory: "",
      stockQuantity: 0, sku: "", brand: "", material: "",
      sizes: "", colors: "", tags: "", isPublished: true, dataAiHint: ""
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
      URL.revokeObjectURL(prevPreviews[index]);
      return newPreviews;
    });
  };

  async function onSubmit(data: ProductFormValues) {
    if (imageFiles.length === 0) {
      toast({ title: "Visual Assets Required", description: "Every heritage piece needs a visual representation.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      toast({ title: "Archiving Visuals...", description: "Securely transmitting heritage media to cloud storage." });
      const uploadPromises = imageFiles.map(file => uploadImage(file, 'products'));
      const imageUrls = await Promise.all(uploadPromises);
      
      const slug = generateSlug(data.name);
      const productData = {
        ...data,
        slug,
        images: imageUrls,
        sizes: data.sizes ? data.sizes.split(',').map(s => s.trim()).filter(s => s) : [],
        colors: data.colors ? data.colors.split(',').map(c => c.trim()).filter(c => c) : [],
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        averageRating: 0, 
      };

      if (!db) throw new Error("Logistics failure: Database not connected.");
      await addDoc(collection(db, "products"), productData);
      
      toast({ title: "Design Initialized!", description: `${data.name} is now live in the heritage collection.` });
      form.reset(); 
      setImageFiles([]);
      setImagePreviews([]);
      router.push('/admin/products'); 
    } catch (error: any) {
      console.error("Error creating product: ", error);
      toast({ title: "Initialization Failed", description: error.message || "An unexpected logistics error occurred.", variant: "destructive" });
    }
    setIsSubmitting(false);
  }

  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading text-secondary">New Heritage Design</h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Add to the command collection</p>
        </div>
        <Button variant="outline" className="border-secondary" asChild>
            <Link href="/admin/products"><ArrowLeft className="mr-2 h-4 w-4"/> BACK TO CATALOG</Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-2xl border-none rounded-2xl overflow-hidden">
                <CardHeader className="bg-secondary text-background">
                  <CardTitle className="text-xl font-heading flex items-center"><Package className="mr-3 text-primary"/>Design Identity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Product Name</FormLabel>
                      <FormControl><Input placeholder="e.g. Mud Cloth Bomber Jacket" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">The Heritage Story</FormLabel>
                      <FormControl><Textarea placeholder="Describe the craftsmanship and soul of this piece..." {...field} rows={6} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card className="shadow-2xl border-none rounded-2xl overflow-hidden">
                 <CardHeader className="bg-secondary text-background"><CardTitle className="text-xl font-heading flex items-center"><UploadCloud className="mr-3 text-primary"/>Visual Assets</CardTitle></CardHeader>
                 <CardContent className="p-8">
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">High-Resolution Media</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          multiple 
                          accept="image/*"
                          onChange={handleImageChange} 
                          disabled={isSubmitting} 
                          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                        />
                      </FormControl>
                      <FormDescription className="text-[10px] uppercase tracking-tighter">The first image will define the storefront character.</FormDescription>
                    </FormItem>
                    {imagePreviews.length > 0 && (
                      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {imagePreviews.map((previewUrl, index) => (
                          <div key={index} className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-xl border-2 border-primary/5 group">
                            <Image src={previewUrl} alt={`Preview ${index + 1}`} fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button type="button" variant="destructive" size="icon" className="rounded-full h-8 w-8" onClick={() => removeImagePreview(index)}>
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                 </CardContent>
              </Card>

              <Card className="shadow-2xl border-none rounded-2xl overflow-hidden">
                <CardHeader className="bg-secondary text-background"><CardTitle className="text-xl font-heading flex items-center"><DollarSign className="mr-3 text-primary"/>Value & Logistics</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8 p-8">
                   <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Price (KSh)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g. 12500" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="stockQuantity" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Inventory Level</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g. 15" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-2xl border-none rounded-2xl overflow-hidden bg-card">
                <CardHeader className="bg-secondary text-background"><CardTitle className="text-xl font-heading flex items-center"><Layers className="mr-3 text-primary"/>Curation</CardTitle></CardHeader>
                <CardContent className="space-y-6 p-8">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Heritage Collection</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting || categories.length === 0}>
                        <FormControl><SelectTrigger className="border-primary/10"><SelectValue placeholder="Select collection" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="brand" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Artisan/Brand</FormLabel>
                      <FormControl><Input placeholder="e.g. Rift Valley Weavers" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
              <Card className="shadow-2xl border-none rounded-2xl overflow-hidden">
                 <CardHeader className="bg-secondary text-background"><CardTitle className="text-xl font-heading flex items-center"><Tag className="mr-3 text-primary"/>Visibility</CardTitle></CardHeader>
                 <CardContent className="space-y-4 p-8">
                    <FormField control={form.control} name="isPublished" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border-2 border-primary/5 p-4 bg-primary/5">
                            <div className="space-y-0.5">
                                <FormLabel className="text-secondary font-bold text-xs">LIVE ON STOREFRONT</FormLabel>
                                <FormDescription className="text-[10px] uppercase tracking-tighter">Immediate shopper discovery</FormDescription>
                            </div>
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl>
                        </FormItem>
                    )} />
                 </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-8">
            <Button type="button" variant="outline" className="border-secondary h-14 px-8" onClick={() => form.reset()} disabled={isSubmitting}>RESET DESIGN</Button>
            <Button type="submit" className="bg-primary text-white h-14 px-12 text-lg font-bold tracking-widest shadow-xl shadow-primary/20" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" /> ARCHIVING...
                </>
              ) : (
                <>
                  <PlusCircle size={20} className="mr-3" /> PUBLISH HERITAGE
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
