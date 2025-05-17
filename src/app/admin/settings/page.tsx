
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Store, Mail, MapPin, Phone, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary flex items-center">
        <Settings size={30} className="mr-3 text-accent" /> Site Settings
      </h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Store className="mr-2 text-primary/80"/> General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="site-name">Site Name</Label>
            <Input id="site-name" defaultValue="Mavazi Market" />
          </div>
          <div>
            <Label htmlFor="site-tagline">Site Tagline</Label>
            <Input id="site-tagline" defaultValue="Your one-stop shop for the latest fashion trends in Kenya." />
          </div>
           <div>
            <Label htmlFor="site-description">Site Description (for SEO)</Label>
            <Textarea id="site-description" defaultValue="Mavazi Market offers a wide range of clothing and accessories for men, women, and kids in Kenya. Discover new arrivals and best sellers." />
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><MapPin className="mr-2 text-primary/80"/> Contact & Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div>
            <Label htmlFor="contact-email">Public Email</Label>
            <Input id="contact-email" type="email" defaultValue="support@mavazimarket.co.ke" />
          </div>
          <div>
            <Label htmlFor="contact-phone">Public Phone Number</Label>
            <Input id="contact-phone" type="tel" defaultValue="+254 700 123 456" />
          </div>
          <div>
            <Label htmlFor="store-address">Store Address</Label>
            <Input id="store-address" defaultValue="123 Mavazi Towers, Biashara Street, Nairobi, Kenya" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Payment & Shipping Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Settings for payment gateways (M-Pesa, Card) and shipping methods will be configured here.</p>
          <p className="mt-2">Content coming soon!</p>
        </CardContent>
      </Card>
      
      <div className="flex justify-end pt-4">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Save size={18} className="mr-2" /> Save All Settings
        </Button>
      </div>
    </div>
  );
}
