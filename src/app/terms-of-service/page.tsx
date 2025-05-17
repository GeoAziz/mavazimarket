
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Terms of Service' }]} />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary flex items-center">
            <FileText size={28} className="mr-3 text-accent" />
            Terms of Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page will outline the terms and conditions for using the Mavazi Market website and services.
          </p>
          <p className="mt-4">Content coming soon!</p>
        </CardContent>
      </Card>
    </div>
  );
}
