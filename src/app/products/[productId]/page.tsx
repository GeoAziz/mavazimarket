
"use client";

import { useEffect, useState, use } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import type { Product, Review } from '@/lib/types';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ImageCarousel } from '@/components/products/ImageCarousel';
import { ReviewStars } from '@/components/products/ReviewStars';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Heart, HelpCircle, Ruler, Send, ShoppingCart, Star, Truck, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { submitProductReviewAction } from './review-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductPageProps {
  params: Promise<{ productId: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { productId: slug } = use(params);
  const { currentUser, appUser } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");

  useEffect(() => {
    if (!slug || !db) return;

    const fetchProductAndReviews = async () => {
      setLoading(true);
      try {
        // In a real app, doc ID might be random or slug. 
        // Our current setup often uses slug as doc ID or has it as a field.
        const docRef = doc(db, "products", slug);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(productData);
          
          // Listen for real-time reviews
          const reviewsRef = collection(db, "products", docSnap.id, "reviews");
          const revQuery = query(reviewsRef, orderBy("date", "desc"), limit(10));
          const unsubscribe = onSnapshot(revQuery, (snapshot) => {
            const fetchedReviews = snapshot.docs.map(d => ({
              id: d.id,
              ...d.data(),
              date: d.data().date?.toDate?.()?.toISOString() || new Date().toISOString()
            } as Review));
            setReviews(fetchedReviews);
          });
          return () => unsubscribe();
        }
      } catch (e) {
        console.error("Error loading product page:", e);
      }
      setLoading(false);
    };

    fetchProductAndReviews();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, 1);
    toast({ title: "Joined Collection", description: `${product.name} added to your bag.` });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !product) {
      toast({ title: "Auth Required", description: "Please sign in to share your heritage story.", variant: "destructive" });
      return;
    }
    if (!userComment.trim()) return;

    setSubmittingReview(true);
    const result = await submitProductReviewAction({
      productId: product.id,
      userId: currentUser.uid,
      userName: appUser?.name || "Anonymous",
      rating: userRating,
      comment: userComment,
      slug: product.slug
    });

    if (result.success) {
      toast({ title: "Review Shared", description: "Thank you for your feedback!" });
      setUserComment("");
      // Force a re-fetch of the product to get the new averageRating and reviewCount
      const docRef = doc(db!, "products", product.id);
      const updatedSnap = await getDoc(docRef);
      if (updatedSnap.exists()) {
        setProduct({ id: updatedSnap.id, ...updatedSnap.data() } as Product);
      }
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setSubmittingReview(false);
  };

  if (loading && !product) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-12">
        <Skeleton className="h-8 w-64" />
        <div className="grid md:grid-cols-2 gap-12">
          <Skeleton className="aspect-[3/4] w-full" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-14 flex-1" />
              <Skeleton className="h-14 flex-1" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-24 text-2xl font-heading text-secondary">Design not found.</div>;
  }

  return (
    <div className="space-y-10">
      <Breadcrumbs items={[
        { label: product.category, href: `/${product.category}` },
        { label: product.name }
      ]} />

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="md:sticky md:top-24 self-start">
          <ImageCarousel images={product.images} altText={product.name} dataAiHint={product.dataAiHint} />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">{product.brand || 'Authentic Heritage'}</p>
            <h1 className="text-4xl lg:text-5xl font-heading text-secondary">{product.name}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <ReviewStars rating={product.averageRating || 0} totalReviews={product.reviewCount || 0} />
            <span className="text-sm text-muted-foreground">|</span>
            <span className={product.stockQuantity > 0 ? "text-green-600 font-bold text-xs uppercase" : "text-destructive font-bold text-xs uppercase"}>
              {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity})` : "Out of Stock"}
            </span>
          </div>

          <p className="text-4xl font-heading text-primary font-bold">KSh {product.price.toLocaleString()}</p>
          
          <p className="text-muted-foreground leading-relaxed text-lg">{product.description}</p>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button size="lg" className="flex-1 bg-primary text-white h-[60px] text-lg font-bold" onClick={handleAddToCart}>
              <ShoppingCart size={20} className="mr-3" /> ADD TO BAG
            </Button>
            <Button size="lg" variant="outline" className="flex-1 h-[60px] text-lg font-bold border-secondary">
              <Heart size={20} className="mr-3" /> WISHLIST
            </Button>
          </div>

          <Accordion type="single" collapsible className="w-full border-t mt-8" defaultValue="delivery">
            <AccordionItem value="delivery">
              <AccordionTrigger className="font-heading text-lg">Shipping & Heritage Care</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-3">
                <div className="flex items-start gap-3">
                  <Truck className="shrink-0 text-primary" size={18} />
                  <p className="text-sm">Standard delivery (2-4 days) across Kenya. Express options available at checkout.</p>
                </div>
                <div className="flex items-start gap-3">
                  <HelpCircle className="shrink-0 text-primary" size={18} />
                  <p className="text-sm">Material: {product.material || 'Organic Blend'}. Best cleaned with gentle cycles to preserve texture.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <Tabs defaultValue="reviews" className="w-full pt-12">
        <TabsList className="grid w-full grid-cols-2 bg-secondary/5 rounded-xl h-14 p-1">
          <TabsTrigger value="description" className="font-heading text-lg rounded-lg">THE STORY</TabsTrigger>
          <TabsTrigger value="reviews" className="font-heading text-lg rounded-lg">VOICES ({product.reviewCount || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="py-12">
          <div className="max-w-3xl auto prose prose-stone lg:prose-xl font-sans text-muted-foreground">
            <p>{product.description}</p>
            <p>Every Mavazi Market piece is a bridge between generations. Crafted with respect for traditional silhouettes and updated for the modern pace.</p>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="py-12">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-8">
              <h3 className="text-2xl font-heading text-secondary">Customer Voices</h3>
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review.id} className="p-6 border-2 border-primary/5 rounded-2xl bg-card hover:border-primary/10 transition-all">
                      <div className="flex items-center mb-4">
                        <Avatar className="h-12 w-12 mr-4 border-2 border-primary/10">
                           <AvatarImage src={`https://placehold.co/48x48.png?text=${review.userName.charAt(0)}`} alt={review.userName} />
                           <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-bold text-secondary">{review.userName}</p>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{new Date(review.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <ReviewStars rating={review.rating} size={3} showReviewCount={false}/>
                      </div>
                      <p className="text-muted-foreground leading-relaxed italic">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border-4 border-dashed border-primary/5 rounded-3xl">
                  <p className="text-muted-foreground font-heading text-xl">Be the first voice to share this design's story.</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-5">
              <Card className="border-none shadow-2xl rounded-2xl overflow-hidden sticky top-32">
                <CardHeader className="bg-secondary text-white p-8">
                  <CardTitle className="font-heading text-2xl">Leave Your Mark</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Your Rating</Label>
                    <div className="flex space-x-2">
                      {[1,2,3,4,5].map(star => (
                        <button 
                          key={star} 
                          onClick={() => setUserRating(star)}
                          className={`transition-colors ${userRating >= star ? 'text-accent' : 'text-secondary/10'}`}
                        >
                          <Star fill="currentColor" size={32} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="review-comment" className="text-[10px] uppercase font-bold tracking-widest text-secondary/50">Your Experience</Label>
                    <Textarea 
                      id="review-comment" 
                      placeholder="Share how this piece fits into your heritage..." 
                      rows={5}
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      className="resize-none rounded-xl border-2 border-primary/5 focus-visible:ring-primary"
                    />
                  </div>
                  <Button 
                    className="w-full h-14 bg-primary text-white font-bold tracking-widest"
                    disabled={submittingReview || !currentUser}
                    onClick={handleReviewSubmit}
                  >
                    {submittingReview ? <Loader2 className="animate-spin mr-2" /> : <Send size={18} className="mr-2"/>}
                    {currentUser ? "POST REVIEW" : "SIGN IN TO REVIEW"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
