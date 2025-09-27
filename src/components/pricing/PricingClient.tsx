'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useCheckout } from '@/hooks/useCheckout';

export default function PricingClient() {
  const [plansConfig, setPlansConfig] = useState<any | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const { createCheckoutSession, loading: checkoutLoading } = useCheckout();

  const staticPlans = [
    {
      name: "Free",
      description: "Perfect for job seekers getting started",
      price: "$0",
      period: "forever",
      icon: <Star className="h-6 w-6" />,
      features: [
        "Browse up to 10 jobs per day",
        "Basic job search filters",
        "Apply to 3 jobs per day",
        "Basic profile creation",
        "Email job alerts (limited)",
        "Mobile app access"
      ],
      limitations: [
        "Limited job views",
        "Basic search only",
        "No priority support",
        "No resume optimization"
      ],
      popular: false,
      buttonText: "Get Started Free",
      buttonVariant: "outline" as const
    },
    {
      name: "Pro",
      description: "For serious job seekers",
      price: "$9.99",
      period: "per month",
      icon: <Zap className="h-6 w-6" />,
      features: [
        "Unlimited job browsing",
        "Advanced search filters",
        "Apply to unlimited jobs",
        "Premium profile features",
        "Priority email alerts",
        "Resume optimization tools",
        "Interview preparation guides",
        "1-on-1 career coaching session",
        "Priority customer support",
        "Mobile app access"
      ],
      limitations: [],
      popular: true,
      buttonText: "Start Pro Trial",
      buttonVariant: "default" as const
    },
    {
      name: "Enterprise",
      description: "For employers and recruiters",
      price: "$29.99",
      period: "per month",
      icon: <Crown className="h-6 w-6" />,
      features: [
        "Post unlimited job listings",
        "Access to candidate database",
        "Advanced candidate filtering",
        "Bulk messaging tools",
        "Analytics and reporting",
        "Custom company branding",
        "Priority placement in search",
        "Dedicated account manager",
        "API access",
        "Custom integrations",
        "Team collaboration tools",
        "Advanced hiring workflows"
      ],
      limitations: [],
      popular: false,
      buttonText: "Contact Sales",
      buttonVariant: "default" as const
    }
  ];

  const faqs = [
    {
      question: "Can I change my plan anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated."
    },
    {
      question: "Is there a free trial for Pro?",
      answer: "Yes, we offer a 14-day free trial for the Pro plan. No credit card required to start your trial."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact us for a full refund."
    }
  ];

  const dynamicPlans = useMemo(() => {
    if (!plansConfig) return null;
    return Object.entries(plansConfig).map(([id, def]: any) => ({
      id,
      name: def.name,
      description: def.description,
      price: def.pricing?.[billingCycle]?.amount ? `$${(def.pricing[billingCycle].amount/100).toFixed(2)}` : '$0',
      period: billingCycle.replace('ly',''),
      icon: id === 'enterprise' ? <Crown className="h-6 w-6" /> : id === 'pro' ? <Zap className="h-6 w-6" /> : <Star className="h-6 w-6" />,
      features: Object.entries(def.features || {}).map(([k, v]) => `${k}: ${v === true ? 'Yes' : v === false ? 'No' : (v ?? '—')}`),
      limitations: [],
      popular: id === 'pro',
      buttonText: id === 'free' ? 'Get Started Free' : 'Choose Plan',
      buttonVariant: id === 'free' ? 'outline' as const : 'default' as const
    }));
  }, [plansConfig, billingCycle]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.getSubscriptionPlans();
        setPlansConfig(res.data);
      } catch {}
    })();
  }, []);

  const plans = dynamicPlans || staticPlans;

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Perfect Plan</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Whether you're looking for your dream job or hiring top talent, we have the right plan for you.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <span className="text-sm text-gray-600">Billing cycle</span>
        <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-4 py-1">Most Popular</Badge>
              </div>
            )}

            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full ${plan.popular ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>{plan.icon}</div>
              </div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="text-base">{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-500 ml-2">/{plan.period}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {plan.limitations.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Limitations</h4>
                  <div className="space-y-2">
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-gray-300 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-500 text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {plan.name === 'Free' ? (
                <Link href="/register" className="w-full">
                  <Button className="w-full" variant={plan.buttonVariant} size="lg">{plan.buttonText}</Button>
                </Link>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  disabled={checkoutLoading}
                  onClick={() =>
                    createCheckoutSession(
                      plan.name.toLowerCase() as any,
                      { billingCycle, allowTrial: true, returnTo: `${window.location.origin}/checkout/success?redirect=/jobs` }
                    )
                  }
                >
                  {checkoutLoading ? 'Loading...' : plan.buttonText}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Compare All Features</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-6 font-semibold">Features</th>
                    <th className="text-center p-6 font-semibold">Free</th>
                    <th className="text-center p-6 font-semibold">Pro</th>
                    <th className="text-center p-6 font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Job browsing", free: "10/day", pro: "Unlimited", enterprise: "Unlimited" },
                    { feature: "Job applications", free: "3/day", pro: "Unlimited", enterprise: "Unlimited" },
                    { feature: "Advanced filters", free: false, pro: true, enterprise: true },
                    { feature: "Resume optimization", free: false, pro: true, enterprise: true },
                    { feature: "Career coaching", free: false, pro: "1 session", enterprise: "Unlimited" },
                    { feature: "Priority support", free: false, pro: true, enterprise: true },
                    { feature: "Post job listings", free: false, pro: false, enterprise: true },
                    { feature: "Candidate database", free: false, pro: false, enterprise: true },
                    { feature: "Analytics", free: false, pro: false, enterprise: true },
                    { feature: "API access", free: false, pro: false, enterprise: true }
                  ].map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-6 font-medium">{row.feature}</td>
                      <td className="p-6 text-center">
                        {typeof row.free === 'boolean' ? (
                          row.free ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>
                        ) : (
                          <span className="text-sm">{row.free}</span>
                        )}
                      </td>
                      <td className="p-6 text-center">
                        {typeof row.pro === 'boolean' ? (
                          row.pro ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>
                        ) : (
                          <span className="text-sm">{row.pro}</span>
                        )}
                      </td>
                      <td className="p-6 text-center">
                        {typeof row.enterprise === 'boolean' ? (
                          row.enterprise ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>
                        ) : (
                          <span className="text-sm">{row.enterprise}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl mb-6 opacity-90">Join thousands of successful job seekers and employers who trust our platform.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/checkout">
            <Button size="lg" variant="secondary">Start Free Trial</Button>
          </Link>
          <Link href="/checkout">
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent">Contact Sales</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}


