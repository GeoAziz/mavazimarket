
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from 'next/image'; // Corrected import
import Link from 'next/link';
import type { Order, Product } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Edit3, History, Heart, Settings, LogOut, ShoppingBag, Package, MapPin, Mail, KeyRound, Bell, ShoppingCart as ShoppingCartIcon, Loader2 } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState, useEffect } from 'react'; 
import { QuickViewModal } from '@/components/products/QuickViewModal';
import { useAuth } from '@/contexts/AuthContext';
import { auth, db } from '@/lib/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy as firestoreOrderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address.").optional(), // Email might not be editable via this form
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

const addressFormSchema = z.object({
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
  const { currentUser, appUser, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter(); // from next/navigation
  const { toast } = useToast();

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isAddressSubmitting, setIsAddressSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: "", email: "" },
  });
  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: { street: '', city: '', postalCode: '', country: 'Kenya' },
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
      profileForm.reset({ name: appUser.name || "", email: appUser.email || "" });
      addressForm.reset(appUser.shippingAddress || { street: '', city: '', postalCode: '', country: 'Kenya' });
    }
  }, [currentUser, appUser, authLoading, router, profileForm, addressForm]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (currentUser && appUser?.wishlist && appUser.wishlist.length > 0) {
        setLoadingWishlist(true);
        try {
          const productPromises = appUser.wishlist.map(productId => getDoc(doc(db, "products", productId)));
          const productDocs = await Promise.all(productPromises);
          const products = productDocs
            .filter(docSnap => docSnap.exists())
            .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Product));
          setWishlistProducts(products);
        } catch (error) {
          console.error("Error fetching wishlist products:", error);
          toast({ title: "Error", description: "Could not load your wishlist.", variant: "destructive" });
        }
        setLoadingWishlist(false);
      } else {
        setWishlistProducts([]);
      }
    };

    const fetchOrders = async () => {
        if (currentUser) {
            setLoadingOrders(true);
            try {
                const ordersQuery = query(collection(db, "orders"), where("userId", "==", currentUser.uid), firestoreOrderBy("orderDate", "desc"));
                const querySnapshot = await getDocs(ordersQuery);
                const fetchedOrders = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        ...data,
                        id: doc.id,
                        orderDate: (data.orderDate.toDate ? data.orderDate.toDate() : new Date(data.orderDate)).toISOString(), // Ensure it's a string
                    } as Order;
                });
                setOrders(fetchedOrders);
            } catch (error) {
                console.error("Error fetching orders:", error);
                toast({ title: "Error", description: "Could not load your order history.", variant: "destructive"});
            }
            setLoadingOrders(false);
        }
    };

    fetchWishlist();
    fetchOrders();
  }, [currentUser, appUser, toast]);


  async function onProfileSubmit(data: ProfileFormValues) {
    if (!currentUser) return;
    setIsProfileSubmitting(true);
    try {
      await updateDoc(doc(db, "users", currentUser.uid), { name: data.name });
      // Email update is more complex due to Firebase security, typically handled separately or with verification.
      // await updateEmail(currentUser, data.email); // This requires re-authentication usually.
      toast({ title: "Profile Updated", description: "Your personal information has been saved." });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({ title: "Error", description: "Could not update profile.", variant: "destructive" });
    }
    setIsProfileSubmitting(false);
  }

  async function onAddressSubmit(data: AddressFormValues) { 
    if (!currentUser) return;
    setIsAddressSubmitting(true);
    try {
      await updateDoc(doc(db, "users", currentUser.uid), { shippingAddress: data });
      toast({ title: "Address Updated", description: "Your shipping address has been saved." });
    } catch (error) {
      console.error("Address update error:", error);
      toast({ title: "Error", description: "Could not update address.", variant: "destructive" });
    }
    setIsAddressSubmitting(false);
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    if (!currentUser || !currentUser.email) {
      toast({ title: "Error", description: "User not found or email missing.", variant: "destructive" });
      return;
    }
    setIsPasswordSubmitting(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, data.currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, data.newPassword);
      toast({ title: "Password Changed", description: "Your password has been updated successfully." });
      passwordForm.reset();
    } catch (error: any) {
      console.error("Password change error:", error);
      let desc = "Could not change password.";
      if (error.code === 'auth/wrong-password') desc = "Incorrect current password.";
      else if (error.code === 'auth/too-many-requests') desc = "Too many attempts. Try again later.";
      toast({ title: "Error", description: desc, variant: "destructive" });
    }
    setIsPasswordSubmitting(false);
  }
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast({ title: "Logged Out", description: "You have been successfully logged out."});
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: "Logout Error", description: "Failed to log out. Please try again.", variant: "destructive"});
    }
  };


  const handleOpenQuickView = (product: Product) => setQuickViewProduct(product);
  const handleCloseQuickView = () => setQuickViewProduct(null);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser || !appUser) {
    // This case should be handled by the redirect in useEffect, but as a fallback:
    return (
      <div className="text-center py-10">
        <p>Please log in to view your profile.</p>
        <Button asChild className="mt-4"><Link href="/login">Login</Link></Button>
      </div>
    );
  }


  return (
    <>
      <QuickViewModal 
        product={quickViewProduct} 
        isOpen={!!quickViewProduct} 
        onClose={handleCloseQuickView} 
      />
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: 'My Account' }]} />
        
        <Card className="overflow-hidden shadow-lg">
          <CardHeader className="bg-secondary p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <Avatar className="h-20 w-20 mr-4 border-2 border-primary">
                <AvatarImage src={currentUser.photoURL || appUser.profilePictureUrl || `https://placehold.co/100x100.png?text=${appUser.name?.substring(0,1)}`} alt={appUser.name || "User"} data-ai-hint={appUser.dataAiHint || 'avatar person'} />
                <AvatarFallback className="text-2xl bg-muted">{appUser.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-primary">{appUser.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{currentUser.email}</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Edit3 size={16} className="mr-2" /> Change Profile Picture
            </Button>
          </CardHeader>
          
          <CardContent className="p-0">
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 rounded-none border-b h-auto p-0">
                <TabsTrigger value="orders" className="py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-background">
                  <History size={18} className="mr-2"/>Order History
                </TabsTrigger>
                <TabsTrigger value="wishlist" className="py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-background">
                  <Heart size={18} className="mr-2"/>Wishlist
                </TabsTrigger>
                <TabsTrigger value="settings" className="py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-background">
                  <Settings size={18} className="mr-2"/>Account Settings
                </TabsTrigger>
                 <TabsTrigger value="logout" className="py-3 rounded-none text-destructive hover:text-destructive/80" onClick={handleLogout}>
                  <LogOut size={18} className="mr-2"/>Logout
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="orders">
                  <h2 className="text-xl font-semibold mb-4 flex items-center"><Package size={22} className="mr-2 text-primary"/>Your Orders</h2>
                  {loadingOrders ? (
                     <div className="space-y-6">
                        {[1,2].map(i => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}
                     </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-6">
                      {orders.map((order: Order) => (
                        <Card key={order.id} className="shadow-sm">
                          <CardHeader className="flex flex-row justify-between items-center bg-muted/50 p-4">
                            <div>
                              <p className="font-semibold text-foreground">Order ID: {order.id}</p>
                              <p className="text-sm text-muted-foreground">Date: {new Date(order.orderDate).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                               <p className={`text-sm font-medium px-2 py-1 rounded-full ${
                                  order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                  order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                  order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'}`}>{order.status}</p>
                              <p className="text-lg font-bold text-primary mt-1">KSh {order.totalAmount.toLocaleString()}</p>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 space-y-2">
                            {order.items.map(item => (
                              <div key={item.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                  <Image src={item.image} alt={item.name} width={40} height={50} className="rounded mr-3 object-cover" data-ai-hint="clothing item"/>
                                  <span>{item.name} (x{item.quantity})</span>
                                </div>
                                <span>KSh {(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </CardContent>
                          <CardFooter className="p-4 border-t">
                            <Button variant="outline" size="sm" className="mr-2">View Details</Button>
                            <Button variant="default" size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                              <ShoppingCartIcon size={16} className="mr-2"/>Reorder (Mock)
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="text-center py-12 shadow-none border-dashed">
                      <CardHeader className="items-center">
                        <History size={48} className="text-muted-foreground mb-4" />
                        <CardTitle className="text-2xl font-semibold">No Orders Yet</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-6">You haven't placed any orders with us. <br/>When you do, they'll appear here.</p>
                        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          <Link href="/">Start Shopping</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="wishlist">
                  <h2 className="text-xl font-semibold mb-4 flex items-center"><Heart size={22} className="mr-2 text-primary"/>Your Wishlist</h2>
                  {loadingWishlist ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1,2,3].map(i => <Skeleton key={i} className="h-96 w-full rounded-lg" />)}
                    </div>
                  ) : wishlistProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlistProducts.map((product: Product) => (
                        <ProductCard key={product.id} product={product} onOpenQuickView={handleOpenQuickView} />
                      ))}
                    </div>
                  ) : (
                     <Card className="text-center py-12 shadow-none border-dashed">
                      <CardHeader className="items-center">
                        <Heart size={48} className="text-muted-foreground mb-4" />
                        <CardTitle className="text-2xl font-semibold">Your Wishlist is Empty</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your wishlist yet. <br/>Start browsing and save your favorites!</p>
                        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          <Link href="/">Browse Products</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="settings">
                  <h2 className="text-xl font-semibold mb-6 flex items-center"><Settings size={22} className="mr-2 text-primary"/>Account Settings</h2>
                  <div className="space-y-8">
                    <Card>
                      <CardHeader><CardTitle className="flex items-center"><Mail size={20} className="mr-2 text-accent"/>Personal Information</CardTitle></CardHeader>
                      <CardContent>
                        <Form {...profileForm}>
                          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                            <FormField control={profileForm.control} name="name" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl><Input {...field} disabled={isProfileSubmitting} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField control={profileForm.control} name="email" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email Address (Cannot be changed here)</FormLabel>
                                  <FormControl><Input type="email" {...field} disabled={true} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isProfileSubmitting}>
                               {isProfileSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>

                    <Card>
                       <CardHeader><CardTitle className="flex items-center"><MapPin size={20} className="mr-2 text-accent"/>Shipping Address</CardTitle></CardHeader>
                      <CardContent>
                        <Form {...addressForm}>
                          <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
                            <FormField control={addressForm.control} name="street" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Street Address</FormLabel>
                                  <FormControl><Input {...field} disabled={isAddressSubmitting} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField control={addressForm.control} name="city" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl><Input {...field} disabled={isAddressSubmitting} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField control={addressForm.control} name="postalCode" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Postal Code</FormLabel>
                                    <FormControl><Input {...field} disabled={isAddressSubmitting} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField control={addressForm.control} name="country" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Country</FormLabel>
                                  <FormControl><Input {...field} disabled /></FormControl> 
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isAddressSubmitting}>
                               {isAddressSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Address
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader><CardTitle className="flex items-center"><KeyRound size={20} className="mr-2 text-accent"/>Change Password</CardTitle></CardHeader>
                      <CardContent>
                        <Form {...passwordForm}>
                          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                            <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Current Password</FormLabel>
                                  <FormControl><Input type="password" {...field} disabled={isPasswordSubmitting} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                             <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>New Password</FormLabel>
                                  <FormControl><Input type="password" {...field} disabled={isPasswordSubmitting} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                             <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm New Password</FormLabel>
                                  <FormControl><Input type="password" {...field} disabled={isPasswordSubmitting} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isPasswordSubmitting}>
                               {isPasswordSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Password
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>

                    <Card>
                       <CardHeader><CardTitle className="flex items-center"><Bell size={20} className="mr-2 text-accent"/>Email Preferences</CardTitle></CardHeader>
                       <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                             <FormLabel htmlFor="promo-emails" className="flex-1 cursor-pointer">Receive promotional emails</FormLabel>
                             <Input type="checkbox" id="promo-emails" className="h-5 w-5"/>
                          </div>
                          <div className="flex items-center justify-between">
                             <FormLabel htmlFor="order-updates" className="flex-1 cursor-pointer">Receive order updates</FormLabel>
                             <Input type="checkbox" id="order-updates" defaultChecked className="h-5 w-5"/>
                          </div>
                           <Button className="bg-primary hover:bg-primary/90 text-primary-foreground mt-2">Save Preferences (Mock)</Button>
                       </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                {/* Logout tab content removed, handled by direct button click now */}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Need to import useRouter
import { useRouter } from 'next/navigation';
