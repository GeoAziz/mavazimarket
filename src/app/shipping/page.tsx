
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Truck, MapPin, Package, Clock } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      <Breadcrumbs items={[{ label: 'Help' }, { label: 'Shipping Information' }]} />
      
      <div className="text-center space-y-4">
        <Truck className="h-16 w-16 text-primary mx-auto opacity-20" />
        <h1 className="text-5xl font-heading text-secondary">Global Logistics</h1>
        <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Nairobi to the World</p>
      </div>

      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border-2 border-primary/10 p-8 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="text-primary h-6 w-6" />
              <h3 className="font-heading text-2xl">Nairobi & Environs</h3>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex justify-between"><span>Standard (1-2 days)</span><span className="font-bold text-secondary">KSh 250</span></li>
              <li className="flex justify-between"><span>Express (Same Day)</span><span className="font-bold text-secondary">KSh 500</span></li>
              <li className="flex justify-between"><span>Pick-up (Biashara St)</span><span className="font-bold text-green-600">FREE</span></li>
            </ul>
          </div>
          <div className="border-2 border-primary/10 p-8 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <Package className="text-primary h-6 w-6" />
              <h2 className="font-heading text-2xl">Upcountry Kenya</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex justify-between"><span>G4S/Wells Fargo (2-4 days)</span><span className="font-bold text-secondary">KSh 450</span></li>
              <li className="flex justify-between"><span>Orders over KSh 3,000</span><span className="font-bold text-green-600">FREE</span></li>
            </ul>
          </div>
        </div>

        <div className="bg-secondary text-white p-12 rounded-[2rem] flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2 space-y-4">
            <Clock className="h-12 w-12 text-accent" />
            <h3 className="text-3xl font-heading">Processing Time</h3>
            <p className="text-white/60 leading-relaxed">Every piece is inspected for quality before it leaves our heritage center. We typically process orders within 12-24 hours of payment verification.</p>
          </div>
          <div className="md:w-1/2 border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-12 space-y-4">
            <h3 className="text-3xl font-heading">International</h3>
            <p className="text-white/60 leading-relaxed">We ship globally via DHL Express. Shipping rates are calculated at checkout based on your destination country. Delivery typically takes 5-7 business days.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
