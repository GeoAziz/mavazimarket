
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Truck, CreditCard, RefreshCcw } from 'lucide-react';

const faqs = [
  {
    category: "Logistics & Delivery",
    icon: Truck,
    items: [
      { q: "Where do you deliver?", a: "We deliver across all 47 counties in Kenya. In Nairobi, we offer same-day delivery for orders placed before 11:00 AM. For other regions, delivery takes 2-4 business days via our partners G4S and Wells Fargo." },
      { q: "How much is shipping?", a: "Shipping is a flat rate of KSh 250 for Nairobi and KSh 450 for the rest of Kenya. Orders above KSh 3,000 enjoy free standard delivery nationwide." },
      { q: "Can I track my order?", a: "Yes. Once your order is processed, you will receive an SMS and email with a tracking number from our logistics partner." }
    ]
  },
  {
    category: "Payments",
    icon: CreditCard,
    items: [
      { q: "What payment methods do you accept?", a: "We primarily accept M-Pesa (via STK Push at checkout). We also accept major Credit/Debit cards (Visa, Mastercard) and PayPal for our international heritage seekers." },
      { q: "Is it safe to pay with M-Pesa on Mavazi?", a: "Absolutely. We use a secure Daraja API connection. We never store your M-Pesa PIN; you enter it directly into the encrypted prompt on your phone." },
      { q: "Do you offer Cash on Delivery (COD)?", a: "To ensure the safety of our couriers and the speed of our logistics, we currently only accept pre-payments via M-Pesa or Card." }
    ]
  },
  {
    category: "Returns & Sizing",
    icon: RefreshCcw,
    items: [
      { q: "What is your return policy?", a: "We offer a 7-day return policy for items in original condition with tags. Please note that for hygiene reasons, innerwear and earrings cannot be returned unless defective." },
      { q: "How do I know my size?", a: "Each product page has a specific 'Size Guide'. Most of our heritage pieces follow standard UK/EU sizing, but some traditional cuts are more relaxed. Check the specific dimensions before purchase." }
    ]
  }
];

export default function FaqPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      <Breadcrumbs items={[{ label: 'Help Center' }]} />
      
      <div className="text-center space-y-4">
        <HelpCircle className="h-16 w-16 text-primary mx-auto opacity-20" />
        <h1 className="text-5xl font-heading text-secondary">Frequently Asked</h1>
        <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Your Heritage Logistics Guide</p>
      </div>

      <div className="space-y-12">
        {faqs.map((section, idx) => (
          <div key={idx} className="space-y-6">
            <div className="flex items-center gap-3 border-b-2 border-primary/10 pb-2">
              <section.icon className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-heading text-secondary">{section.category}</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {section.items.map((item, itemIdx) => (
                <AccordionItem key={itemIdx} value={`item-${idx}-${itemIdx}`} className="border-none mb-2">
                  <AccordionTrigger className="text-left font-bold text-secondary hover:no-underline hover:text-primary py-4 px-6 bg-secondary/5 rounded-xl">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground px-6 py-4 leading-relaxed bg-white rounded-b-xl">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>

      <div className="bg-primary text-white p-12 rounded-[2rem] text-center space-y-6">
        <h3 className="text-3xl font-heading">Still have questions?</h3>
        <p className="text-white/80">Our advisors are standing by to help you find your path.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="mailto:support@mavazimarket.com" className="bg-white text-primary font-bold px-8 py-4 rounded-full uppercase tracking-widest text-sm hover:bg-accent hover:text-secondary transition-colors">Email Support</a>
          <a href="tel:+254700123456" className="bg-secondary text-white font-bold px-8 py-4 rounded-full uppercase tracking-widest text-sm hover:bg-accent hover:text-secondary transition-colors">Call an Advisor</a>
        </div>
      </div>
    </div>
  );
}
