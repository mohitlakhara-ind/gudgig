'use client';

import { useState } from 'react';
import RazorpayPayment from './RazorpayPayment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Loader2, ArrowRight } from 'lucide-react';

type Props = {
  gigId: string;
  amountInPaise: number;
  description: string;
};

export default function GuestCheckout({ gigId, amountInPaise, description }: Props) {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [keyId, setKeyId] = useState<string | undefined>(undefined);
  const [tempUserId] = useState<string>(() => crypto.randomUUID());
  const { setSession } = useAuth();
  const [gatewayEnabled, setGatewayEnabled] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const createOrder = async () => {
    try {
      setCreatingOrder(true);
      const base = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
      const resp = await fetch(`${base}/api/payment/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          gigId,
          description,
          tempUserId,
        }),
      });
      const data = await resp.json();
      if (!data?.success) {
        if ((data?.message || '').toLowerCase().includes('razorpay is not enabled')) {
          setGatewayEnabled(false);
        }
        throw new Error(data?.message || 'Order create failed');
      }
      setOrderId(data.order.id);
      setKeyId(data.keyId);
      return data;
    } catch (e: any) {
      const msg = e?.message || 'Failed to create order';
      if (msg.toLowerCase().includes('razorpay is not enabled')) {
        toast.error('Payments are disabled on the server right now. Please try again later.');
      } else {
        toast.error(msg);
      }
      return null;
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleVerify = async (paymentId: string, signature: string) => {
    try {
      if (!orderId) return;
      const base = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
      const resp = await fetch(`${base}/api/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          payment_id: paymentId,
          signature,
        }),
      });
      const data = await resp.json();
      if (!data?.success) throw new Error(data?.message || 'Verification failed');
      if (data.token && data.refreshToken && data.user) {
        setSession(data.token, data.refreshToken, data.user);
        try { localStorage.setItem('token', data.token); localStorage.setItem('refreshToken', data.refreshToken); } catch {}
        toast.success("Payment successful. Access unlocked!");
        // Reload current page to reflect authenticated state and show access
        window.location.reload();
      } else {
        toast.success('Payment verified. Please refresh to continue.');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Payment verification failed');
    }
  };

  const startCheckout = async () => {
    // Let Razorpay collect email/contact if left blank
    const res = await createOrder();
    if (!res) {
      return;
    }
  };

  return (
    <div className="w-full">
      {!orderId ? (
        <div className="space-y-3">
          {/* Optional prefill; Razorpay form will collect if left empty */}
          <div className="space-y-2">
            <Label htmlFor="checkoutEmail">Email (optional)</Label>
            <Input id="checkoutEmail" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkoutPhone">Phone (optional)</Label>
            <Input id="checkoutPhone" type="tel" placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button onClick={startCheckout} disabled={creatingOrder || !gatewayEnabled} className="w-full h-11 font-medium bg-gradient-to-r from-primary to-primary/90 text-white shadow-md hover:shadow-lg hover:from-primary/90 hover:to-primary active:scale-[0.99] transition-all">
            {creatingOrder ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Preparing...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Unlock more details
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      ) : (
        <RazorpayPayment
          amount={amountInPaise}
          description={description}
          orderId={orderId}
          keyId={keyId}
          prefillEmail={email}
          prefillContact={phone}
          tempUserId={tempUserId}
          onSuccess={handleVerify}
          onError={(msg) => toast.error(msg)}
        />
      )}
      {!gatewayEnabled && !orderId && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Payments are currently unavailable. Please try again later.
        </p>
      )}
    </div>
  );
}


