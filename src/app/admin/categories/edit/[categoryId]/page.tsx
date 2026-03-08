
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Save, Trash2, Layers, Loader2, ArrowLeft, PlusCircle, UploadCloud, ShieldCheck } from 'lucide-react';
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
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File Too Large", description: "Maximum size is 5MB.", variant: "destructive" });
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
        toast({ title: "Archiving Visual...", description: "Securely transmitting heritage asset to the cloud vault." });
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
      <div className="space-y-10">
        <Skeleton className="h-14 w-3/5 rounded-2xl" /><Skeleton className="h-[500px] w-full rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading text-secondary mb-1">Refine Collection</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">IDENTITY ARCHIVE: {categoryToEdit?.name}</p>
        </div>
        <Button variant="outline" className="border-secondary h-12" asChild><Link href="/admin/categories"><ArrowLeft className="mr-3 h-4 w-4"/> BACK TO ARCHIVE</Link></Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-10">
              <Card className="shadow-2xl border-none rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-secondary text-background p-10">
                  <CardTitle className="font-heading text-2xl flex items-center"><Layers className="mr-4 text-primary" />Root Identity</CardTitle>
                  <CardDescription className="text-background/60 tracking-widest uppercase text-[10px] font-bold mt-2">Manage Core Taxonomy Details</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Collection Name</FormLabel>
                      <FormControl><Input {...field} disabled={isSubmitting} className="h-14 rounded-2xl border-2" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <div className="space-y-4">
                    <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50 flex items-center"><UploadCloud className="mr-3" size={16}/>Update Visual Asset</FormLabel>
                    <FormControl>
                      <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} disabled={isSubmitting}
                        className="block w-full text-sm text-slate-500 file:mr-6 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 h-16 rounded-2xl border-2 border-dashed border-primary/20 cursor-pointer pt-4"
                      />
                    </FormControl>
                  </div>

                  {(imagePreview || existingImageUrl) && (
                    <div className="mt-6 relative aspect-video w-full rounded-3xl overflow-hidden shadow-2xl group border-4 border-primary/5">
                      <Image src={imagePreview || existingImageUrl!} alt="Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button type="button" variant="destructive" size="icon" className="h-14 w-14 rounded-full shadow-2xl" onClick={removeImage}><Trash2 size={28} /></Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5">
              <Card className="shadow-2xl border-none rounded-[2rem] overflow-hidden sticky top-24">
                <CardHeader className="p-10 border-b border-primary/5">
                  <CardTitle className="font-heading text-2xl flex items-center"><PlusCircle size={20} className="mr-3 text-primary" /> Branch Management</CardTitle>
                  <CardDescription className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Manage classification nodes</CardDescription>
                </CardHeader>
                <CardContent className="p-10 pt-6 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-6 border-2 border-primary/5 rounded-3xl bg-primary/5 space-y-4 animate-in fade-in slide-in-from-top-2 relative">
                       <FormField control={form.control} name={`subcategories.${index}.name`} render={({ field: subField }) => (
                        <FormItem><FormLabel className="text-[10px] uppercase font-bold text-secondary/40">Branch Name</FormLabel><FormControl><Input {...subField} disabled={isSubmitting} className="h-12 rounded-xl bg-white border-none shadow-sm" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`subcategories.${index}.priceRange`} render={({ field: subField }) => (
                        <FormItem><FormLabel className="text-[10px] uppercase font-bold text-secondary/40">Price Range</FormLabel><FormControl><Input {...subField} disabled={isSubmitting} className="h-12 rounded-xl bg-white border-none shadow-sm" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4 h-8 w-8 rounded-full" onClick={() => remove(index)} disabled={isSubmitting}><Trash2 size={14} /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" className="mt-4 border-dashed border-2 h-20 w-full text-primary font-bold tracking-widest rounded-3xl hover:bg-primary/5" onClick={() => append({ id: '', name: "", slug: "", priceRange: "KSh 0 - KSh 0" })} disabled={isSubmitting}>
                    <PlusCircle size={20} className="mr-3"/> ADD BRANCH
                  </Button>
                </CardContent>
                <CardFooter className="p-10 pt-0">
                  <Button type="submit" className="w-full h-16 bg-primary text-white text-lg font-bold tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98]" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-4 h-6 w-6 animate-spin" /> SYNCING ARCHIVE...</> : <><Save size={24} className="mr-4" /> SYNC COLLECTION</>}
                  </Button>
                </CardFooter>
              </Card>
              <div className="p-8 bg-card border-2 border-primary/5 rounded-3xl mt-10 flex items-center gap-4">
                <ShieldCheck className="text-green-600 h-8 w-8 shrink-0" />
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground leading-relaxed">Changes to collection taxonomy are instantly reflected in the storefront discovery engine.</p>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
