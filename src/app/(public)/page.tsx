import Hero from '@/components/Hero';
import StatsSection from '@/components/StatsSection';
import HowItWorks from '@/components/HowItWorks';
import FeaturesBalanced from '@/components/FeaturesBalanced';
import ShowcaseSection from '@/components/ShowcaseSection';
import Pricing from '@/components/Pricing';
import Testimonials from '@/components/Testimonials';
import NewsletterSection from '@/components/NewsletterSection';
import CTASection from '@/components/CTASection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Find meaningful micro jobs",
  description: "Connect with people who truly value your skills. Start free, upgrade anytime.",
  openGraph: {
    title: "Find meaningful micro jobs",
    description: "Connect with people who truly value your skills.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find meaningful micro jobs",
    description: "Connect with people who truly value your skills.",
  },
};

export default function Home() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "JobPortal - Find Your Dream Job",
    "description": "Find your dream job on JobPortal. Browse thousands of job listings, connect with top employers, and take the next step in your career today.",
    "url": "https://jobportal.com",
    "isPartOf": {
      "@type": "WebSite",
      "name": "JobPortal",
      "url": "https://jobportal.com"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://jobportal.com"
        }
      ]
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": "Job Search Features",
      "description": "Comprehensive job search platform with advanced features"
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
        <FeaturesBalanced />
        <ShowcaseSection />
        <Pricing />
        <Testimonials />
        <CTASection />
        <NewsletterSection />
      </main>
    </>
  );
}
