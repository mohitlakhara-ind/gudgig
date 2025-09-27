'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function CTASection() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-muted to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Start Your Journey Today
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Subscribe & unlock MicroJobs – Find gigs and short-term projects that match your skills
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-4 bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg hover:shadow-xl"
              onClick={() => isAuthenticated ? router.push('/dashboard') : router.push('/register/jobseeker')}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 text-foreground border-2 border-foreground bg-transparent hover:bg-foreground hover:text-background"
              onClick={() => router.push('/pricing')}
            >
              Learn More
            </Button>
          </div>

          <p className="text-muted-foreground mt-6 text-sm">
            Free to start • No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
