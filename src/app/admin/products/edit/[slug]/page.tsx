
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Edit3, UploadCloud, DollarSign, Package, Tag, Palette, Ruler, Layers, Save, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import Link from "next/link";
import { useEffect, useState, use } from "react"; 
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadImage } from "@/lib/storage";
import { useRouter } from "next/navigation";
import type { Product, Category } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface EditProductPageProps {
  params: Promise<{ slug: string }>; 
}

const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters.").default(""),
  description: z.string().min(10, "Description must be at least 10 characters.").default(""),
  price: z.coerce.number().positive("Price must be a positive number.").default(0),
  category: z.string().min(1, "Category is required.").default(""),
  subcategory: z.string().optional().default(""),
  stockQuantity: z.coerce.number().int().min(0, "Stock can't be negative.").default(0),
  brand: z.string().optional().default(""),
  material: z.string().optional().default(""),
  sizes: z.string().optional().default(""),
  colors: z.string().optional().default(""),
  tags: z.string().optional().default(""),
  isPublished: z.boolean().default(true),
  dataAiHint: z.string().optional().default(""),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function AdminEditProductPage({ params: paramsPromise }: EditProductPageProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  const { slug } = use(paramsPromise);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingProduct(true);
      try {
        if (!db) return;
        
        // Fetch categories
        const catCol = collection(db, "categories");
        const catSnapshot = await getDocs(catCol);
        const fetchedCats = catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(fetchedCats);

        // Fetch product by slug
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const productDoc = querySnapshot.docs[0];
          const data = productDoc.data() as Product;
          setProductToEdit({ ...data, id: productDoc.id });
          setExistingImageUrls(data.images || []);
          form.reset({
            name: data.name || "",
            description: data.description || "",
            price: data.price || 0,
            category: data.category || "",
            subcategory: data.subcategory || "",
            stockQuantity: data.stockQuantity || 0,
            brand: data.brand || "",
            material: data.material || "",
            sizes: data.sizes?.join(', ') || "",
            colors: data.colors?.join(', ') || "",
            tags: data.tags?.join(', ') || "",
            isPublished: data.isPublished ?? true,
            dataAiHint: data.dataAiHint || "",
          });
        } else {
          toast({ title: "Heritage Lost", description: `No design found with slug "${slug}".`, variant: "destructive" });
          router.push('/admin/products');
        }
      } catch (error) {
        console.error("Logistics error:", error);
      }
      setIsLoadingProduct(false);
    };
    fetchData();
  }, [slug]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "", description: "", price: 0, category: "", subcategory: "",
      stockQuantity: 0, brand: "", material: "", sizes: "", colors: "", tags: "", isPublished: true, dataAiHint: "",
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setImageFiles(prev => [...prev, ...filesArray]);
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };
  
  const removeExistingImage = (index: number) => {
    setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(data: ProductFormValues) {
    if (!productToEdit) return;
    setIsSaving(true);
    try {
      toast({ title: "Updating Curation...", description: "Securely syncing heritage data and media." });
      
      const newImageUrls = await Promise.all(imageFiles.map(file => uploadImage(file, 'products')));
      const finalImageUrls = [...existingImageUrls, ...newImageUrls];

      if (finalImageUrls.length === 0) {
        throw new Error("Every piece requires at least one visual asset.");
      }

      const productRef = doc(db!, "products", productToEdit.id);
      await updateDoc(productRef, {
        ...data,
        images: finalImageUrls,
        sizes: data.sizes ? data.sizes.split(',').map(s => s.trim()).filter(s => s) : [],
        colors: data.colors ? data.colors.split(',').map(c => c.trim()).filter(c => c) : [],
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        updatedAt: serverTimestamp(),
      });

      toast({ title: "Design Refined!", description: `${data.name} has been successfully updated in the collection.` });
      setImageFiles([]);
      setImagePreviews([]);
      setExistingImageUrls(finalImageUrls);
    } catch (error: any) {
      console.error("Logistics failure:", error);
      toast({ title: "Update Failed", description: error.message || "Failed to sync changes.", variant: "destructive" });
    }
    setIsSaving(false);
  }

  async function handleDelete() {
    if (!productToEdit) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db!, "products", productToEdit.id));
      toast({ title: "Design Removed", description: `The heritage piece "${productToEdit.name}" has been decommissioned.` });
      router.push('/admin/products');
    } catch (error) {
      toast({ title: "Removal Failed", description: "Could not remove design from collection.", variant: "destructive" });
    }
    setIsDeleting(false);
  }

  if (isLoadingProduct) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/2 rounded-xl" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading text-secondary">Edit Design</h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-primary">{productToEdit?.name}</p>
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
                  <CardTitle className="text-xl font-heading flex items-center"><Package className="mr-3 text-primary"/>Core Identity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Product Name</FormLabel>
                      <FormControl><Input {...field} disabled={isSaving} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">The Heritage Story</FormLabel>
                      <FormControl><Textarea {...field} rows={6} disabled={isSaving} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card className="shadow-2xl border-none rounded-2xl overflow-hidden">
                 <CardHeader className="bg-secondary text-background"><CardTitle className="text-xl font-heading flex items-center"><UploadCloud className="mr-3 text-primary"/>Media Archive</CardTitle></CardHeader>
                 <CardContent className="p-8">
                    <FormItem className="mb-8">
                      <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Add Visual Assets</FormLabel>
                      <FormControl>
                        <Input type="file" multiple accept="image/*" onChange={handleImageChange} disabled={isSaving}
                          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                      </FormControl>
                    </FormItem>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {existingImageUrls.map((url, index) => (
                        <div key={`existing-${index}`} className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-md group border-2 border-primary/5">
                          <Image src={url} alt={`Heritage asset ${index + 1}`} fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button type="button" variant="destructive" size="icon" className="h-8 w-8 rounded-full" onClick={() => removeExistingImage(index)}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {imagePreviews.map((previewUrl, index) => (
                        <div key={`new-${index}`} className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-md group border-2 border-dashed border-accent">
                          <Image src={previewUrl} alt={`New asset ${index + 1}`} fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button type="button" variant="destructive" size="icon" className="h-8 w-8 rounded-full" onClick={() => removeNewImage(index)}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                 </CardContent>
              </Card>

              <Card className="shadow-2xl border-none rounded-2xl overflow-hidden">
                <CardHeader className="bg-secondary text-background"><CardTitle className="text-xl font-heading flex items-center"><DollarSign className="mr-3 text-primary"/>Value & Inventory</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8 p-8">
                   <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Price (KSh)</FormLabel>
                      <FormControl><Input type="number" {...field} disabled={isSaving} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="stockQuantity" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Available Units</FormLabel>
                      <FormControl><Input type="number" {...field} disabled={isSaving} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-2xl border-none rounded-2xl overflow-hidden bg-card">
                <CardHeader className="bg-secondary text-background"><CardTitle className="text-xl font-heading flex items-center"><Layers className="mr-3 text-primary"/>Classification</CardTitle></CardHeader>
                <CardContent className="space-y-6 p-8">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Heritage Collection</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value} disabled={isSaving || categories.length === 0}>
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
                      <FormControl><Input {...field} disabled={isSaving} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
              <Card className="shadow-2xl border-none rounded-2xl overflow-hidden">
                 <CardHeader className="bg-secondary text-background"><CardTitle className="text-xl font-heading flex items-center"><Tag className="mr-3 text-primary"/>Status</CardTitle></CardHeader>
                 <CardContent className="space-y-4 p-8">
                    <FormField control={form.control} name="isPublished" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border-2 border-primary/5 p-4 bg-primary/5">
                            <div className="space-y-0.5">
                                <FormLabel className="text-secondary font-bold text-xs uppercase">Live on Storefront</FormLabel>
                            </div>
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSaving} /></FormControl>
                        </FormItem>
                    )} />
                 </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-12 border-t border-primary/10">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" className="h-14 px-8" disabled={isSaving || isDeleting}>
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 size={18} className="mr-2" />}
                  DECOMMISSION DESIGN
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-none rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-heading text-2xl text-secondary">Confirm Decommission</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This will permanently remove the heritage design "{productToEdit?.name}" from the active collection. This action is irreversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 rounded-xl">
                    CONFIRM REMOVAL
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="space-x-4">
                <Button type="submit" className="bg-primary text-white h-14 px-12 text-lg font-bold tracking-widest shadow-xl shadow-primary/20" disabled={isSaving || isDeleting}>
                 {isSaving ? <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> SAVING...</> : <><Save size={20} className="mr-3" /> SYNC CHANGES</>}
                </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
