
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
import { doc, getDoc, updateDoc, deleteDoc, Timestamp, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import type { Product, Category } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface EditProductPageProps {
  params: { slug: string }; 
}

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
  sizes: z.string().optional().describe("Comma-separated sizes (e.g., S,M,L)").default(""),
  colors: z.string().optional().describe("Comma-separated colors (e.g., Red,Blue)").default(""),
  tags: z.string().optional().describe("Comma-separated tags (e.g., new-arrival,best-seller)").default(""),
  isPublished: z.boolean().default(true),
  dataAiHint: z.string().optional().default(""),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function AdminEditProductPage({ params: paramsFromProps }: EditProductPageProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // For new uploads
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]); // For current images

  const slug = use(paramsFromProps).slug;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "", description: "", price: 0, category: "", subcategory: "",
      stockQuantity: 0, sku: "", brand: "", material: "",
      sizes: "", colors: "", tags: "", isPublished: true, dataAiHint: "",
    },
  });

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

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setIsLoadingProduct(true);
      try {
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const productDoc = querySnapshot.docs[0];
          const productData = productDoc.data() as Product;
          setProductToEdit({ ...productData, id: productDoc.id });
          setProductId(productDoc.id);
          setExistingImageUrls(productData.images || []);
          form.reset({
            name: productData.name || "",
            description: productData.description || "",
            price: productData.price || 0,
            category: productData.category || "",
            subcategory: productData.subcategory || "",
            stockQuantity: productData.stockQuantity || 0,
            sku: productData.id || "", // Using firestore ID as SKU for mock
            brand: productData.brand || "",
            material: productData.material || "",
            // images: field removed, handled by state now
            sizes: productData.sizes?.join(',') || "",
            colors: productData.colors?.join(',') || "",
            tags: productData.tags?.join(',') || "",
            isPublished: productData.isPublished !== undefined ? productData.isPublished : true,
            dataAiHint: productData.dataAiHint || "",
          });
        } else {
          toast({ title: "Error", description: `Product with slug "${slug}" not found.`, variant: "destructive" });
          setProductToEdit(null);
          router.push('/admin/products');
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({ title: "Error", description: "Could not fetch product data.", variant: "destructive" });
      }
      setIsLoadingProduct(false);
    };
    fetchProduct();
  }, [slug, form, toast, router]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setImageFiles(prevFiles => [...prevFiles, ...filesArray]);
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    }
  };

  const removeNewImagePreview = (index: number) => {
    setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setImagePreviews(prevPreviews => {
      const urlToRevoke = prevPreviews[index];
      URL.revokeObjectURL(urlToRevoke);
      return prevPreviews.filter((_, i) => i !== index);
    });
  };
  
  const removeExistingImage = (index: number) => {
    setExistingImageUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };

  async function onSubmit(data: ProductFormValues) {
    if (!productId) {
      toast({ title: "Error", description: "Product ID not found. Cannot update.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      // Placeholder for Firebase Storage upload logic for imageFiles
      // For now, we'll merge existing URLs with mock URLs for new files
      const newImageMockUrls = imageFiles.map(file => `https://placeholder.com/new/${file.name}`); // Mock
      const finalImageUrls = [...existingImageUrls, ...newImageMockUrls];

      const productRef = doc(db, "products", productId);
      const updatedProductData = {
        ...data,
        images: finalImageUrls, // Use the combined/updated list of URLs
        sizes: data.sizes ? data.sizes.split(',').map(s => s.trim()).filter(s => s) : [],
        colors: data.colors ? data.colors.split(',').map(c => c.trim()).filter(c => c) : [],
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        updatedAt: serverTimestamp(),
      };
      await updateDoc(productRef, updatedProductData);
      toast({
        title: "Product Updated!",
        description: `${data.name} has been successfully updated.`,
      });
      setImageFiles([]); // Clear newly added files after save
      setImagePreviews([]); // Clear previews
      // existingImageUrls will be refetched if the component reloads or user navigates away and back
    } catch (error) {
      console.error("Error updating product:", error);
      toast({ title: "Error", description: "Could not update product.", variant: "destructive" });
    }
    setIsSaving(false);
  }

  async function handleDeleteProduct() {
    if (!productId) {
      toast({ title: "Error", description: "Product ID not found. Cannot delete.", variant: "destructive" });
      return;
    }
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "products", productId));
      // TODO: Delete associated images from Firebase Storage
      toast({
        title: "Product Deleted",
        description: `Product ${productToEdit?.name || slug} has been deleted.`,
      });
      router.push('/admin/products');
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({ title: "Error", description: "Could not delete product.", variant: "destructive" });
    }
    setIsDeleting(false);
  }
  
  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);


  if (isLoadingProduct) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/5" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!productToEdit && !isLoadingProduct) { 
    return (
      <div className="space-y-6 text-center py-10">
        <h1 className="text-3xl font-bold text-destructive">Product Not Found</h1>
        <p className="text-muted-foreground">The product with slug "{slug}" could not be found.</p>
        <Button asChild><Link href="/admin/products"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Product List</Link></Button>
      </div>
    );
  }

  const selectedCategoryObj = categories.find(c => c.id === form.watch("category"));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <Edit3 size={30} className="mr-3 text-accent" /> Edit Product: {productToEdit?.name || slug}
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
                      <FormControl><Input placeholder="e.g. Men's Premium Cotton T-Shirt" {...field} disabled={isSaving || isDeleting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea placeholder="Detailed product description..." {...field} rows={5} disabled={isSaving || isDeleting} /></FormControl>
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
                          disabled={isSaving || isDeleting}
                          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                      </FormControl>
                      <FormDescription>Add new images. Existing images are shown below. To remove an existing image, click the trash icon on it.</FormDescription>
                    </FormItem>
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {existingImageUrls.map((url, index) => (
                        <div key={`existing-${index}`} className="relative group aspect-square">
                          <Image src={url} alt={`Existing Image ${index + 1}`} fill style={{objectFit:"cover"}} className="rounded-md" data-ai-hint={productToEdit?.dataAiHint || "product image"}/>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeExistingImage(index)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
                      {imagePreviews.map((previewUrl, index) => (
                        <div key={`new-${index}`} className="relative group aspect-square border-2 border-dashed border-accent p-1">
                          <Image src={previewUrl} alt={`New Preview ${index + 1}`} fill style={{objectFit:"cover"}} className="rounded-md" />
                           <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeNewImagePreview(index)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                     <FormField control={form.control} name="dataAiHint" render={({ field }) => (
                        <FormItem className="mt-4">
                        <FormLabel>Image AI Hint (Optional)</FormLabel>
                        <FormControl><Input placeholder="e.g. mens t-shirt" {...field} disabled={isSaving || isDeleting} /></FormControl>
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
                      <FormControl><Input type="number" {...field} disabled={isSaving || isDeleting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="stockQuantity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl><Input type="number" {...field} disabled={isSaving || isDeleting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="sku" render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl><Input {...field} readOnly disabled={isSaving || isDeleting} /></FormControl> 
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
                        <FormControl><Input {...field} disabled={isSaving || isDeleting} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="colors" render={({ field }) => (
                        <FormItem><FormLabel className="flex items-center"><Palette className="mr-2 text-primary/80"/>Colors (comma-separated)</FormLabel>
                        <FormControl><Input {...field} disabled={isSaving || isDeleting} /></FormControl><FormMessage /></FormItem>
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
                       <Select onValueChange={field.onChange} value={field.value || ""} disabled={isSaving || isDeleting || categories.length === 0}>
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
                        disabled={isSaving || isDeleting || !selectedCategoryObj || !selectedCategoryObj.subcategories || selectedCategoryObj.subcategories.length === 0}
                      >
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a subcategory" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {selectedCategoryObj?.subcategories.map(subcat => (
                            <SelectItem key={subcat.slug} value={subcat.slug}>{subcat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="brand" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl><Input {...field} disabled={isSaving || isDeleting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="material" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material</FormLabel>
                      <FormControl><Input {...field} disabled={isSaving || isDeleting} /></FormControl>
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
                        <FormControl><Input {...field} disabled={isSaving || isDeleting} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="isPublished" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Publish Product</FormLabel>
                            </div>
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSaving || isDeleting} /></FormControl>
                        </FormItem>
                    )} />
                 </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={isSaving || isDeleting}>
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 size={18} className="mr-2" />}
                  {isDeleting ? "Deleting..." : "Delete Product"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the product
                    "{productToEdit?.name || slug}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Yes, delete product
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  if (productToEdit) {
                     form.reset({
                        name: productToEdit.name || "",
                        description: productToEdit.description || "",
                        price: productToEdit.price || 0,
                        category: productToEdit.category || "",
                        subcategory: productToEdit.subcategory || "",
                        stockQuantity: productToEdit.stockQuantity || 0,
                        sku: productToEdit.id || "",
                        brand: productToEdit.brand || "",
                        material: productToEdit.material || "",
                        sizes: productToEdit.sizes?.join(',') || "",
                        colors: productToEdit.colors?.join(',') || "",
                        tags: productToEdit.tags?.join(',') || "",
                        isPublished: productToEdit.isPublished !== undefined ? productToEdit.isPublished : true,
                        dataAiHint: productToEdit.dataAiHint || "",
                      });
                      setExistingImageUrls(productToEdit.images || []);
                      setImageFiles([]);
                      setImagePreviews([]);
                  }
                }} disabled={isSaving || isDeleting}>
                Reset Changes
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving || isDeleting}>
                 {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 {isSaving ? "Saving..." : <><Save size={18} className="mr-2" /> Save Changes</>}
                </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
