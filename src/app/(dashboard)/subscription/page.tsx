"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  Check,
  X,
  Calendar,
  CreditCard,
  Download,
  Settings,
  AlertTriangle,
  Star,
  Zap,
  Shield,
  Headphones
} from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import UsageMeter from '@/components/subscription/UsageMeter';
import UpgradeModal from '@/components/subscription/UpgradeModal';
import { useEffect, useMemo, useState } from 'react';
import useSubscription from '@/hooks/useSubscription';
import { apiClient } from '@/lib/api';
import { useCheckout } from '@/hooks/useCheckout';

// Moved to parent layout or removed since client components cannot export metadata

export default function SubscriptionPage() {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { subscription, usage, loading, error, refresh, fetchUsage, cancelAtPeriodEnd, resumeAutoRenew, openCustomerPortal } = useSubscription();
  const [plans, setPlans] = useState<any | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const { createCheckoutSession, loading: checkoutLoading } = useCheckout();

  useEffect(() => {
    (async () => {
      const res = await apiClient.getSubscriptionPlans();
      setPlans(res.data);
    })();
  }, []);

  const currentPlan = useMemo(() => {
    if (!subscription || !plans) return null;
    const def = plans[subscription.plan];
    return {
      name: def?.name || subscription.plan,
      priceCents: def?.pricing?.[subscription.billingCycle || 'monthly']?.amount ?? 0,
      period: (subscription.billingCycle || 'monthly').replace('ly',''),
      status: subscription.status,
      nextBilling: subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : '—',
      features: Object.entries(def?.features || {}).map(([k, v]) => `${k}: ${v === true ? 'Yes' : v === false ? 'No' : (v ?? '—')}`)
    };
  }, [subscription, plans]);

  const usageStats = useMemo(() => {
    return {
      jobViews: usage?.usage?.jobViewsToday ?? 0,
      jobViewsLimit: usage?.limits?.jobViewsPerDay ?? 'unlimited',
      applications: usage?.usage?.applicationsToday ?? 0,
      applicationsLimit: usage?.limits?.applicationsPerDay ?? 'unlimited',
      profileViews: 0,
      profileViewsLimit: 'unlimited'
    };
  }, [usage]);

  const availablePlans = useMemo(() => {
    if (!plans) return [] as Array<{ name: string; price: string; period: string; features: string[]; current?: boolean; id: string }>
    return Object.entries(plans).map(([id, def]: any) => {
      const priceCents = def?.pricing?.[billingCycle]?.amount ?? 0;
      const current = subscription?.plan === id;
      return {
        id,
        name: def?.name || id,
        price: (priceCents / 100).toFixed(2),
        period: billingCycle.replace('ly',''),
        features: Object.entries(def?.features || {}).map(([k, v]) => `${k}: ${v === true ? 'Yes' : v === false ? 'No' : (v ?? '—')}`),
        current
      }
    });
  }, [plans, subscription, billingCycle]);

  const billingHistory: Array<{ id: string; description: string; date: string; invoice: string; amount: string; status: string }> = [];

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-600">
            Manage your subscription, view billing history, and upgrade your plan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Current Plan & Usage */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Crown className="h-5 w-5 mr-2 text-yellow-600" />
                    Current Plan
                  </CardTitle>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">{currentPlan?.name || '—'}</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {currentPlan ? `$${(currentPlan.priceCents/100).toFixed(2)}` : '—'}
                    <span className="text-sm text-gray-500 font-normal">/{currentPlan?.period || '—'}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Next billing date</span>
                    <span className="font-medium">{currentPlan?.nextBilling || '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Payment method</span>
                    <span className="font-medium">•••• 4242</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Plan Features</h4>
                  <div className="space-y-2">
                    {(currentPlan?.features || []).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>This month's activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <UsageMeter />
                <div className="flex justify-between">
                  <span className="text-gray-600">Job Views</span>
                  <span className="font-medium">
                    {usageStats.jobViews}
                    {usageStats.jobViewsLimit !== "unlimited" && ` / ${usageStats.jobViewsLimit}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Applications</span>
                  <span className="font-medium">
                    {usageStats.applications}
                    {usageStats.applicationsLimit !== "unlimited" && ` / ${usageStats.applicationsLimit}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Profile Views</span>
                  <span className="font-medium">
                    {usageStats.profileViews}
                    {usageStats.profileViewsLimit !== "unlimited" && ` / ${usageStats.profileViewsLimit}`}
                  </span>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monthly limit</span>
                    <Badge variant="secondary">85% used</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-transparent" variant="outline" onClick={async () => {
                  const portal = await openCustomerPortal();
                  if ((portal as any)?.url) window.location.href = (portal as any).url;
                }}>
                  <Settings className="h-4 w-4 mr-2" />
                  Update Payment Method
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoices
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Billing History
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Available Plans */}
            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>
                  Upgrade or downgrade your plan anytime
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-end gap-2 mb-4">
                  <span className="text-sm text-gray-600">Billing cycle</span>
                  <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {availablePlans.map((plan) => (
                    <div
                      key={plan.name}
                      className={`border rounded-lg p-4 ${
                        plan.current ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="text-center mb-4">
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        <p className="text-2xl font-bold">
                          ${plan.price}
                          <span className="text-sm text-gray-500 font-normal">/{plan.period}</span>
                        </p>
                        {plan.current && (
                          <Badge className="mt-2 bg-blue-500">Current Plan</Badge>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="text-center">
                        {plan.current ? (
                          <Button variant="outline" className="w-full bg-transparent" disabled>
                            Current Plan
                          </Button>
                        ) : plan.name === "Free" ? (
                          <Button variant="outline" className="w-full bg-transparent">
                            Downgrade
                          </Button>
                        ) : (
                          <Button className="w-full" disabled={checkoutLoading} onClick={() => createCheckoutSession(plan.id === 'enterprise' ? 'enterprise' : 'pro', { billingCycle, allowTrial: true, returnTo: `${window.location.origin}/checkout/success?redirect=/jobs` })}>
                            {checkoutLoading ? 'Loading...' : 'Choose'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Billing History */}
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>
                  View and download your past invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {billingHistory.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{bill.description}</h4>
                          <p className="text-sm text-gray-600">
                            {bill.date} • Invoice {bill.invoice}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold">${bill.amount}</p>
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            {bill.status}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-6">
                  <Button variant="outline" className="bg-transparent">
                    View All Invoices
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your subscription preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive updates about your subscription</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Auto-renewal</h4>
                    <p className="text-sm text-gray-600">Automatically renew subscription</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {subscription?.cancelAtPeriodEnd ? (
                      <Button size="sm" onClick={() => resumeAutoRenew()}>Resume auto-renew</Button>
                    ) : (
                      <Button size="sm" variant="destructive" onClick={() => cancelAtPeriodEnd()}>Cancel at period end</Button>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-red-600">Cancel Subscription</h4>
                      <p className="text-sm text-gray-600">Cancel your subscription anytime</p>
                    </div>
                  <Button variant="outline" size="sm" className="bg-transparent" onClick={async () => {
                    const portal = await openCustomerPortal();
                    if (portal?.url) window.location.href = (portal as any).url;
                  }}>Open Customer Portal</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  Get support for your subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Headphones className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-semibold">Customer Support</h4>
                      <p className="text-sm text-gray-600">Get help with your subscription</p>
                      <Button variant="link" className="p-0 h-auto text-blue-600">
                        Contact Support
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Shield className="h-8 w-8 text-green-600" />
                    <div>
                      <h4 className="font-semibold">Billing Questions</h4>
                      <p className="text-sm text-gray-600">Questions about payments</p>
                      <Button variant="link" className="p-0 h-auto text-blue-600">
                        View FAQ
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}
