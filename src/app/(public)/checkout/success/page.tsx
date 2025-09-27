"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSubscription from '@/hooks/useSubscription';
import { useCheckout } from '@/hooks/useCheckout';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh, fetchUsage } = useSubscription();
  const { handleCheckoutSuccess } = useCheckout();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const destination = useMemo(() => searchParams.get('redirect') || '/jobs', [searchParams]);

  useEffect(() => {
    (async () => {
      try {
        await refresh();
        await fetchUsage();
        await handleCheckoutSuccess(destination);
      } catch (e: any) {
        setError(e?.message || 'Subscription may still be processing...');
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh, fetchUsage, handleCheckoutSuccess, destination]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-center">
      <h1 className="text-3xl font-semibold mb-4">Subscription activated</h1>
      {loading ? (
        <p className="text-gray-600">Finalizing your subscription...</p>
      ) : error ? (
        <p className="text-amber-700">{error}</p>
      ) : (
        <p className="text-gray-700 mb-6">You now have full access. Enjoy browsing and applying to jobs.</p>
      )}
      <div className="flex justify-center gap-3 mt-6">
        <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={() => router.push('/jobs')}>Start browsing jobs</button>
        <button className="px-4 py-2 rounded border" onClick={() => router.push('/subscription')}>Manage subscription</button>
      </div>
    </div>
  );
}


