
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Undo2 } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Returns & Exchanges' }]} />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary flex items-center">
            <Undo2 size={28} className="mr-3 text-accent" />
            Returns & Exchanges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page will outline our returns and exchanges policy, including how to initiate a return, conditions for returns, and refund processing.
          </p>
          <p className="mt-4">Content coming soon!</p>
        </CardContent>
      </Card>
    </div>
  );
}
