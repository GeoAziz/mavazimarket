import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <AlertTriangle className="w-24 h-24 text-destructive mb-8" />
      <h1 className="text-6xl font-extrabold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-foreground mb-6">Oops! Page Not Found</h2>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div className="space-x-4">
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
          <Link href="/">Go to Homepage</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
