'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle,
  Shield,
  Clock
} from 'lucide-react';
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
  onSuccess: (paymentId: string, signature: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export default function RazorpayPayment({
  amount,
  currency = 'INR',
  description,
  orderId,
  onSuccess,
  onError,
  disabled = false
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

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

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'Gigs Mint',
        description: description,
        order_id: orderId,
        image: '/logo.png', // Add your logo path
        handler: function (response: any) {
          console.log('Payment successful:', response);
          onSuccess(response.razorpay_payment_id, response.razorpay_signature);
        },
        prefill: {
          name: '', // You can prefill user details
          email: '',
          contact: '',
        },
        notes: {
          order_id: orderId,
          platform: 'gigs-mint',
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
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading payment system...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <CreditCard className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Complete Payment</CardTitle>
        <p className="text-muted-foreground">
          Secure payment powered by Razorpay
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Payment Details */}
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <span className="font-medium">Amount to Pay</span>
            <span className="text-2xl font-bold text-primary">
              {formatAmount(amount)}
            </span>
          </div>
          
          <div className="text-center">
            <Badge variant="outline" className="text-sm">
              <Shield className="h-3 w-3 mr-1" />
              Secure Payment
            </Badge>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground">Accepted Payment Methods</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 border rounded text-sm">
              <CreditCard className="h-4 w-4" />
              <span>Cards</span>
            </div>
            <div className="flex items-center gap-2 p-2 border rounded text-sm">
              <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                <span className="text-green-600 font-bold text-xs">UPI</span>
              </div>
              <span>UPI</span>
            </div>
            <div className="flex items-center gap-2 p-2 border rounded text-sm">
              <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs">NB</span>
              </div>
              <span>Net Banking</span>
            </div>
            <div className="flex items-center gap-2 p-2 border rounded text-sm">
              <div className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center">
                <span className="text-orange-600 font-bold text-xs">W</span>
              </div>
              <span>Wallets</span>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-800 mb-1">Your payment is secure</p>
              <p className="text-green-700">
                We use industry-standard encryption to protect your payment information. 
                Your card details are never stored on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={disabled || loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay {formatAmount(amount)}
            </>
          )}
        </Button>

        {/* Terms */}
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
      </CardContent>
    </Card>
  );
}


