'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function CTASection() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <section className="py-24 md:py-32 bg-surface-gradient relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-secondary/10 blur-2xl" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl border border-border bg-card/70 backdrop-blur-md shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-card-sheen" />
            <div className="relative text-center px-6 sm:px-10 md:px-14 py-12 md:py-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/80 border border-border text-xs uppercase tracking-wider text-muted-foreground mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Ready to begin?
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
                Join the Gigsmint Community
              </h2>
              <p className="text-base md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
                Browse verified client leads for free. Unlock contact details for just ₹5 and connect directly with clients. No bidding, no subscriptions — just real opportunities.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="text-base md:text-lg px-7 md:px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl"
                  onClick={() => isAuthenticated ? router.push('/dashboard') : router.push('/register/freelancer')}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                {/* Pricing link removed */}
              </div>

              <p className="text-muted-foreground mt-6 text-xs md:text-sm">
                Free to browse • ₹5 per lead unlock • No subscriptions • No credit card required
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
