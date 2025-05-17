
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary flex items-center">
            <ShieldCheck size={28} className="mr-3 text-accent" />
            Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page will detail how Mavazi Market collects, uses, and protects your personal information.
          </p>
          <p className="mt-4">Content coming soon!</p>
        </CardContent>
      </Card>
    </div>
  );
}
