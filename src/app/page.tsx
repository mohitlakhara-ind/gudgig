import Header from '@/components/Header';
import Hero from '@/components/Hero';
import StatsSection from '@/components/StatsSection';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import FeaturesEnhanced from '@/components/Features';
import ShowcaseSection from '@/components/ShowcaseSection';
import Pricing from '@/components/Pricing';
import Testimonials from '@/components/Testimonials';
import SocialProofTicker from '@/components/SocialProofTicker';
import NewsletterSection from '@/components/NewsletterSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <StatsSection />
        <HowItWorks />
        <Features />
        <FeaturesEnhanced />
        <ShowcaseSection />
        <Pricing />
        <Testimonials />
        <SocialProofTicker />
        <CTASection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}
