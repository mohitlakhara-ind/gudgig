'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Search, CheckCircle, Users, Briefcase, ArrowRight, ChevronRight } from 'lucide-react';

const employerSteps = [
  {
    icon: Upload,
    title: 'Post Your Job',
    description: 'Create detailed job listings with requirements, skills, and budget. Our team reviews for quality assurance.',
    detail: 'Add job title, description, requirements, budget range, and timeline',
    color: 'primary'
  },
  {
    icon: CheckCircle,
    title: 'Get Approved',
    description: 'Quick admin review ensures quality listings. Most jobs are approved within 24 hours.',
    detail: 'Quality check for clear requirements and fair compensation',
    color: 'secondary'
  },
  {
    icon: Users,
    title: 'Connect with Talent',
    description: 'Receive applications from qualified candidates and manage the hiring process seamlessly.',
    detail: 'Review applications, schedule interviews, and hire the best fit',
    color: 'accent'
  }
];

const candidateSteps = [
  {
    icon: Search,
    title: 'Browse Jobs',
    description: 'Explore job listings across various categories and skill levels. Filter by location, budget, and type.',
    detail: 'Search by category, location, skills, or company size',
    color: 'primary'
  },
  {
    icon: CheckCircle,
    title: 'Choose Your Plan',
    description: 'Select from flexible subscription plans to unlock full job details and application features.',
    detail: 'Basic free access or premium plans with full details and priority support',
    color: 'secondary'
  },
  {
    icon: Briefcase,
    title: 'Apply & Track',
    description: 'Submit applications directly and track your progress through an intuitive dashboard.',
    detail: 'One-click apply, application tracking, and interview scheduling',
    color: 'accent'
  }
];

export default function HowItWorksMinimal() {
  const [activeTab, setActiveTab] = useState('employers');

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
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed mb-10">
            Simple steps for both employers and freelancers to connect and collaborate
          </p>

          {/* Tab Switcher */}
          <div className="inline-flex bg-muted p-1.5 rounded-full border border-border/50">
            <button
              onClick={() => setActiveTab('employers')}
              className={`px-8 py-3 rounded-full font-medium text-sm transition-all duration-300 ${
                activeTab === 'employers'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              For Employers
            </button>
            <button
              onClick={() => setActiveTab('candidates')}
              className={`px-8 py-3 rounded-full font-medium text-sm transition-all duration-300 ${
                activeTab === 'candidates'
                  ? 'bg-secondary text-secondary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              For Freelancers
            </button>
          </div>
        </div>

        {/* Steps Content */}
        <div className="relative">
          {/* Employers Flow */}
          <div className={`transition-all duration-500 ${
            activeTab === 'employers' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
          }`}>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {employerSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative group">
                    {/* Connection Arrow */}
                    {index < employerSteps.length - 1 && (
                      <div className="hidden md:flex absolute top-20 -right-4 z-10 w-8 h-8 bg-card items-center justify-center rounded-full border border-accent/30">
                        <ArrowRight className="w-4 h-4 text-primary" />
                      </div>
                    )}

                    <Card className="h-full border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 bg-card/60 backdrop-blur-sm group-hover:bg-card rounded-2xl">
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

                        <p className="text-muted-foreground mb-3 leading-relaxed text-sm">
                          {step.description}
                        </p>

                        <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3 border-l-4 border-primary/20">
                          {step.detail}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Employer CTA */}
            <div className="text-center">
              <button className="bg-primary text-primary-foreground px-10 py-4 rounded-full font-medium hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm tracking-wide">
                Start Hiring Today
              </button>
              <p className="text-xs text-muted-foreground mt-3">Free to post • Quick approval process</p>
            </div>
          </div>

          {/* Candidates Flow */}
          <div className={`transition-all duration-500 ${
            activeTab === 'candidates' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
          }`}>
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

                        <p className="text-muted-foreground mb-3 leading-relaxed text-sm">
                          {step.description}
                        </p>

                        <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3 border-l-4 border-secondary/20">
                          {step.detail}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Candidate CTA */}
            <div className="text-center">
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto">
                <button className="w-full sm:w-auto bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-medium hover:bg-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm tracking-wide">
                  Browse Jobs
                </button>
                <button className="w-full sm:w-auto border border-secondary/30 text-secondary px-8 py-4 rounded-full font-medium hover:bg-secondary/5 transition-all duration-300 text-sm tracking-wide">
                  View Plans
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Free to browse • Premium features available</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}