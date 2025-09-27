"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSubscription from '@/hooks/useSubscription';
import { apiClient } from '@/lib/api';

type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

export default function CheckoutPage() {
  const router = useRouter();
  const { createCheckout } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.getSubscriptionPlans();
        setPlans(res.data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load plans');
      }
    })();
  }, []);

  const planList = useMemo(() => {
    if (!plans) return [];
    return Object.entries(plans).map(([id, def]: any) => ({ id, ...def }));
  }, [plans]);

  const handleSelect = async (planId: string) => {
    try {
      setLoading(true);
      setError(null);
      const successUrl = `${window.location.origin}/checkout/success`;
      const cancelUrl = `${window.location.origin}/checkout/cancel`;
      const trialPeriodDays = plans?.[planId]?.trialDays ?? undefined;
      const result = await createCheckout({ planId, billingCycle, successUrl, cancelUrl, trialPeriodDays });
      if (result?.url) {
        window.location.href = result.url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (e: any) {
      setError(e?.message || 'Something went wrong starting checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">Choose your plan</h1>
      <div className="mb-6 flex gap-2">
        {(['monthly','quarterly','yearly'] as BillingCycle[]).map(cycle => (
          <button key={cycle} disabled={loading} onClick={() => setBillingCycle(cycle)} className={`px-3 py-1 rounded border ${billingCycle===cycle?'bg-black text-white':'bg-white'}`}>
            {cycle.charAt(0).toUpperCase()+cycle.slice(1)}
          </button>
        ))}
      </div>
      {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planList.map(plan => (
          <div key={plan.id} className="border rounded-lg p-6 flex flex-col">
            <div className="text-xl font-medium mb-1">{plan.name}</div>
            <div className="text-gray-600 mb-4">{plan.description}</div>
            <div className="text-3xl font-bold mb-2">
              {plan.pricing?.[billingCycle]?.amount === 0 ? 'Free' : `$${(plan.pricing?.[billingCycle]?.amount/100).toFixed(2)}`}
              <span className="text-base text-gray-500">/{billingCycle.replace('ly','')}</span>
            </div>
            {plan.trialDays > 0 && (
              <div className="text-sm text-green-700 mb-4">Includes {plan.trialDays}-day free trial</div>
            )}
            <ul className="text-sm flex-1 space-y-1 mb-6 list-disc pl-5">
              <li>Job views per day: {plan.features.jobViewsPerDay ?? 'Unlimited'}</li>
              <li>Applications per day: {plan.features.applicationsPerDay ?? 'Unlimited'}</li>
              <li>Full job details: {plan.features.fullJobDescription ? 'Yes' : 'No'}</li>
              <li>Premium filters: {plan.features.premiumFilters ? 'Yes' : 'No'}</li>
              <li>Priority support: {plan.features.prioritySupport ? 'Yes' : 'No'}</li>
            </ul>
            <button disabled={loading} onClick={() => handleSelect(plan.id)} className="mt-auto w-full py-2 rounded bg-indigo-600 text-white disabled:opacity-60">
              {plan.id === 'free' ? 'Continue with Free' : 'Continue to Checkout'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


