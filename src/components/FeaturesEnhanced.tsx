'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  User,
  Building2,
  CreditCard,
  List,
  Bell,
  Shield
} from 'lucide-react';
import { useState, useEffect } from 'react';

const features = [
  {
    icon: User,
    title: 'Candidate Dashboard',
    description: 'Manage your profile, subscription status, and job history in one place.',
    color: 'blue',
    features: ['Profile management', 'Subscription tracking', 'Job history', 'Application status']
  },
  {
    icon: Building2,
    title: 'Employer Dashboard',
    description: 'Post jobs, manage applicants, and feature your job listings easily.',
    color: 'teal',
    features: ['Job posting tools', 'Applicant management', 'Job featuring', 'Analytics dashboard']
  },
  {
    icon: CreditCard,
    title: 'Subscription System',
    description: 'Multiple plans with secure payments via Stripe, Razorpay, and PayPal.',
    color: 'purple',
    features: ['Multiple payment options', 'Secure transactions', 'Flexible plans', 'Auto-renewal']
  },
  {
    icon: List,
    title: 'Job Listings',
    description: 'Browse categorized jobs with advanced filters and smart search.',
    color: 'orange',
    features: ['Category filtering', 'Advanced search', 'Smart recommendations', 'Bookmark favorites']
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Get email updates and optional WhatsApp notifications for job alerts.',
    color: 'green',
    features: ['Email notifications', 'WhatsApp alerts', 'Push notifications', 'Custom preferences']
  },
  {
    icon: Shield,
    title: 'Secure Platform',
    description: 'Your data is protected with enterprise-grade security measures.',
    color: 'red',
    features: ['SSL encryption', 'Data protection', 'Privacy controls', 'Secure authentication']
  }
];

const colorClasses = {
  blue: 'text-blue-600 bg-blue-100 group-hover:bg-blue-200',
  teal: 'text-teal-600 bg-teal-100 group-hover:bg-teal-200',
  purple: 'text-purple-600 bg-purple-100 group-hover:bg-purple-200',
  orange: 'text-orange-600 bg-orange-100 group-hover:bg-orange-200',
  green: 'text-green-600 bg-green-100 group-hover:bg-green-200',
  red: 'text-red-600 bg-red-100 group-hover:bg-red-200'
};

const gradientClasses = {
  blue: 'from-blue-500 to-blue-600',
  teal: 'from-teal-500 to-teal-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
  green: 'from-green-500 to-green-600',
  red: 'from-red-500 to-red-600'
};

export default function FeaturesEnhanced() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('features');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="py-16 md:py-24 bg-gradient-to-br from-background via-muted/20 to-muted/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-accent/5 to-primary/5 rounded-full blur-3xl translate-x-48 translate-y-48"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 bg-card/60 backdrop-blur-sm px-4 py-2 rounded-full border border-border/40 mb-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Key Features</span>
          </div>
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text text-transparent mb-6 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className={`text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            Everything you need to succeed in the micro-jobs marketplace
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isHovered = hoveredCard === index;

            return (
              <div
                key={index}
                className={`group transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer bg-card/80 backdrop-blur-sm h-full">
                  {/* Gradient border */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradientClasses[feature.color]}`}
                    style={{
                      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      maskComposite: 'xor',
                      padding: '2px'
                    }}
                  />

                  <CardContent className="p-8 relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-16 h-16 ${colorClasses[feature.color]} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 transform`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <span className="text-2xl font-black text-muted group-hover:text-muted/80 transition-colors">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-foreground/80 transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {feature.description}
                    </p>

                    {/* Feature details */}
                    <div className="space-y-2">
                      {feature.features.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground/80">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradientClasses[feature.color]}`} />
                          {detail}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
