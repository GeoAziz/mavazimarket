
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Shipping Information' }]} />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary flex items-center">
            <Truck size={28} className="mr-3 text-accent" />
            Shipping Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page will provide detailed information about our shipping policies, delivery times, costs, and supported regions within Kenya.
          </p>
          <p className="mt-4">Content coming soon!</p>
        </CardContent>
      </Card>
    </div>
  );
}
