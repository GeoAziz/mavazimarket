
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Settings2, Save } from 'lucide-react';

export default function AdminCustomizePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary flex items-center">
        <Settings2 size={30} className="mr-3 text-accent" /> Customize Appearance
      </h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Theme Customizer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2 text-foreground">Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="primary-color">Primary Color</Label>
                <Input id="primary-color" type="color" defaultValue="#DC143C" className="h-10 p-1" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="accent-color">Accent Color</Label>
                <Input id="accent-color" type="color" defaultValue="#FF7F50" className="h-10 p-1" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="background-color">Background Color</Label>
                <Input id="background-color" type="color" defaultValue="#FAF9F6" className="h-10 p-1" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="foreground-color">Text Color</Label>
                <Input id="foreground-color" type="color" defaultValue="#333333" className="h-10 p-1" />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-2 text-foreground">Logo & Favicon</h3>
             <div className="space-y-1 mb-4">
                <Label htmlFor="logo-upload">Upload Logo</Label>
                <Input id="logo-upload" type="file" />
                <p className="text-xs text-muted-foreground">Recommended size: 200x50px. Formats: SVG, PNG, JPG.</p>
              </div>
               <div className="space-y-1">
                <Label htmlFor="favicon-upload">Upload Favicon</Label>
                <Input id="favicon-upload" type="file" />
                 <p className="text-xs text-muted-foreground">Recommended size: 32x32px. Format: ICO, PNG.</p>
              </div>
          </div>

           <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-2 text-foreground">Homepage Layout</h3>
             <div className="flex items-center space-x-2">
                <Switch id="show-hero-banner" defaultChecked/>
                <Label htmlFor="show-hero-banner">Show Hero Banner</Label>
            </div>
             <div className="flex items-center space-x-2 mt-2">
                <Switch id="show-featured-products" defaultChecked/>
                <Label htmlFor="show-featured-products">Show Featured Products Section</Label>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Save size={18} className="mr-2" /> Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
