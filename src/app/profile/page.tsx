"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { mockUser, mockOrders, mockProducts } from '@/lib/mock-data';
import type { Order, Product } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Edit3, History, Heart, Settings, LogOut, ShoppingBag, Package, MapPin, Mail, KeyRound, Bell } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

const addressFormSchema = z.object({
  street: z.string().min(5, "Street address is too short."),
  city: z.string().min(2, "City name is too short."),
  postalCode: z.string().optional(),
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
  const user = mockUser; // In a real app, this would come from auth context/session

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: user.name, email: user.email },
  });
  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: user.shippingAddress || { street: '', city: '', postalCode: '', country: 'Kenya' },
  });
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });


  function onProfileSubmit(data: ProfileFormValues) { console.log("Profile update:", data); alert("Profile updated (mock)"); }
  function onAddressSubmit(data: AddressFormValues) { console.log("Address update:", data); alert("Address updated (mock)"); }
  function onPasswordSubmit(data: PasswordFormValues) { console.log("Password change:", data); alert("Password changed (mock)"); }

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'My Account' }]} />
      
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-secondary p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <Avatar className="h-20 w-20 mr-4 border-2 border-primary">
              <AvatarImage src={user.profilePictureUrl} alt={user.name} data-ai-hint={user.dataAiHint || 'avatar person'} />
              <AvatarFallback className="text-2xl bg-muted">{user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-primary">{user.name}</CardTitle>
              <CardDescription className="text-muted-foreground">{user.email}</CardDescription>
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
               <TabsTrigger value="logout" className="py-3 rounded-none text-destructive hover:text-destructive/80">
                <LogOut size={18} className="mr-2"/>Logout
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="orders">
                <h2 className="text-xl font-semibold mb-4 flex items-center"><Package size={22} className="mr-2 text-primary"/>Your Orders</h2>
                {user.orderHistory && user.orderHistory.length > 0 ? (
                  <div className="space-y-6">
                    {user.orderHistory.map((order: Order) => (
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
                            <ShoppingBag size={16} className="mr-2"/>Reorder
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">You have no past orders.</p>
                )}
              </TabsContent>

              <TabsContent value="wishlist">
                <h2 className="text-xl font-semibold mb-4 flex items-center"><Heart size={22} className="mr-2 text-primary"/>Your Wishlist</h2>
                {user.wishlist && user.wishlist.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {user.wishlist.map((product: Product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Your wishlist is empty. Start adding your favorite items!</p>
                )}
              </TabsContent>

              <TabsContent value="settings">
                <h2 className="text-xl font-semibold mb-6 flex items-center"><Settings size={22} className="mr-2 text-primary"/>Account Settings</h2>
                <div className="space-y-8">
                  {/* Profile Information Form */}
                  <Card>
                    <CardHeader><CardTitle className="flex items-center"><Mail size={20} className="mr-2 text-accent"/>Personal Information</CardTitle></CardHeader>
                    <CardContent>
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                          <FormField control={profileForm.control} name="name" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField control={profileForm.control} name="email" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl><Input type="email" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Changes</Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>

                  {/* Shipping Address Form */}
                  <Card>
                     <CardHeader><CardTitle className="flex items-center"><MapPin size={20} className="mr-2 text-accent"/>Shipping Address</CardTitle></CardHeader>
                    <CardContent>
                      <Form {...addressForm}>
                        <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
                          <FormField control={addressForm.control} name="street" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Street Address</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={addressForm.control} name="city" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl><Input {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField control={addressForm.control} name="postalCode" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Postal Code</FormLabel>
                                  <FormControl><Input {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField control={addressForm.control} name="country" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl><Input {...field} disabled /></FormControl> {/* Assuming Kenya is fixed for now */}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Address</Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                  
                  {/* Change Password Form */}
                  <Card>
                    <CardHeader><CardTitle className="flex items-center"><KeyRound size={20} className="mr-2 text-accent"/>Change Password</CardTitle></CardHeader>
                    <CardContent>
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                          <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl><Input type="password" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl><Input type="password" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl><Input type="password" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Update Password</Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>

                  {/* Email Preferences - Placeholder UI */}
                  <Card>
                     <CardHeader><CardTitle className="flex items-center"><Bell size={20} className="mr-2 text-accent"/>Email Preferences</CardTitle></CardHeader>
                     <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                           <Label htmlFor="promo-emails" className="flex-1">Receive promotional emails</Label>
                           <Input type="checkbox" id="promo-emails" className="h-5 w-5"/>
                        </div>
                        <div className="flex items-center justify-between">
                           <Label htmlFor="order-updates" className="flex-1">Receive order updates</Label>
                           <Input type="checkbox" id="order-updates" defaultChecked className="h-5 w-5"/>
                        </div>
                         <Button className="bg-primary hover:bg-primary/90 text-primary-foreground mt-2">Save Preferences</Button>
                     </CardContent>
                  </Card>

                </div>
              </TabsContent>
              <TabsContent value="logout">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-4">Log Out</h2>
                    <p className="text-muted-foreground mb-6">Are you sure you want to log out of your account?</p>
                    <Button variant="destructive" size="lg">
                        <LogOut size={18} className="mr-2"/> Yes, Log Me Out
                    </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
