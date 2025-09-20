import Header from '@/components/Header';
import Hero from '@/components/Hero';
import StatsSection from '@/components/StatsSection';
import HowItWorks from '@/components/HowItWorksMinimal';
import Features from '@/components/Features';
import ShowcaseSection from '@/components/ShowcaseSection';
import Pricing from '@/components/Pricing';
import Testimonials from '@/components/Testimonials';
import SocialProofTicker from '@/components/SocialProofTicker';
import NewsletterSection from '@/components/NewsletterSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Home",
  description: "Find your dream job on JobPortal. Browse thousands of job listings, connect with top employers, and take the next step in your career today.",
  openGraph: {
    title: "JobPortal - Find Your Dream Job",
    description: "Find your dream job on JobPortal. Browse thousands of job listings, connect with top employers, and take the next step in your career today.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JobPortal - Find Your Dream Job",
    description: "Find your dream job on JobPortal. Browse thousands of job listings, connect with top employers, and take the next step in your career today.",
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
      <div className="min-h-screen">
        <Header />
        <main>
          <Hero />
          <StatsSection />
          <HowItWorks />
          <Features />
          <ShowcaseSection />
          <Pricing />
          <Testimonials />
          <SocialProofTicker />
          <CTASection />
          <NewsletterSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
