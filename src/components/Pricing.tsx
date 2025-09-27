'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { useCheckout } from '@/hooks/useCheckout';

const plans = [
  {
    name: 'Monthly',
    price: '$9.99',
    period: '/month',
    description: 'Perfect for trying out the platform',
    features: [
      'Access to basic job details',
      'Apply to 10 jobs per month',
      'Email notifications',
      'Basic support'
    ],
    popular: false
  },
  {
    name: 'Quarterly',
    price: '$24.99',
    period: '/3 months',
    description: 'Most popular choice for active users',
    features: [
      'Access to full job details',
      'Apply to unlimited jobs',
      'Priority support',
      'WhatsApp notifications',
      'Advanced filters',
      'Job alerts'
    ],
    popular: true
  },
  {
    name: 'Yearly',
    price: '$79.99',
    period: '/year',
    description: 'Best value for serious job seekers',
    features: [
      'All Quarterly features',
      '2 months free',
      'Priority application review',
      'Exclusive job opportunities',
      'Career coaching session'
    ],
    popular: false
  }
];

export default function Pricing() {
  const { checkout, loading, error } = useCheckout();
  const planIdMap = { Monthly: 'monthly', Quarterly: 'quarterly', Yearly: 'yearly' } as const;

  return (
    <section id="pricing" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you&apos;re ready. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${plan.popular ? 'ring-2 ring-accent shadow-xl' : 'shadow-lg'} hover:shadow-xl transition-all duration-300`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent">
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center pb-8">
                <h3 className="text-2xl font-bold text-card-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-card-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-success mr-3 flex-shrink-0" />
                      <span className="text-card-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => checkout(planIdMap[plan.name as keyof typeof planIdMap])}
                  disabled={loading}
                  className={`w-full ${plan.popular ? 'bg-secondary hover:bg-secondary/90' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {loading ? 'Processing…' : 'Subscribe Now'}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Cancel anytime • Secure payments
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {error && (
          <div className="text-center mt-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive max-w-md mx-auto">
            {error}
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Secure payments via{' '}
            <span className="font-semibold text-primary">Stripe</span>,{' '}
            <span className="font-semibold text-success">Razorpay</span>,{' '}
            <span className="font-semibold text-secondary">PayPal</span>
          </p>
        </div>
      </div>
    </section>
  );
}
