
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Undo2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      <Breadcrumbs items={[{ label: 'Help' }, { label: 'Returns & Exchanges' }]} />
      
      <div className="text-center space-y-4">
        <Undo2 className="h-16 w-16 text-primary mx-auto opacity-20" />
        <h1 className="text-5xl font-heading text-secondary">Hassle-Free Returns</h1>
        <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Our Heritage Guarantee</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="p-8 bg-secondary/5 rounded-3xl text-center space-y-4">
          <ShieldCheck className="h-8 w-8 text-primary mx-auto" />
          <h3 className="font-heading text-xl">7-Day Window</h3>
          <p className="text-sm text-muted-foreground">Return any item within 7 days of delivery if it doesn't fit your path.</p>
        </div>
        <div className="p-8 bg-secondary/5 rounded-3xl text-center space-y-4">
          <RefreshCcw className="h-8 w-8 text-primary mx-auto" />
          <h3 className="font-heading text-xl">Easy Exchanges</h3>
          <p className="text-sm text-muted-foreground">Swap sizes instantly. We'll send the new one as soon as we verify the return.</p>
        </div>
        <div className="p-8 bg-secondary/5 rounded-3xl text-center space-y-4">
          <CreditCard className="h-8 w-8 text-primary mx-auto" />
          <h3 className="font-heading text-xl">Swift Refunds</h3>
          <p className="text-sm text-muted-foreground">Refunds are processed back to your original M-Pesa or Card within 48 hours.</p>
        </div>
      </div>

      <div className="prose prose-stone max-w-none prose-headings:font-heading prose-headings:text-secondary prose-p:text-muted-foreground prose-strong:text-primary">
        <h2>How to initiate a return</h2>
        <ol>
          <li>Log in to your <strong>Mavazi Account</strong>.</li>
          <li>Go to <strong>Order History</strong> and select the item you wish to return.</li>
          <li>Click 'Initiate Return' and select your reason.</li>
          <li>Pack the item in its original heritage packaging.</li>
          <li>Our courier will contact you within 24 hours to schedule a pickup.</li>
        </ol>

        <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-r-xl flex gap-4">
          <AlertCircle className="h-6 w-6 text-accent shrink-0" />
          <div>
            <p className="font-bold text-secondary mb-1">Non-Returnable Items</p>
            <p className="text-sm">For hygiene and artisan preservation, we cannot accept returns on earrings, face masks, or custom-tailored bespoke orders unless they arrive damaged.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
import { RefreshCcw, CreditCard } from 'lucide-react';
