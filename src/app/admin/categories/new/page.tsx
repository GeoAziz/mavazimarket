
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle, Trash2, Layers, Loader2, ArrowLeft, UploadCloud } from 'lucide-react';
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
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
    }
  };

  const removeImagePreview = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  async function onSubmit(data: CategoryFormValues) {
    if (!imageFile) {
      toast({
        title: "Visual Required",
        description: "Please upload a cover image for this collection.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      toast({ title: "Uploading...", description: "Securing collection media." });
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

      // Use slug as ID for cleaner routing
      await setDoc(doc(collection(db!, "categories"), finalSlug), categoryData);
      
      toast({
        title: "Collection Created!",
        description: `${data.name} is now available for curation.`,
      });
      form.reset();
      removeImagePreview();
      router.push('/admin/categories');
    } catch (error: any) {
      console.error("Error creating category: ", error);
      toast({
        title: "Creation Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  }

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <PlusCircle size={30} className="mr-3 text-accent" /> Create New Collection
        </h1>
        <Button variant="outline" asChild>
          <Link href="/admin/categories"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Collections</Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-lg border-none">
            <CardHeader>
              <CardTitle className="flex items-center"><Layers className="mr-2 text-primary/80"/>Collection Root</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection Name</FormLabel>
                  <FormControl><Input placeholder="e.g. Kikoy Heritage" {...field} disabled={isSubmitting} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormItem>
                <FormLabel className="flex items-center"><UploadCloud className="mr-2"/>Cover Visual</FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    disabled={isSubmitting}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </FormControl>
              </FormItem>

              {imagePreview && (
                <div className="mt-4 relative aspect-[16/9] w-full max-w-md rounded-xl overflow-hidden shadow-lg group">
                  <Image src={imagePreview} alt="Image Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={removeImagePreview}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-none">
            <CardHeader>
              <CardTitle>Sub-Collections</CardTitle>
              <CardDescription>Define specific branches within this heritage collection.</CardDescription>
            </CardHeader>
            <CardContent>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end border-2 border-primary/10 p-6 rounded-xl mb-4 bg-primary/5">
                  <FormField control={form.control} name={`subcategories.${index}.name`} render={({ field: subField }) => (
                    <FormItem>
                      <FormLabel>Branch Name</FormLabel>
                      <FormControl><Input {...subField} placeholder="e.g. Ceremonial Wear" disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`subcategories.${index}.priceRange`} render={({ field: subField }) => (
                    <FormItem>
                      <FormLabel>Price Indicator</FormLabel>
                      <FormControl><Input {...subField} placeholder="e.g. KSh 5k - 15k" disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="button" variant="destructive" size="icon" className="rounded-full" onClick={() => remove(index)} disabled={isSubmitting}>
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="mt-4 border-dashed border-2 h-16 w-full text-primary"
                onClick={() => append({ name: "", slug: "", priceRange: "KSh 0 - KSh 0" })}
                disabled={isSubmitting}
              >
                <PlusCircle size={18} className="mr-2"/> ADD SUB-COLLECTION
              </Button>
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-4 pt-8">
            <Button type="submit" className="bg-primary text-white h-[60px] px-12 text-lg font-bold tracking-widest shadow-xl shadow-primary/20" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" /> UPLOADING...
                </>
              ) : (
                <>
                  <PlusCircle size={24} className="mr-3" /> INITIALIZE COLLECTION
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
