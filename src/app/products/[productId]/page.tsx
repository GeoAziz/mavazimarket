import { mockProducts, mockReviews } from '@/lib/mock-data';
import type { Product } from '@/lib/types';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ImageCarousel } from '@/components/products/ImageCarousel';
import { ReviewStars } from '@/components/products/ReviewStars';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Heart, HelpCircle, Ruler, Send, ShoppingCart, StarIcon, Truck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export async function generateStaticParams() {
  return mockProducts.map((product) => ({
    productId: product.slug,
  }));
}

interface ProductPageProps {
  params: { productId: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = mockProducts.find(p => p.slug === params.productId);

  if (!product) {
    // Or redirect to a 404 page
    return <div className="text-center py-10">Product not found.</div>;
  }

  const relatedProducts = mockProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const productReviews = product.reviews || mockReviews.slice(0,2); // Fallback to generic reviews if specific not set

  return (
    <div className="space-y-10">
      <Breadcrumbs items={[
        { label: product.category.charAt(0).toUpperCase() + product.category.slice(1), href: `/${product.category}` },
        { label: product.subcategory, href: `/${product.category}/${product.subcategory.toLowerCase().replace(/\s+/g, '-')}` },
        { label: product.name }
      ]} />

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Carousel */}
        <div className="md:sticky md:top-24 self-start">
          <ImageCarousel images={product.images} altText={product.name} dataAiHint={product.dataAiHint} />
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary">{product.name}</h1>
          
          <div className="flex items-center space-x-2">
            <ReviewStars rating={product.averageRating || 0} totalReviews={productReviews.length} />
            <span className="text-sm text-muted-foreground">|</span>
            <span className="text-sm text-green-600 font-medium">{product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of Stock"}</span>
          </div>

          <p className="text-3xl font-extrabold text-foreground">KSh {product.price.toLocaleString()}</p>
          
          <p className="text-muted-foreground leading-relaxed">{product.description.substring(0,150)}...</p>

          {/* Color Options */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Color: <span className="text-muted-foreground">Selected Color</span></Label>
              <RadioGroup defaultValue={product.colors[0].toLowerCase()} className="flex space-x-2 mt-2">
                {product.colors.map(color => (
                  <RadioGroupItem 
                    key={color} 
                    value={color.toLowerCase()} 
                    id={`color-${color.toLowerCase()}`} 
                    className="sr-only peer" 
                  />
                   <Label 
                    htmlFor={`color-${color.toLowerCase()}`}
                    className="h-8 w-8 rounded-full border-2 border-transparent peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary peer-data-[state=checked]:ring-offset-2 cursor-pointer transition-all"
                    style={{ backgroundColor: color.toLowerCase() === 'white' ? '#f0f0f0' : color.toLowerCase() }}
                    title={color}
                  >
                    <span className="sr-only">{color}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="size-select" className="text-sm font-medium">Size:</Label>
                <Button variant="link" size="sm" className="text-accent p-0 h-auto hover:underline">
                  <Ruler size={14} className="mr-1" /> Size Guide
                </Button>
              </div>
              <Select defaultValue={product.sizes[0]}>
                <SelectTrigger id="size-select" className="w-full md:w-1/2">
                  <SelectValue placeholder="Select a size" />
                </SelectTrigger>
                <SelectContent>
                  {product.sizes.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Quantity - To be added if needed here, often handled in cart */}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button size="lg" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              <ShoppingCart size={20} className="mr-2" /> Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="flex-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              <Heart size={20} className="mr-2" /> Add to Wishlist
            </Button>
          </div>

          <Accordion type="single" collapsible className="w-full" defaultValue="delivery">
            <AccordionItem value="delivery">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center"><Truck size={18} className="mr-2 text-primary" /> Shipping & Returns</div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-1">
                <p>Standard delivery: 2-5 working days within Nairobi, 3-7 days nationwide.</p>
                <p>Express delivery options available for Nairobi (same day/next day).</p>
                <p>Easy returns within 14 days. <a href="/returns" className="text-accent hover:underline">Learn more</a>.</p>
                <p>Cash on Delivery available for select locations.</p>
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="care">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center"><HelpCircle size={18} className="mr-2 text-primary" /> Product Details & Care</div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-1">
                <p><strong>Material:</strong> {product.material || 'Not specified'}</p>
                <p><strong>Brand:</strong> {product.brand || 'Mavazi Market'}</p>
                <p><strong>Care Instructions:</strong> Check garment label. Generally, machine wash cold, gentle cycle. Do not bleach. Tumble dry low or hang dry.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </div>
      </div>

      {/* Product Description & Reviews Tabs */}
      <Tabs defaultValue="description" className="w-full pt-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-6">
          <TabsTrigger value="description">Full Description</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({productReviews.length})</TabsTrigger>
          <TabsTrigger value="shipping" className="hidden md:inline-flex">Shipping Info</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="prose max-w-none text-foreground">
          <h3 className="text-xl font-semibold mb-2">About This Product</h3>
          <p>{product.description}</p>
          {/* Add more detailed description if available */}
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        </TabsContent>
        <TabsContent value="reviews">
          <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
          {productReviews.length > 0 ? (
            <div className="space-y-6">
              {productReviews.map(review => (
                <div key={review.id} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-center mb-2">
                    <Avatar className="h-10 w-10 mr-3">
                       <AvatarImage src={`https://placehold.co/40x40.png?text=${review.userName.substring(0,1)}`} alt={review.userName} data-ai-hint="avatar person" />
                       <AvatarFallback>{review.userName.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{review.userName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
                    </div>
                    <ReviewStars rating={review.rating} size={4} className="ml-auto" showReviewCount={false}/>
                  </div>
                  <p className="text-sm text-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No reviews yet for this product. Be the first to review!</p>
          )}
          <Separator className="my-8" />
          <h4 className="text-lg font-semibold mb-3">Write a Review</h4>
          <form className="space-y-4">
            <div>
              <Label>Your Rating</Label>
              <div className="flex space-x-1 mt-1">
                {[1,2,3,4,5].map(star => <Button key={star} variant="ghost" size="icon" className="text-gray-300 hover:text-yellow-400"><StarIcon/></Button>)}
              </div>
            </div>
            <div>
              <Label htmlFor="review-comment">Your Review</Label>
              <Textarea id="review-comment" placeholder="Share your thoughts about the product..." rows={4}/>
            </div>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Send size={16} className="mr-2"/> Submit Review
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="shipping" className="text-sm text-muted-foreground space-y-2">
          <h3 className="text-xl font-semibold mb-2 text-foreground">Shipping Information</h3>
          <p>We offer reliable shipping across Kenya.</p>
          <ul className="list-disc list-inside">
            <li><strong>Nairobi & Environs:</strong> 1-2 business days. Same-day delivery available for orders placed before 12 PM (extra charges may apply).</li>
            <li><strong>Major Towns (Mombasa, Kisumu, Nakuru, Eldoret):</strong> 2-3 business days.</li>
            <li><strong>Other Regions:</strong> 3-5 business days.</li>
            <li><strong>Shipping Cost:</strong> Calculated at checkout based on location and package weight. Free shipping on orders above KSh 5,000.</li>
            <li><strong>Tracking:</strong> You will receive a tracking number once your order is shipped.</li>
            <li><strong>Popular Couriers:</strong> G4S, Sendy, Posta Kenya.</li>
          </ul>
          <p className="mt-4">For M-Pesa payments, ensure payment is completed to process your order promptly.</p>
        </TabsContent>
      </Tabs>

      {/* Related Products - Placeholder */}
      {relatedProducts.length > 0 && (
        <section className="pt-10">
          <h2 className="text-2xl font-bold text-center mb-8 text-primary">You Might Also Like</h2>
          {/* Use a product grid/carousel here, similar to homepage */}
          <p className="text-center text-muted-foreground">(Related products component to be implemented here)</p>
        </section>
      )}
    </div>
  );
}
