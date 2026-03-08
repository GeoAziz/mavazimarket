
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      <Breadcrumbs items={[{ label: 'Legal' }, { label: 'Terms of Service' }]} />
      
      <div className="space-y-4">
        <h1 className="text-5xl font-heading text-secondary">Terms of Service</h1>
        <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest">Effective Date: March 1, 2026</p>
      </div>

      <div className="prose prose-stone max-w-none prose-headings:font-heading prose-headings:text-secondary prose-p:text-muted-foreground prose-strong:text-primary">
        <p>Welcome to Mavazi Market. These terms govern your use of our platform and the purchase of heritage-inspired designs. By accessing this site, you agree to comply with Kenyan consumer protection laws and these conditions.</p>

        <h2>1. User Account & Security</h2>
        <p>You are responsible for maintaining the confidentiality of your heritage account and password. Mavazi Market reserves the right to refuse service, terminate accounts, or cancel orders at our sole discretion, particularly in cases of suspected fraud or breach of these terms.</p>

        <h2>2. Product Representation</h2>
        <p>We strive for absolute accuracy in showcasing the textures, colors, and craftsmanship of our pieces. However, as many of our products utilize traditional dyes and hand-woven fabrics, slight variations are a mark of authenticity and not a defect.</p>

        <h2>3. Payment & Pricing</h2>
        <p>All prices are in Kenyan Shillings (KSh) and are inclusive of VAT (16%) where applicable. Payment must be made via M-Pesa, Card, or PayPal at the time of order. Orders are only confirmed once payment is verified through the Daraja API or relevant gateway.</p>

        <h2>4. Delivery & Logistics</h2>
        <p>Delivery timelines are estimates. While we partner with the most reliable couriers in East Africa, we are not liable for delays caused by extreme weather, regional disruptions, or incorrect address information provided by the user.</p>

        <h2>5. Intellectual Property</h2>
        <p>All content, including designs, photography, and the "Mavazi Market" brand identity, is the exclusive property of Mavazi Market Ltd. Unauthorized reproduction of our heritage patterns or brand assets is strictly prohibited under Kenyan and international copyright law.</p>

        <h2>6. Governing Law</h2>
        <p>These terms are governed by the Laws of the Republic of Kenya. Any disputes arising from the use of this platform shall be subject to the exclusive jurisdiction of the courts in Nairobi.</p>
      </div>
    </div>
  );
}
