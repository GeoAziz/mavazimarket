
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      <Breadcrumbs items={[{ label: 'Legal' }, { label: 'Privacy Policy' }]} />
      
      <div className="space-y-4">
        <h1 className="text-5xl font-heading text-secondary">Privacy Policy</h1>
        <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest">KDPP Compliant • March 2026</p>
      </div>

      <div className="prose prose-stone max-w-none prose-headings:font-heading prose-headings:text-secondary prose-p:text-muted-foreground prose-strong:text-primary">
        <p>At Mavazi Market, your data is treated with the same respect as our heritage fabrics. This policy outlines how we collect and protect your information in accordance with the Kenya Data Protection Act (2019).</p>

        <h2>1. Information We Collect</h2>
        <p>We collect information necessary to fulfill your heritage journey:</p>
        <ul>
          <li><strong>Identity:</strong> Name, email, and phone number for account creation.</li>
          <li><strong>Logistics:</strong> Shipping addresses and delivery preferences.</li>
          <li><strong>Transactional:</strong> M-Pesa transaction IDs (we do not store PINs) and purchase history.</li>
          <li><strong>AI Preferences:</strong> Style choices shared with our AI Advisor to provide better curations.</li>
        </ul>

        <h2>2. How We Use Your Data</h2>
        <p>Your data is used to process orders, improve our AI algorithms, and send you "Heritage Drops" (newsletters) if you have opted in. We never sell your data to third-party marketing firms.</p>

        <h2>3. Data Security</h2>
        <p>We use industry-standard SSL encryption and Firebase's secure cloud infrastructure to host your profile. Financial data is handled through PCI-compliant gateways and encrypted Daraja tunnels.</p>

        <h2>4. Your Rights</h2>
        <p>Under the KDPP, you have the right to access, correct, or request the deletion of your personal data. To exercise these rights, please contact our Data Protection Officer at <a href="mailto:privacy@mavazimarket.com">privacy@mavazimarket.com</a>.</p>

        <h2>5. Cookies</h2>
        <p>We use cookies to maintain your shopping bag across sessions and analyze site traffic to improve our craftsmanship. You can disable cookies in your browser, though some features of the marketplace may be restricted.</p>
      </div>
    </div>
  );
}
