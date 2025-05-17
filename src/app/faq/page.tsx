
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

export default function FaqPage() {
  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'FAQ' }]} />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary flex items-center">
            <HelpCircle size={28} className="mr-3 text-accent" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page will contain answers to frequently asked questions about Mavazi Market, our products, shipping, returns, and more.
          </p>
          <p className="mt-4">Content coming soon!</p>
        </CardContent>
      </Card>
    </div>
  );
}
