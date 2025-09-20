'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Search, CreditCard, Eye, CheckCircle, Users, ArrowRight, Sparkles, Shield, Zap, Heart, Building2, User, List, Briefcase, EyeIcon, UserCheck, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: Upload,
    title: 'Employers Post Jobs',
    description: 'Create detailed micro job listings with requirements, budget, and timeline. Get admin approval for quality assurance.',
    color: 'blue',
    userType: 'employer',
    gradient: 'from-blue-500 to-blue-600',
    features: ['Detailed job descriptions', 'Budget and timeline setting', 'Admin quality approval', 'Category-based organization']
  },
  {
    icon: Search,
    title: 'Candidates Discover Jobs',
    description: 'Browse job categories and see basic information including title, location, and job type completely free.',
    color: 'green',
    userType: 'candidate',
    gradient: 'from-emerald-500 to-green-600',
    features: ['Free job browsing', 'Category filtering', 'Basic job information', 'Location-based search']
  },
  {
    icon: CreditCard,
    title: 'Subscribe to Unlock',
    description: 'Choose from flexible subscription plans (monthly, quarterly, yearly) to access full job details and application features.',
    color: 'orange',
    userType: 'candidate',
    gradient: 'from-orange-500 to-amber-600',
    features: ['Monthly, quarterly, yearly plans', 'Instant access to full details', 'Application features', 'Priority support']
  },
  {
    icon: Eye,
    title: 'View Full Details',
    description: 'Subscribers unlock complete job descriptions, requirements, contact information, and can track application status.',
    color: 'teal',
    userType: 'candidate',
    gradient: 'from-teal-500 to-cyan-600',
    features: ['Complete job descriptions', 'Requirements and skills', 'Contact information', 'Application status tracking']
  },
  {
    icon: CheckCircle,
    title: 'Apply & Connect',
    description: 'Submit applications directly to employers with your profile. Receive notifications and manage all applications in your dashboard.',
    color: 'purple',
    userType: 'candidate',
    gradient: 'from-purple-500 to-indigo-600',
    features: ['Direct application submission', 'Profile-based applications', 'Real-time notifications', 'Application dashboard']
  },
  {
    icon: Users,
    title: 'Employers Manage',
    description: 'Review applications, communicate with candidates, and track hiring progress through a comprehensive dashboard.',
    color: 'indigo',
    userType: 'employer',
    gradient: 'from-indigo-500 to-purple-600',
    features: ['Application review tools', 'Direct candidate communication', 'Hiring progress tracking', 'Analytics and insights']
  }
];

const keyFeatures = [
  {
    icon: Shield,
    title: 'Quality Control',
    description: 'Admin-approved jobs ensure high-quality opportunities',
    color: 'primary',
    features: ['Verified job postings', 'Quality assurance checks', 'Spam protection', 'Content moderation']
  },
  {
    icon: Zap,
    title: 'Flexible Plans',
    description: 'Monthly, quarterly, and yearly subscription options',
    color: 'secondary',
    features: ['Pay-as-you-go', 'Bulk discounts', 'Team plans', 'Custom enterprise options']
  },
  {
    icon: Heart,
    title: 'Direct Connection',
    description: 'Connect directly with employers and candidates',
    color: 'accent',
    features: ['Instant messaging', 'Video interviews', 'Direct contact', 'No intermediaries']
  },
  {
    icon: Sparkles,
    title: 'Smart Preview',
    description: 'See job basics for free, unlock details with subscription',
    color: 'muted',
    features: ['Preview mode', 'Basic information free', 'Premium details locked', 'Subscription benefits']
  }
];

export default function HowItWorksImproved() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'employer' | 'candidate'>('all');
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const filteredSteps = steps.filter(step =>
    activeFilter === 'all' || step.userType === activeFilter
  );

  const getThemeColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      primary: 'from-primary to-primary/80',
      secondary: 'from-secondary to-secondary/80',
      accent: 'from-accent to-accent/80',
      muted: 'from-muted to-muted/80',
      blue: 'from-blue-500 to-blue-600',
      green: 'from-emerald-500 to-green-600',
      orange: 'from-orange-500 to-amber-600',
      teal: 'from-teal-500 to-cyan-600',
      purple: 'from-purple-500 to-indigo-600',
      indigo: 'from-indigo-500 to-purple-600'
    };
    return colorMap[color] || colorMap.primary;
  };

  // Add intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('how-it-works');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-gradient-to-br from-background via-muted/30 to-muted/50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl translate-x-48 translate-y-48"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-card/60 backdrop-blur-sm px-4 py-2 rounded-full border border-border/40 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">How it works</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text text-transparent mb-6 leading-tight">
            Simple. Powerful.{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Effective.
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            A streamlined marketplace connecting employers with skilled professionals through our subscription-based model
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex bg-card/70 backdrop-blur-sm p-1.5 rounded-2xl border border-border/40 shadow-lg">
            {[
              { key: 'all', label: 'All Steps', icon: List },
              { key: 'employer', label: 'For Employers', icon: Building2 },
              { key: 'candidate', label: 'For Candidates', icon: User }
            ].map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key as any)}
                  className={cn(
                    "px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2",
                    activeFilter === filter.key
                      ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 mb-20">
          {filteredSteps.map((step, index) => {
            const Icon = step.icon;
            const isHovered = hoveredStep === index;
            const isExpanded = expandedStep === index;

            return (
              <div key={index} className="group">
                <Card
                  className={cn(
                    "relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer",
                    isHovered ? 'scale-105' : '',
                    "bg-card/80 backdrop-blur-sm"
                  )}
                  onMouseEnter={() => setHoveredStep(index)}
                  onMouseLeave={() => setHoveredStep(null)}
                  onClick={() => setExpandedStep(isExpanded ? null : index)}
                >
                  {/* Gradient border */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      getThemeColorClasses(step.color)
                    )}
                    style={{
                      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      maskComposite: 'xor',
                      padding: '2px'
                    }}
                  />

                  <CardContent className="p-8 relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <span className={cn(
                        "px-4 py-2 rounded-full text-sm font-semibold shadow-sm border flex items-center gap-2",
                        step.userType === 'employer'
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'bg-secondary/10 text-secondary border-secondary/20'
                      )}>
                        {step.userType === 'employer' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        {step.userType === 'employer' ? 'Employers' : 'Candidates'}
                      </span>
                      <span className="text-3xl font-black text-muted group-hover:text-muted/80 transition-colors">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div className={cn(
                      "w-20 h-20 bg-gradient-to-br rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 transform",
                      getThemeColorClasses(step.color)
                    )}>
                      <Icon className="h-10 w-10 text-primary-foreground" />
                    </div>

                    <h3 className="text-2xl font-bold text-foreground mb-6 group-hover:text-foreground/80 transition-colors">
                      {step.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed text-lg mb-4">
                      {step.description}
                    </p>

                    {/* Expandable features */}
                    {step.features && (
                      <div className="mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedStep(isExpanded ? null : index);
                          }}
                          className="p-0 h-auto text-primary hover:text-primary/80"
                        >
                          {isExpanded ? 'Show Less' : 'Show Features'}
                        </Button>

                        {isExpanded && (
                          <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-300">
                            {step.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  step.userType === 'employer' ? 'bg-primary' : 'bg-secondary'
                                )} />
                                {feature}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Arrow for connection */}
                    {index < filteredSteps.length - 1 && (
                      <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 hidden lg:block">
                        <ArrowRight className="w-8 h-8 text-muted group-hover:text-muted/80 transition-colors" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Key Features Section - Merged Benefits */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-card/60 to-card/40 backdrop-blur-sm rounded-3xl"></div>
          <div className="relative bg-card/60 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-16 border border-border/40">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Key Features & Benefits
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need for successful hiring and job searching in one comprehensive platform
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {keyFeatures.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div key={index} className="text-center group">
                    <div className={cn(
                      "w-16 h-16 bg-gradient-to-br rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transform transition-all duration-300",
                      getThemeColorClasses(feature.color)
                    )}>
                      <Icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h4 className="font-bold text-xl text-foreground mb-3 group-hover:text-foreground/80 transition-colors">
                      {feature.title}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {feature.description}
                    </p>

                    {/* Feature details */}
                    <div className="space-y-1">
                      {feature.features.map((detail, idx) => (
                        <div key={idx} className="flex items-center justify-center gap-2 text-xs text-muted-foreground/80">
                          <div className={cn(
                            "w-1 h-1 rounded-full",
                            feature.color === 'primary' ? 'bg-primary' :
                            feature.color === 'secondary' ? 'bg-secondary' :
                            feature.color === 'accent' ? 'bg-accent' : 'bg-muted'
                          )} />
                          {detail}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Call to Action */}
        <div className="text-center mt-20">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="group relative bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Post a Job (Employers)
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            <Button
              size="lg"
              className="group relative bg-gradient-to-r from-secondary to-accent text-secondary-foreground hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <span className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Find Jobs (Candidates)
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>
          <p className="text-muted-foreground mt-6 text-lg">
            Join thousands of professionals already using our platform
          </p>
        </div>
      </div>
    </section>
  );
}
