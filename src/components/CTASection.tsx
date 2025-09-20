'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-teal-600">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Start Your Journey Today
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
            Subscribe & Unlock Jobs – Connect with opportunities that match your skills
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600"
            >
              Learn More
            </Button>
          </div>

          <p className="text-blue-100 mt-6 text-sm">
            Free to start • No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
