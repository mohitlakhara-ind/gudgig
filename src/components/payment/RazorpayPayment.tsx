'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  amount: number;
  currency?: string;
  description: string;
  orderId: string;
  keyId?: string;
  prefillEmail?: string;
  prefillContact?: string;
  tempUserId?: string;
  onSuccess: (paymentId: string, signature: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  preparing?: boolean;
}

export default function RazorpayPayment({
  amount,
  currency = 'INR',
  description,
  orderId,
  keyId,
  prefillEmail,
  prefillContact,
  tempUserId,
  onSuccess,
  onError,
  disabled = false,
  preparing = false
}: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpay().then((loaded) => {
      setRazorpayLoaded(!!loaded);
    });
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast.error('Payment system is loading. Please try again.');
      return;
    }

    if (!window.Razorpay) {
      toast.error('Payment system not available. Please refresh the page.');
      return;
    }

    try {
      setLoading(true);
      // Normalize prefill values to match Razorpay's expectations
      const normalizedEmail = (prefillEmail || '').trim();
      const normalizedContact = (prefillContact || '').replace(/\D+/g, '').slice(-15);
      const inferredName = normalizedEmail ? normalizedEmail.split('@')[0] : '';

      const options = {
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'Gudgig',
        description: description,
        order_id: orderId,
        image: '/logo.png', // Add your logo path
        handler: function (response: any) {
          console.log('Payment successful:', response);
          onSuccess(response.razorpay_payment_id, response.razorpay_signature);
        },
        prefill: {
          name: inferredName,
          email: normalizedEmail,
          contact: normalizedContact,
        },
        // Ensure checkout shows editable email/contact fields so Razorpay collects them
        readonly: {
          email: false,
          contact: false,
        },
        remember_customer: true,
        notes: {
          order_id: orderId,
          platform: 'gudgig',
          tempUserId: tempUserId || '',
        },
        theme: {
          color: '#0966C2', // Your brand color
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        onError(response.error.description || 'Payment failed');
        setLoading(false);
      });

      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      onError('Payment initialization failed');
      setLoading(false);
    }
  };

  if (!razorpayLoaded) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex w-full items-center justify-center rounded-md bg-muted px-4 py-2 text-sm text-muted-foreground"
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading secure payment…
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handlePayment}
        disabled={disabled || loading || preparing || !orderId}
        className="w-full"
        size="lg"
      >
        {loading || preparing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {preparing ? 'Preparing secure checkout…' : 'Processing...'}
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay securely
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        By proceeding, you agree to our{' '}
        <a href="/terms" className="text-primary hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </a>
      </p>
    </div>
  );
}


