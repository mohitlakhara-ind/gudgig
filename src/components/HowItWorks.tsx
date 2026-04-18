"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Search, CheckCircle, Briefcase, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Employer flow removed — show only freelancer (candidate) flow

const candidateSteps = [
  {
    icon: Search,
    title: 'Browse High-Value Leads',
    description: 'Discover verified client opportunities across diverse industries. Explore full requirements and budget details for free before deciding to connect.',
    detail: 'Filter by expertise, budget, or location. All leads undergo a rigorous quality verification process.',
    color: 'primary'
  },
  {
    icon: CheckCircle,
    title: 'Instant Lead Access',
    description: 'Access direct client contact information for a minimal unlock fee. No recurring subscriptions or hidden costs—pay only for the leads you want to pursue.',
    detail: 'Secure one-click payment via Razorpay. Immediate access to emails, phone numbers, and custom contact info.',
    color: 'primary'
  },
  {
    icon: Briefcase,
    title: 'Direct Client Engagement',
    description: 'Engage with clients directly utilizing unlocked contact details. Build lasting professional relationships and grow your business on your own terms.',
    detail: 'Bypassing middlemen leads to higher margins. Track and manage all your prospects from a centralized dashboard.',
    color: 'primary'
  }
];

export default function HowItWorksMinimal() {
  return (
    <section className="py-24 md:py-36 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs uppercase tracking-wider text-muted-foreground mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Process Flow
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">
            How It Works for Freelancers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed mb-10">
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
                      <div className="hidden md:flex absolute top-20 -right-4 z-10 w-8 h-8 bg-card items-center justify-center rounded-full border border-border shadow-sm">
                        <ArrowRight className="w-4 h-4 text-primary" />
                      </div>
                    )}

                    <Card className="h-full border border-border hover:border-primary/20 hover:shadow-xl transition-all duration-300 bg-card group-hover:bg-card/80 rounded-2xl">
                      <CardContent className="p-8">
                        {/* Step Number & Icon */}
                        <div className="flex items-center mb-6">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 bg-primary/10`}>
                            <Icon className={`h-6 w-6 text-primary`} />
                          </div>
                          <span className="text-xs font-semibold text-primary tracking-wider uppercase">
                            Step {index + 1}
                          </span>
                        </div>

                        <h3 className="text-xl font-semibold text-foreground mb-2 tracking-tight">
                          {step.title}
                        </h3>

                        <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                          {step.description}
                        </p>

                        <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 border-l-4 border-primary/20 italic">
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
                  className="inline-flex justify-center bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Browse Leads Now
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-4">Free to browse • Affordable unlock fees • Direct connections</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}