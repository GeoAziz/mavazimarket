
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Save, Trash2, Layers, Loader2, ArrowLeft, PlusCircle, UploadCloud } from 'lucide-react';
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, use } from "react"; 
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadImage } from "@/lib/storage";
import { useRouter } from "next/navigation";
import type { Category as CategoryType } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface EditCategoryPageProps {
  params: Promise<{ categoryId: string }>; 
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '');
};

const subcategorySchema = z.object({
  id: z.string().optional().default(""), 
  name: z.string().min(2, "Subcategory name is too short.").default(""),
  slug: z.string().min(2, "Subcategory slug is too short, or auto-generate.").optional().default(""),
  priceRange: z.string().optional().default("KSh 0 - KSh 0"),
});

const categoryFormSchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters.").default(""),
  slug: z.string().min(2, "Slug must be at least 2 characters.").optional().default(""),
  dataAiHint: z.string().optional().default(""),
  subcategories: z.array(subcategorySchema).optional().default([]),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function AdminEditCategoryPage({ params: paramsPromise }: EditCategoryPageProps) {
  const { categoryId } = use(paramsPromise); 
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryType | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); 
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);


  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "", slug: "", dataAiHint: "", subcategories: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subcategories",
  });

  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) {
        router.push('/admin/categories');
        return;
      }
      setIsLoadingCategory(true);
      try {
        if (!db) throw new Error("Infrastructure Offline");
        const categoryDocRef = doc(db, "categories", categoryId);
        const docSnap = await getDoc(categoryDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as CategoryType;
          setCategoryToEdit({ ...data, id: docSnap.id });
          setExistingImageUrl(data.image || null);
          form.reset({
            name: data.name || "",
            slug: data.slug || "",
            dataAiHint: data.dataAiHint || "",
            subcategories: data.subcategories?.map(sub => ({
                id: sub.id || sub.slug || "", 
                name: sub.name || "",
                slug: sub.slug || "",
                priceRange: sub.priceRange || "KSh 0 - KSh 0",
            })) || [],
          });
        } else {
          toast({ title: "Logistics Alert", description: "Collection not found in archives.", variant: "destructive" });
          router.push('/admin/categories');
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      }
      setIsLoadingCategory(false);
    };
    fetchCategory();
  }, [categoryId, form, toast, router]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast({ title: "Invalid Media", description: "JPG, PNG or WebP only.", variant: "destructive" });
        return;
      }
      setImageFile(file);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
      setExistingImageUrl(null);
    }
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
  };


  async function onSubmit(data: CategoryFormValues) {
    if (!categoryToEdit) return;
    setIsSubmitting(true);
    try {
      let finalImageUrl = existingImageUrl;
      if (imageFile) {
        toast({ title: "Syncing Visual...", description: "Archiving new heritage asset." });
        finalImageUrl = await uploadImage(imageFile, 'categories');
      }

      if (!finalImageUrl) {
        throw new Error("Every collection requires a visual identifier.");
      }

      const categoryDocRef = doc(db!, "categories", categoryToEdit.id);
      const finalSlug = data.slug || generateSlug(data.name);
      const updatedCategoryData = {
        ...data,
        slug: finalSlug,
        image: finalImageUrl,
        subcategories: data.subcategories?.map(sub => ({
            ...sub,
            id: sub.slug || generateSlug(sub.name), 
            slug: sub.slug || generateSlug(sub.name)
        })) || [],
        updatedAt: serverTimestamp(),
      };
      await updateDoc(categoryDocRef, updatedCategoryData);
      toast({ title: "Collection Refined!", description: `${data.name} sync successful.` });
      router.push('/admin/categories');
    } catch (error: any) {
      console.error("Sync Failure:", error);
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  }

  useEffect(() => {
    return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
  }, [imagePreview]);

  if (isLoadingCategory) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/5 rounded-xl" /><Skeleton className="h-64 w-full rounded-2xl" /><Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading text-secondary">Refine Collection</h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-primary">{categoryToEdit?.name}</p>
        </div>
        <Button variant="outline" className="border-secondary" asChild><Link href="/admin/categories"><ArrowLeft className="mr-2 h-4 w-4"/>BACK</Link></Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-2xl border-none rounded-2xl overflow-hidden">
            <CardHeader className="bg-secondary text-background">
              <CardTitle className="font-heading text-xl flex items-center"><Layers className="mr-2 text-primary" />Root Identity</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Collection Name</FormLabel>
                  <FormControl><Input {...field} disabled={isSubmitting} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50 flex items-center"><UploadCloud className="mr-2" size={14}/>Update Visual Asset</FormLabel>
                <FormControl>
                  <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} disabled={isSubmitting}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </FormControl>
              </FormItem>

              {(imagePreview || existingImageUrl) && (
                <div className="mt-2 relative group w-64 aspect-video border-2 border-primary/5 rounded-xl overflow-hidden shadow-md">
                  <Image src={imagePreview || existingImageUrl!} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button type="button" variant="destructive" size="icon" className="rounded-full" onClick={removeImage}><Trash2 size={16} /></Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-2xl border-none rounded-2xl overflow-hidden">
            <CardHeader><CardTitle className="font-heading text-xl">Branch Management</CardTitle></CardHeader>
            <CardContent className="p-8 pt-0">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end border-2 border-primary/5 p-6 rounded-xl mb-4 bg-primary/5">
                   <FormField control={form.control} name={`subcategories.${index}.name`} render={({ field: subField }) => (
                    <FormItem><FormLabel className="text-[10px] uppercase font-bold text-secondary/40">Branch Name</FormLabel><FormControl><Input {...subField} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`subcategories.${index}.priceRange`} render={({ field: subField }) => (
                    <FormItem><FormLabel className="text-[10px] uppercase font-bold text-secondary/40">Price Range</FormLabel><FormControl><Input {...subField} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="button" variant="destructive" size="icon" className="rounded-full h-10 w-10" onClick={() => remove(index)} disabled={isSubmitting}><Trash2 size={18} /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" className="mt-4 border-dashed border-2 h-16 w-full text-primary font-bold tracking-widest" onClick={() => append({ id: '', name: "", slug: "", priceRange: "KSh 0 - KSh 0" })} disabled={isSubmitting}>
                <PlusCircle size={18} className="mr-2"/> ADD BRANCH
              </Button>
            </CardContent>
          </Card>
          
          <div className="flex justify-end pt-8">
            <Button type="submit" className="bg-primary text-white h-14 px-12 text-lg font-bold tracking-widest shadow-xl shadow-primary/20" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save size={20} className="mr-2" />}
              {isSubmitting ? "SYNCING..." : "SYNC COLLECTION"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
