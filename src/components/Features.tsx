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

type ColorType = 'blue' | 'teal' | 'purple' | 'orange' | 'green' | 'red';

type FeatureType = {
  icon: typeof User;
  title: string;
  description: string;
  color: ColorType;
};

const features: FeatureType[] = [
  {
    icon: User,
    title: 'Candidate Dashboard',
    description: 'Manage your profile, subscription status, and microjob history in one place.',
    color: 'blue'
  },
  {
    icon: Building2,
    title: 'Employer Dashboard',
    description: 'Post microjobs, manage bids, and feature your listings easily.',
    color: 'teal'
  },
  {
    icon: CreditCard,
    title: 'Subscription System',
    description: 'Multiple plans with secure payments via Stripe, Razorpay, and PayPal.',
    color: 'purple'
  },
  {
    icon: List,
    title: 'MicroJob Listings',
    description: 'Browse categorized microjobs with advanced filters and smart search.',
    color: 'orange'
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Get email updates and optional WhatsApp notifications for microjob alerts.',
    color: 'green'
  },
  {
    icon: Shield,
    title: 'Secure Platform',
    description: 'Your data is protected with enterprise-grade security measures.',
    color: 'red'
  }
];

const colorClasses: Record<string, string> = {
  blue: 'text-primary bg-primary/10 group-hover:bg-primary/20',
  teal: 'text-secondary bg-secondary/10 group-hover:bg-secondary/20',
  purple: 'text-accent bg-accent/10 group-hover:bg-accent/20',
  orange: 'text-warning bg-warning/10 group-hover:bg-warning/20',
  green: 'text-success bg-success/10 group-hover:bg-success/20',
  red: 'text-destructive bg-destructive/10 group-hover:bg-destructive/20'
};

export default function Features() {
  return (
    <section id="features" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Key Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to succeed in the micro-jobs marketplace
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-0">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${colorClasses[feature.color]} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 transform`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
