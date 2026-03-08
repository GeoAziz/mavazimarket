
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, CheckCircle } from 'lucide-react';

const mockThemes = [
  { id: 'default', name: 'Mavazi Default', image: 'https://placehold.co/300x200.png?text=Default+Theme', active: true, dataAiHint: "website theme" },
  { id: 'dark_crimson', name: 'Dark Crimson', image: 'https://placehold.co/300x200.png?text=Dark+Crimson', active: false, dataAiHint: "website theme dark" },
  { id: 'coral_light', name: 'Coral Light', image: 'https://placehold.co/300x200.png?text=Coral+Light', active: false, dataAiHint: "website theme light" },
  { id: 'monochrome', name: 'Monochrome Minimal', image: 'https://placehold.co/300x200.png?text=Monochrome', active: false, dataAiHint: "website theme minimal" },
];

export default function AdminThemesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary flex items-center">
        <Palette size={30} className="mr-3 text-accent" /> Manage Themes
      </h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Available Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Select a theme to change the look and feel of your storefront. Active theme is applied globally.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockThemes.map(theme => (
              <Card key={theme.id} className={`overflow-hidden shadow-md hover:shadow-lg transition-shadow ${theme.active ? 'border-2 border-primary ring-2 ring-primary ring-offset-2' : 'border'}`}>
                <img src={theme.image} alt={theme.name} className="w-full h-40 object-cover" data-ai-hint={theme.dataAiHint} />
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-foreground">{theme.name}</h3>
                    {theme.active && <CheckCircle className="text-green-500" />}
                  </div>
                  <Button variant={theme.active ? "secondary" : "default"} className="w-full mt-4" disabled={theme.active}>
                    {theme.active ? "Active" : "Activate"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
       <Card className="shadow-md mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Upload New Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Functionality to upload custom themes will be available here.</p>
          <Button variant="outline" className="mt-4">Upload Theme (Coming Soon)</Button>
        </CardContent>
      </Card>
    </div>
  );
}
