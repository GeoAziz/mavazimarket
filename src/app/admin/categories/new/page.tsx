
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle, Trash2, Layers, Loader2, ArrowLeft, UploadCloud, Sparkles } from 'lucide-react';
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { collection, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadImage } from "@/lib/storage";
import { useRouter } from "next/navigation";
import Image from "next/image";

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '');
};

const subcategorySchema = z.object({
  name: z.string().min(2, "Subcategory name is too short.").default(""),
  slug: z.string().optional().default(""),
  priceRange: z.string().optional().default("KSh 0 - KSh 0"), 
});

const categoryFormSchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters.").default(""),
  slug: z.string().optional().default(""),
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
      name: "", slug: "", dataAiHint: "", subcategories: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subcategories",
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast({ title: "Invalid Type", description: "Use JPG, PNG or WebP.", variant: "destructive" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File Too Large", description: "Maximum size is 5MB.", variant: "destructive" });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImagePreview = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  async function onSubmit(data: CategoryFormValues) {
    if (!imageFile) {
      toast({ title: "Visual Required", description: "Upload a cover image for this collection.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      toast({ title: "Archiving Visual...", description: "Securing collection media in the cloud vault." });
      const imageUrl = await uploadImage(imageFile, 'categories');
      
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

      if (!db) throw new Error("Logistics failure: Infrastructure offline.");
      await setDoc(doc(collection(db, "categories"), finalSlug), categoryData);
      
      toast({ title: "Collection Initialized!", description: `${data.name} is now live.` });
      form.reset();
      removeImagePreview();
      router.push('/admin/categories');
    } catch (error: any) {
      console.error("Creation Failure: ", error);
      toast({ title: "Sync Failed", description: error.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  }

  useEffect(() => {
    return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
  }, [imagePreview]);

  return (
    <div className="space-y-10 pb-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading text-secondary flex items-center">
            <PlusCircle size={36} className="mr-4 text-primary" /> Create Collection
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mt-1">Add to the heritage taxonomy</p>
        </div>
        <Button variant="outline" asChild className="border-secondary h-12">
          <Link href="/admin/categories"><ArrowLeft className="mr-2 h-4 w-4"/> BACK TO ARCHIVE</Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-10">
              <Card className="shadow-2xl border-none rounded-3xl overflow-hidden">
                <CardHeader className="bg-secondary text-background p-10">
                  <CardTitle className="flex items-center text-2xl font-heading"><Layers className="mr-4 text-primary" />Collection Identity</CardTitle>
                  <CardDescription className="text-background/60 tracking-widest uppercase text-[10px] font-bold mt-2">Core Heritage Classification</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Collection Name</FormLabel>
                      <FormControl><Input placeholder="e.g. Kitenge Heritage" {...field} disabled={isSubmitting} className="h-14 rounded-2xl border-2" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <div className="space-y-4">
                    <FormLabel className="flex items-center text-[10px] uppercase font-bold tracking-widest text-secondary/50"><UploadCloud className="mr-2" size={14}/>Cover Visual Asset</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} disabled={isSubmitting}
                          className="block w-full text-sm text-slate-500 file:mr-6 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 h-16 rounded-2xl border-2 border-dashed border-primary/20 cursor-pointer pt-4"
                        />
                      </div>
                    </FormControl>
                    <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold italic">Recommended: 1600x900px JPG/WebP</p>
                  </div>

                  {imagePreview && (
                    <div className="mt-6 relative aspect-video w-full rounded-3xl overflow-hidden shadow-2xl group border-4 border-primary/5">
                      <Image src={imagePreview} alt="Image Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button type="button" variant="destructive" size="icon" className="h-12 w-12 rounded-full" onClick={removeImagePreview}><Trash2 size={24} /></Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5">
              <Card className="shadow-2xl border-none rounded-3xl overflow-hidden sticky top-24">
                <CardHeader className="p-10 border-b border-primary/5">
                  <CardTitle className="font-heading text-2xl flex items-center"><Sparkles size={20} className="mr-3 text-accent" /> Taxonomy Branches</CardTitle>
                  <CardDescription className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Define sub-collections</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-6 border-2 border-primary/5 rounded-3xl mb-4 bg-primary/5 space-y-4 animate-in fade-in slide-in-from-top-2 relative">
                      <FormField control={form.control} name={`subcategories.${index}.name`} render={({ field: subField }) => (
                        <FormItem><FormLabel className="text-[10px] uppercase font-bold text-secondary/40">Branch Name</FormLabel><FormControl><Input {...subField} disabled={isSubmitting} className="h-12 rounded-xl bg-white border-none shadow-sm" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`subcategories.${index}.priceRange`} render={({ field: subField }) => (
                        <FormItem><FormLabel className="text-[10px] uppercase font-bold text-secondary/40">Price Indicator</FormLabel><FormControl><Input {...subField} placeholder="e.g. KSh 5k - 15k" disabled={isSubmitting} className="h-12 rounded-xl bg-white border-none shadow-sm" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full" onClick={() => remove(index)} disabled={isSubmitting}><Trash2 size={14} /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" className="mt-4 border-dashed border-2 h-20 w-full text-primary font-bold tracking-widest rounded-3xl hover:bg-primary/5" onClick={() => append({ name: "", slug: "", priceRange: "KSh 0 - KSh 0" })} disabled={isSubmitting}>
                    <PlusCircle size={20} className="mr-3"/> ADD SUB-COLLECTION
                  </Button>
                </CardContent>
                <CardFooter className="p-10 pt-0">
                  <Button type="submit" className="w-full h-16 bg-primary text-white text-lg font-bold tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98]" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-4 h-6 w-6 animate-spin" /> ARCHIVING...</> : <><PlusCircle size={24} className="mr-4" /> INITIALIZE COLLECTION</>}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
