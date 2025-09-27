"use client";
import { useRouter } from 'next/navigation';

export default function CheckoutCancelPage() {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-center">
      <h1 className="text-3xl font-semibold mb-4">Checkout cancelled</h1>
      <p className="text-gray-700 mb-6">No worries—your card wasn’t charged. You can retry the checkout or continue with the free plan.</p>
      <div className="flex justify-center gap-3">
        <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={() => router.push('/checkout')}>Retry checkout</button>
        <button className="px-4 py-2 rounded border" onClick={() => router.push('/checkout')}>Back to checkout</button>
        <button className="px-4 py-2 rounded border" onClick={() => router.push('/dashboard')}>Go to dashboard</button>
      </div>
      <div className="mt-6 text-sm text-gray-500">
        Need help? <a className="underline" href="mailto:support@example.com">Contact support</a>
      </div>
    </div>
  );
}


