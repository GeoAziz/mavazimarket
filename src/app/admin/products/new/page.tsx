
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
import { PlusCircle, UploadCloud, DollarSign, Package, Tag, Layers, Loader2, ArrowLeft, Trash2, Sparkles } from 'lucide-react';
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
    .replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
};

const productFormSchema = z.object({
  name: z.string().min(3, "Design name must be at least 3 characters.").default(""),
  description: z.string().min(10, "The heritage story must be at least 10 characters.").default(""),
  price: z.coerce.number().positive("Price must be a positive number.").default(0),
  category: z.string().min(1, "Selection of a collection is required.").default(""),
  subcategory: z.string().optional().default(""),
  stockQuantity: z.coerce.number().int().min(0, "Stock levels cannot be negative.").default(0),
  brand: z.string().optional().default(""),
  material: z.string().optional().default(""),
  sizes: z.string().optional().default(""),
  colors: z.string().optional().default(""),
  tags: z.string().optional().default(""),
  isPublished: z.boolean().default(true),
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
        console.error("Collection sync error:", error);
      }
    };
    fetchCategories();
  }, []);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "", description: "", price: 0, category: "", subcategory: "",
      stockQuantity: 0, brand: "Mavazi Heritage", material: "",
      sizes: "", colors: "", tags: "new-arrival", isPublished: true
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const validFiles = filesArray.filter(file => {
        const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024;
        return isValidType && isValidSize;
      });

      if (validFiles.length !== filesArray.length) {
        toast({ title: "Media Rejected", description: "JPG/PNG/WebP under 5MB only.", variant: "destructive" });
      }

      setImageFiles(prev => [...prev, ...validFiles]);
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImagePreview = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  async function onSubmit(data: ProductFormValues) {
    if (imageFiles.length === 0) {
      toast({ title: "Visual Assets Required", description: "Please upload at least one heritage image.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      toast({ title: "Archiving Visuals...", description: "Securing high-resolution media in the cloud vault." });
      const imageUrls = await Promise.all(imageFiles.map(file => uploadImage(file, 'products')));
      
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
        reviewCount: 0,
      };

      await addDoc(collection(db!, "products"), productData);
      
      toast({ title: "Design Initialized!", description: `${data.name} is now live in the catalog.` });
      router.push('/admin/products'); 
    } catch (error: any) {
      toast({ title: "Initialization Failed", description: error.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  }

  useEffect(() => {
    return () => imagePreviews.forEach(URL.revokeObjectURL);
  }, [imagePreviews]);

  return (
    <div className="space-y-10 pb-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading text-secondary mb-1">Curation Center</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Add New Heritage Design</p>
        </div>
        <Button variant="outline" className="border-secondary h-12" asChild>
            <Link href="/admin/products"><ArrowLeft className="mr-3 h-4 w-4"/> BACK TO CATALOG</Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-10">
              <Card className="shadow-2xl border-none rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-secondary text-background p-10">
                  <CardTitle className="text-2xl font-heading flex items-center"><Package className="mr-4 text-primary"/>Design Identity</CardTitle>
                  <CardDescription className="text-background/60 tracking-widest uppercase text-[10px] font-bold mt-2">Core Heritage Attributes</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Product Name</FormLabel>
                      <FormControl><Input placeholder="e.g. Kitenge Heritage Wrap" {...field} disabled={isSubmitting} className="h-14 rounded-2xl border-2" /></FormControl>
                      <FormMessage />
                    </FormItem>)} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">The Heritage Story</FormLabel>
                      <FormControl><Textarea rows={8} placeholder="Describe the ancestral craftsmanship and modern utility..." {...field} disabled={isSubmitting} className="rounded-2xl border-2 resize-none" /></FormControl>
                      <FormMessage />
                    </FormItem>)} />
                </CardContent>
              </Card>

              <Card className="shadow-2xl border-none rounded-[2rem] overflow-hidden">
                 <CardHeader className="p-10 border-b border-primary/5">
                    <CardTitle className="text-2xl font-heading flex items-center text-secondary"><UploadCloud className="mr-4 text-primary"/>Media Archive</CardTitle>
                    <CardDescription className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Add High-Resolution Visuals</CardDescription>
                 </CardHeader>
                 <CardContent className="p-10">
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} disabled={isSubmitting} 
                            className="block w-full text-sm text-slate-500 file:mr-6 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 h-16 rounded-2xl border-2 border-dashed border-primary/20 cursor-pointer pt-4"
                          />
                        </div>
                      </FormControl>
                      <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold mt-4 italic">Recommended: 1600x2000px JPG/WebP. Max 5MB per asset.</p>
                    </FormItem>
                    {imagePreviews.length > 0 && (
                      <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {imagePreviews.map((url, index) => (
                          <div key={index} className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border-4 border-primary/5 group">
                            <Image src={url} alt="Preview" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button type="button" variant="destructive" size="icon" className="h-10 w-10 rounded-full" onClick={() => removeImagePreview(index)}><Trash2 size={18} /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                 </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5 space-y-10">
              <Card className="shadow-2xl border-none rounded-[2rem] overflow-hidden sticky top-24">
                <CardHeader className="p-10 border-b border-primary/5">
                  <CardTitle className="text-2xl font-heading flex items-center text-secondary"><Sparkles size={24} className="mr-4 text-accent"/> Logistics & Curation</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Heritage Collection</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <FormControl><SelectTrigger className="h-14 border-2 rounded-2xl"><SelectValue placeholder="Select collection..." /></SelectTrigger></FormControl>
                        <SelectContent className="rounded-xl">{categories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent>
                      </Select><FormMessage />
                    </FormItem>)} />
                   
                   <div className="grid grid-cols-2 gap-6">
                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Price (KSh)</FormLabel>
                        <FormControl><Input type="number" {...field} disabled={isSubmitting} className="h-14 rounded-2xl border-2" /></FormControl><FormMessage />
                      </FormItem>)} />
                    <FormField control={form.control} name="stockQuantity" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Units Available</FormLabel>
                        <FormControl><Input type="number" {...field} disabled={isSubmitting} className="h-14 rounded-2xl border-2" /></FormControl><FormMessage />
                      </FormItem>)} />
                   </div>

                   <FormField control={form.control} name="brand" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Artisan / Designer</FormLabel>
                      <FormControl><Input {...field} disabled={isSubmitting} className="h-14 rounded-2xl border-2" /></FormControl><FormMessage />
                    </FormItem>)} />

                   <div className="pt-4">
                    <Button type="submit" className="w-full h-20 bg-primary text-white font-bold tracking-[0.3em] text-lg rounded-2xl shadow-2xl shadow-primary/20 transition-all active:scale-[0.98]" disabled={isSubmitting}>
                      {isSubmitting ? <><Loader2 className="mr-4 h-8 w-8 animate-spin" /> ARCHIVING...</> : <><PlusCircle size={24} className="mr-4" /> INITIALIZE DESIGN</>}
                    </Button>
                   </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
