"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Search, CheckCircle, Briefcase, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Employer flow removed — show only freelancer (candidate) flow

const candidateSteps = [
  {
    icon: Search,
    title: 'Browse Leads',
    description: 'Explore verified client leads across various categories. Browse for free and see lead details before unlocking.',
    detail: 'Search by category, skills, or location. All leads are verified by our team',
    color: 'primary'
  },
  {
    icon: CheckCircle,
    title: 'Unlock Contact Details',
    description: 'Pay just ₹5 to unlock client contact information. No subscriptions, no hidden fees - pay only for leads you want.',
    detail: 'Instant access to contact details after payment. Secure payment via Razorpay',
    color: 'secondary'
  },
  {
    icon: Briefcase,
    title: 'Connect & Grow',
    description: 'Contact clients directly using the unlocked information. Build relationships and grow your freelance business.',
    detail: 'Direct communication with clients. Track your unlocked leads in dashboard',
    color: 'accent'
  }
];

export default function HowItWorksMinimal() {
  return (
    <section className="py-24 md:py-36 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/60 border border-border text-xs uppercase tracking-wider text-muted-foreground mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            How it works
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">
            How It Works for Freelancers
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto font-normal leading-relaxed mb-10">
            Simple steps for freelancers to discover verified opportunities and connect with clients
          </p>
        </div>

        {/* Freelancer (Candidate) Steps Content */}
        <div className="relative">
          <div className="transition-all duration-500 opacity-100">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {candidateSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative group">
                    {/* Connection Arrow */}
                    {index < candidateSteps.length - 1 && (
                      <div className="hidden md:flex absolute top-20 -right-4 z-10 w-8 h-8 bg-card items-center justify-center rounded-full border border-accent/30">
                        <ArrowRight className="w-4 h-4 text-secondary" />
                      </div>
                    )}

                    <Card className="h-full border border-border hover:border-secondary/40 hover:shadow-lg transition-all duration-300 bg-card/60 backdrop-blur-sm group-hover:bg-card rounded-2xl">
                      <CardContent className="p-8">
                        {/* Step Number & Icon */}
                        <div className="flex items-center mb-6">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 bg-${step.color}/10`}>
                            <Icon className={`h-6 w-6 text-${step.color}`} />
                          </div>
                          <span className="text-xs font-medium text-accent tracking-wider uppercase">
                            Step {index + 1}
                          </span>
                        </div>

                        <h3 className="text-xl font-semibold text-card-foreground mb-2 tracking-tight">
                          {step.title}
                        </h3>

                        <p className="text-secondary mb-3 leading-relaxed text-sm">
                          {step.description}
                        </p>

                        <div className="text-sm text-card-foreground bg-muted rounded-lg p-3 border-l-4 border-secondary/20">
                          {step.detail}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Candidate CTA (Browse only) */}
            <div className="text-center">
              <div className="flex justify-center items-center max-w-md mx-auto">
                <Link
                  href="/gigs"
                  className="inline-flex justify-center bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-medium hover:bg-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm tracking-wide"
                >
                  Browse Leads
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Free to browse • ₹5 to unlock • No subscriptions</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}