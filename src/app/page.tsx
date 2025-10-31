import Hero from '@/components/Hero';
import StatsSection from '@/components/StatsSection';
import HowItWorks from '@/components/HowItWorks';
import LatestGigs from '@/components/gigs/LatestGigs';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gigs Mint — Find & Bid on Projects That Match Your Skills',
  description: 'Browse freelance projects, place bids, and win work. Clean, minimal LinkedIn-style experience for freelancers.',
  openGraph: {
    title: 'Gigs Mint — Find & Bid on Projects',
    description: 'Find projects that match your skills. Place bids and connect with admins.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gigs Mint — Browse and Bid on Projects',
    description: 'A focused freelancer experience without subscription complexity.',
  },
};

export default function Home() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Gigs Mint — Freelancer Projects",
    "description": "Find and bid on freelance projects. Clean, minimal experience for freelancers.",
    "url": "https://gigs-mint.example",
    "mainEntity": {
      "@type": "ItemList",
      "name": "Freelance Project Categories",
      "description": "Browse projects by category and place bids"
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
        <StatsSection />
        <HowItWorks />
        <LatestGigs />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}


