import Hero from '@/components/Hero';
import StatsSection from '@/components/StatsSection';
import HowItWorks from '@/components/HowItWorks';
import LatestGigs from '@/components/gigs/LatestGigs';
import CTASection from '@/components/CTASection';
import ProfessionalTestimonials from '@/components/ProfessionalTestimonials';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import CategorySub from '@/components/category-sub';

export const metadata: Metadata = {
  title: 'Gigsmint.com — Where Opportunities Meet Talent, One Lead at a Time',
  description: 'Browse verified client leads for free. Pay just ₹5 to unlock contact details and connect directly. Simple, transparent, and affordable.',
  openGraph: {
    title: 'Gigsmint.com — Connect with Verified Client Leads',
    description: 'Browse leads for free, unlock contact details for ₹5. No bidding, no subscriptions - just real opportunities.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gigsmint.com — Verified Client Leads',
    description: 'Simple, transparent, and affordable lead access for freelancers.',
  },
};

export default function Home() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Gigsmint.com — Verified Client Leads",
    "description": "Browse verified client leads for free. Unlock contact details for ₹5 and connect directly with clients.",
    "url": "https://gigsmint.com",
    "mainEntity": {
      "@type": "ItemList",
      "name": "Client Lead Categories",
      "description": "Browse verified leads across multiple categories"
    }
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <main>
        <Hero />
        <LatestGigs />
        <CategorySub />
        <StatsSection />
        <HowItWorks />
        <ProfessionalTestimonials />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}


