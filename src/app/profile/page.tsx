
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Order, Product, Address } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Edit3, History, Heart, Settings, LogOut, Package, MapPin, Mail, KeyRound, Loader2, UploadCloud, Trash2, Plus, ShieldCheck, ShoppingBag, Eye, EyeOff } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState, useEffect, useCallback } from 'react'; 
import { QuickViewModal } from '@/components/products/QuickViewModal';
import { useAuth } from '@/contexts/AuthContext';
import { auth, db } from '@/lib/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy as firestoreOrderBy, addDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { uploadImage } from "@/lib/storage";
import { formatKSh, toDate } from "@/lib/utils";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

const addressFormSchema = z.object({
  label: z.string().min(2, "Label required (e.g. Home, Work)").default("Home"),
  street: z.string().min(5, "Street address is too short.").default(""),
  city: z.string().min(2, "City name is too short.").default(""),
  postalCode: z.string().optional().default(""),
  country: z.string().default("Kenya"),
});
type AddressFormValues = z.infer<typeof addressFormSchema>;

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters."),
  newPassword: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters."),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function ProfilePage() {
  const { currentUser, appUser, loading: authLoading, fetchAppUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isAddressSubmitting, setIsAddressSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: "" },
  });
  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: { label: 'Home', street: '', city: '', postalCode: '', country: 'Kenya' },
  });
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login?redirect=/profile');
    }
    if (appUser) {
      profileForm.reset({ name: appUser.name || "" });
    }
  }, [currentUser, appUser, authLoading, router, profileForm]);

  const fetchWishlist = useCallback(async () => {
    if (currentUser && appUser?.wishlist && appUser.wishlist.length > 0) {
      setLoadingWishlist(true);
      try {
        const productPromises = appUser.wishlist.map(productId => getDoc(doc(db!, "products", productId)));
        const productDocs = await Promise.all(productPromises);
        const products = productDocs
          .filter(docSnap => docSnap.exists())
          .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Product));
        setWishlistProducts(products);
      } catch (error) {
        console.error("Error fetching wishlist products:", error);
      } finally {
        setLoadingWishlist(false);
      }
    } else {
      setWishlistProducts([]);
    }
  }, [currentUser, appUser]);

  const fetchOrders = useCallback(async () => {
    if (currentUser) {
      setLoadingOrders(true);
      try {
        const ordersQuery = query(
          collection(db!, "orders"), 
          where("userId", "==", currentUser.uid), 
          firestoreOrderBy("orderDate", "desc")
        );
        const querySnapshot = await getDocs(ordersQuery);
        const fetchedOrders = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            orderDate: data.orderDate?.toDate ? data.orderDate.toDate().toISOString() : new Date(data.orderDate).toISOString(),
          } as Order;
        });
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    }
  }, [currentUser]);

  const fetchAddresses = useCallback(async () => {
    if (currentUser) {
      setLoadingAddresses(true);
      try {
        const addrRef = collection(db!, "users", currentUser.uid, "addresses");
        const snapshot = await getDocs(addrRef);
        const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Address));
        setAddresses(fetched);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setLoadingAddresses(false);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchWishlist();
      fetchOrders();
      fetchAddresses();
    }
  }, [currentUser, fetchWishlist, fetchOrders, fetchAddresses]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || !event.target.files?.[0]) return;
    
    setIsPhotoUploading(true);
    try {
      const file = event.target.files[0];
      const photoURL = await uploadImage(file, 'users/profiles');
      
      await updateProfile(currentUser, { photoURL });
      await updateDoc(doc(db!, "users", currentUser.uid), { photoURL, updatedAt: new Date().toISOString() });
      
      await fetchAppUser(currentUser.uid);
      toast({ title: "Avatar Updated", description: "Your heritage profile visual is now live." });
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsPhotoUploading(false);
    }
  };

  async function onProfileSubmit(data: ProfileFormValues) {
    if (!currentUser) return;
    setIsProfileSubmitting(true);
    try {
      await updateDoc(doc(db!, "users", currentUser.uid), { name: data.name, updatedAt: new Date().toISOString() });
      await fetchAppUser(currentUser.uid);
      toast({ title: "Profile Synced", description: "Identity details updated successfully." });
    } catch (error) {
      toast({ title: "Update Failed", description: "Could not sync profile changes.", variant: "destructive" });
    } finally {
      setIsProfileSubmitting(false);
    }
  }

  async function onAddressSubmit(data: AddressFormValues) { 
    if (!currentUser) return;
    setIsAddressSubmitting(true);
    try {
      const addrRef = collection(db!, "users", currentUser.uid, "addresses");
      await addDoc(addrRef, { ...data, isPrimary: addresses.length === 0 });
      await fetchAddresses();
      addressForm.reset();
      toast({ title: "Address Saved", description: "Your logistics destination has been added." });
    } catch (error) {
      toast({ title: "Update Failed", description: "Could not save address details. Check security rules.", variant: "destructive" });
    } finally {
      setIsAddressSubmitting(false);
    }
  }

  async function deleteAddress(addressId: string) {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db!, "users", currentUser.uid, "addresses", addressId));
      await fetchAddresses();
      toast({ title: "Address Removed", description: "Destination cleared from Address Book." });
    } catch (e) {
      toast({ title: "Error", description: "Could not delete address.", variant: "destructive" });
    }
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    if (!currentUser || !currentUser.email) return;
    setIsPasswordSubmitting(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, data.currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, data.newPassword);
      toast({ title: "Vault Secured", description: "Your password has been refreshed." });
      passwordForm.reset();
    } catch (error: any) {
      let desc = "Could not update vault credentials.";
      if (error.code === 'auth/wrong-password') desc = "Incorrect current password.";
      toast({ title: "Security Alert", description: desc, variant: "destructive" });
    } finally {
      setIsPasswordSubmitting(false);
    }
  }
  
  const handleLogout = async () => {
    try {
      await auth?.signOut();
      router.push('/login');
    } catch (error) {
      toast({ title: "Error", description: "Failed to decommission session.", variant: "destructive"});
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser || !appUser) return null;

  return (
    <>
      <QuickViewModal 
        product={quickViewProduct} 
        isOpen={!!quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
      />
      <div className="space-y-12 pb-24">
        <Breadcrumbs items={[{ label: 'My Account' }]} />
        
        <Card className="overflow-hidden shadow-2xl border-none rounded-2xl">
          <CardHeader className="bg-secondary p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-xl">
                  <AvatarImage src={appUser.photoURL || appUser.profilePictureUrl || `https://placehold.co/128x128.png?text=${appUser.name?.charAt(0)}`} alt={appUser.name} />
                  <AvatarFallback className="text-4xl bg-muted">{appUser.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {isPhotoUploading ? <Loader2 className="animate-spin text-white" /> : <UploadCloud className="text-white" size={24} />}
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isPhotoUploading} />
                </label>
              </div>
              <div className="text-center md:text-left space-y-1">
                <CardTitle className="text-4xl font-heading text-background">{appUser.name}</CardTitle>
                <CardDescription className="text-background/60 font-medium tracking-widest uppercase text-[10px] flex items-center justify-center md:justify-start gap-2">
                  <Mail size={12} className="text-primary" /> {currentUser.email}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {appUser.role === 'admin' && (
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white" asChild>
                  <Link href="/admin">COMMAND CENTER</Link>
                </Button>
              )}
              <Button variant="ghost" onClick={handleLogout} className="text-background/60 hover:text-primary">
                <LogOut size={18} className="mr-2" /> LOGOUT
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-none border-b h-auto p-0 bg-background">
                <TabsTrigger value="orders" className="py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-primary data-[state=active]:text-primary font-bold tracking-widest text-[10px] uppercase">
                  <History size={16} className="mr-2"/> JOURNEY
                </TabsTrigger>
                <TabsTrigger value="wishlist" className="py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-primary data-[state=active]:text-primary font-bold tracking-widest text-[10px] uppercase">
                  <Heart size={16} className="mr-2"/> WISHLIST
                </TabsTrigger>
                <TabsTrigger value="settings" className="py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-primary data-[state=active]:text-primary font-bold tracking-widest text-[10px] uppercase">
                  <Settings size={16} className="mr-2"/> CONFIG
                </TabsTrigger>
              </TabsList>

              <div className="p-8">
                <TabsContent value="orders" className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-heading text-secondary">Heritage Journey</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{orders.length} ARCHIVES</p>
                  </div>
                  {loadingOrders ? (
                     <div className="space-y-6">
                        {[1,2].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
                     </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <Card key={order.id} className="shadow-xl border-none rounded-2xl overflow-hidden group">
                          <CardHeader className="bg-secondary/5 p-6 flex flex-row justify-between items-center border-b border-primary/5">
                            <div>
                              <p className="font-bold text-secondary text-sm">ORDER #{order.id.substring(0,8)}</p>
                              <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold mt-1">CURATED: {toDate(order.orderDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                            <div className="text-right">
                               <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border-2 ${
                                  order.status === 'Delivered' ? 'border-green-200 text-green-600 bg-green-50' : 
                                  'border-primary/20 text-primary bg-primary/5'}`}>{order.status}</span>
                              <p className="text-xl font-heading text-primary font-bold mt-2">{formatKSh(order.totalAmount)}</p>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="flex overflow-x-auto gap-4 pb-2 custom-scrollbar">
                              {order.items.map(item => (
                                <div key={item.id} className="flex-shrink-0 flex items-center gap-4 bg-primary/5 p-3 rounded-xl border border-primary/10">
                                  <div className="relative h-16 w-12 rounded-lg overflow-hidden shadow-md">
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                  </div>
                                  <div className="pr-4">
                                    <p className="text-xs font-bold text-secondary line-clamp-1">{item.name}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">QTY: {item.quantity} • {item.size || 'OS'}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                          <CardFooter className="p-6 bg-secondary/5 flex justify-end gap-3 border-t border-primary/5">
                            <Button variant="outline" size="sm" className="rounded-xl border-secondary text-secondary font-bold tracking-widest text-[10px]">TRACK LOGISTICS</Button>
                            <Button variant="outline" size="sm" className="rounded-xl border-primary text-primary font-bold tracking-widest text-[10px]">VIEW MANIFEST</Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="py-24 text-center border-4 border-dashed border-primary/5 rounded-[2rem] space-y-6">
                      <Package size={64} className="mx-auto text-primary/20" strokeWidth={1} />
                      <div className="space-y-2">
                        <h3 className="text-2xl font-heading text-secondary">Archive Empty</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto">Your heritage path is waiting to be written with your first choice.</p>
                      </div>
                      <Button asChild className="bg-primary text-white px-12 h-14 rounded-xl font-bold tracking-widest shadow-xl shadow-primary/20">
                        <Link href="/">START SHOPPING</Link>
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="wishlist" className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-heading text-secondary">Curated Favorites</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{wishlistProducts.length} DESIGNS</p>
                  </div>
                  {loadingWishlist ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1,2,3].map(i => <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />)}
                    </div>
                  ) : wishlistProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {wishlistProducts.map((product) => (
                        <ProductCard key={product.id} product={product} onOpenQuickView={setQuickViewProduct} />
                      ))}
                    </div>
                  ) : (
                     <div className="py-24 text-center border-4 border-dashed border-primary/5 rounded-[2rem] space-y-6">
                      <Heart size={64} className="mx-auto text-primary/20" strokeWidth={1} />
                      <div className="space-y-2">
                        <h3 className="text-2xl font-heading text-secondary">No Saved Treasures</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto">Mark the designs that speak to your soul to find them here later.</p>
                      </div>
                      <Button asChild className="bg-primary text-white px-12 h-14 rounded-xl font-bold tracking-widest shadow-xl shadow-primary/20">
                        <Link href="/">EXPLORE COLLECTIONS</Link>
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="settings" className="space-y-12">
                  <div className="grid md:grid-cols-2 gap-8">
                    <Card className="shadow-xl border-none rounded-2xl overflow-hidden bg-card">
                      <CardHeader className="bg-secondary text-background">
                        <CardTitle className="text-xl font-heading flex items-center"><Mail size={20} className="mr-3 text-primary"/>Identity Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="p-8">
                        <Form {...profileForm}>
                          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                            <FormField control={profileForm.control} name="name" render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Full Name</FormLabel>
                                  <FormControl><Input {...field} disabled={isProfileSubmitting} className="rounded-xl h-12" /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormItem>
                              <div className="flex items-center justify-between mb-1">
                                <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Email (Identity Anchor)</FormLabel>
                                <ShieldCheck size={14} className="text-green-600" />
                              </div>
                              <FormControl><Input value={currentUser.email || ''} disabled className="rounded-xl h-12 bg-secondary/5" /></FormControl>
                              <p className="text-[10px] text-muted-foreground italic">Email is protected. Change requests are handled by support advisors.</p>
                            </FormItem>
                            <Button type="submit" className="w-full bg-primary text-white h-14 rounded-xl font-bold tracking-widest shadow-xl shadow-primary/20" disabled={isProfileSubmitting}>
                               {isProfileSubmitting ? <Loader2 className="animate-spin" /> : "SYNC IDENTITY"}
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>

                    <Card className="shadow-xl border-none rounded-2xl overflow-hidden bg-card">
                       <CardHeader className="bg-secondary text-background">
                         <CardTitle className="text-xl font-heading flex items-center"><MapPin size={20} className="mr-3 text-primary"/>Address Book</CardTitle>
                       </CardHeader>
                      <CardContent className="p-8 space-y-8">
                        {loadingAddresses ? (
                          <div className="space-y-4">
                            <Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" />
                          </div>
                        ) : addresses.length > 0 ? (
                          <div className="space-y-4">
                            {addresses.map(addr => (
                              <div key={addr.id} className="flex justify-between items-start p-4 border-2 border-primary/5 rounded-xl bg-primary/5 group">
                                <div>
                                  <p className="font-bold text-secondary text-xs uppercase tracking-widest flex items-center gap-2">
                                    {addr.label} {addr.isPrimary && <span className="text-[8px] bg-primary text-white px-1.5 py-0.5 rounded-full">PRIMARY</span>}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">{addr.street}, {addr.city}</p>
                                  <p className="text-[10px] text-muted-foreground">{addr.postalCode} • {addr.country}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteAddress(addr.id!)}>
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-6 text-center">
                             <MapPin className="mx-auto h-8 w-8 text-primary/20 mb-2" />
                             <p className="text-xs text-muted-foreground italic">No heritage destinations saved.</p>
                          </div>
                        )}

                        <Separator className="bg-primary/5" />

                        <Form {...addressForm}>
                          <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
                            <FormField control={addressForm.control} name="label" render={({ field }) => (
                                <FormItem><FormLabel className="text-[10px] uppercase font-bold text-secondary/50">Label (e.g. Home, Work)</FormLabel>
                                <FormControl><Input placeholder="Label" {...field} disabled={isAddressSubmitting} className="h-10 rounded-lg text-xs" /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={addressForm.control} name="street" render={({ field }) => (
                                <FormItem><FormLabel className="text-[10px] uppercase font-bold text-secondary/50">Street & Building</FormLabel>
                                <FormControl><Input {...field} disabled={isAddressSubmitting} className="h-10 rounded-lg text-xs" /></FormControl><FormMessage /></FormItem>)} />
                             <div className="grid grid-cols-2 gap-4">
                              <FormField control={addressForm.control} name="city" render={({ field }) => (
                                  <FormItem><FormLabel className="text-[10px] uppercase font-bold text-secondary/50">City/Town</FormLabel>
                                  <FormControl><Input {...field} disabled={isAddressSubmitting} className="h-10 rounded-lg text-xs" /></FormControl><FormMessage /></FormItem>)} />
                              <FormField control={addressForm.control} name="postalCode" render={({ field }) => (
                                  <FormItem><FormLabel className="text-[10px] uppercase font-bold text-secondary/50">Code</FormLabel>
                                  <FormControl><Input {...field} disabled={isAddressSubmitting} className="h-10 rounded-lg text-xs" /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <Button type="submit" className="w-full bg-secondary text-white h-12 rounded-xl font-bold tracking-widest text-[10px]" disabled={isAddressSubmitting}>
                               {isAddressSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus size={14} className="mr-2"/>}
                               ADD NEW DESTINATION
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card className="shadow-xl border-none rounded-2xl overflow-hidden bg-card max-w-2xl">
                    <CardHeader className="bg-secondary text-background">
                      <CardTitle className="text-xl font-heading flex items-center"><KeyRound size={20} className="mr-3 text-primary"/>Security Refresh</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                          <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Existing Credentials</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input type={showCurrentPassword ? "text" : "password"} {...field} disabled={isPasswordSubmitting} className="rounded-xl h-12 pr-12" />
                                    <button
                                      type="button"
                                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                                    >
                                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">New Credentials</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input type={showNewPassword ? "text" : "password"} {...field} disabled={isPasswordSubmitting} className="rounded-xl h-12 pr-12" />
                                      <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                                      >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                      </button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Verify New Credentials</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input type={showConfirmPassword ? "text" : "password"} {...field} disabled={isPasswordSubmitting} className="rounded-xl h-12 pr-12" />
                                      <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                                      >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                      </button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button type="submit" className="bg-accent text-secondary h-14 px-12 rounded-xl font-bold tracking-widest shadow-xl shadow-accent/20" disabled={isPasswordSubmitting}>
                             {isPasswordSubmitting ? <Loader2 className="animate-spin" /> : "REFRESH VAULT"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
