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
  Clock,
  DollarSign,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FakeGigPaymentProps {
  gigId: string;
  gigTitle: string;
  amount: number;
  currency?: string;
  description?: string;
  onSuccess: (paymentId: string, orderId: string, contactDetails?: any) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  gigContactDetails?: {
    email: string;
    phone: string;
    name: string;
    alternateContact?: string;
  };
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  processingTime: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: '💳',
    description: 'Visa, Mastercard, RuPay',
    processingTime: 'Instant'
  },
  {
    id: 'upi',
    name: 'UPI',
    icon: '📱',
    description: 'Google Pay, PhonePe, Paytm',
    processingTime: 'Instant'
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    icon: '🏦',
    description: 'All major banks',
    processingTime: '2-5 minutes'
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    icon: '👛',
    description: 'Paytm, Mobikwik, Freecharge',
    processingTime: 'Instant'
  }
];

export default function FakeGigPayment({
  gigId,
  gigTitle,
  amount,
  currency = 'INR',
  description,
  onSuccess,
  onError,
  disabled = false,
  gigContactDetails
}: FakeGigPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'processing' | 'success' | 'error'>('method');
  const [contactDetails, setContactDetails] = useState({
    bidderContact: {
      email: '',
      phone: '',
      name: ''
    },
    posterContact: gigContactDetails || {
      email: '',
      phone: '',
      name: '',
      alternateContact: ''
    }
  });
  const [showContactForm, setShowContactForm] = useState(false);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const generateFakePaymentId = () => {
    return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateFakeOrderId = () => {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const simulatePaymentProcessing = async (method: string) => {
    setProcessing(true);
    setPaymentStep('processing');

    // Simulate different processing times based on method
    const processingTimes = {
      card: 2000,
      upi: 1500,
      netbanking: 4000,
      wallet: 1000
    };

    const delay = processingTimes[method as keyof typeof processingTimes] || 2000;

    try {
      await new Promise(resolve => setTimeout(resolve, delay));

      // Simulate success for demo; adjust failure rate as needed
      const success = true;
      
      if (success) {
        const paymentId = generateFakePaymentId();
        const orderId = generateFakeOrderId();
        
        setPaymentStep('success');
        toast.success('Payment completed successfully!');
        
        // Call success callback after a short delay
        setTimeout(() => {
          onSuccess(paymentId, orderId, contactDetails);
        }, 1000);
      } else {
        setPaymentStep('error');
        toast.error('Payment failed. Please try again.');
        onError('Payment failed due to insufficient funds or network issues');
      }
    } catch (error) {
      setPaymentStep('error');
      toast.error('Payment processing failed');
      onError('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    // Validate contact details
    if (!contactDetails.bidderContact.name || !contactDetails.bidderContact.email || !contactDetails.bidderContact.phone) {
      toast.error('Please fill in all contact details');
      return;
    }

    setLoading(true);
    await simulatePaymentProcessing(selectedMethod);
    setLoading(false);
  };

  const resetPayment = () => {
    setPaymentStep('method');
    setSelectedMethod('');
    setProcessing(false);
    setLoading(false);
  };

  if (paymentStep === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">Payment Successful!</h3>
          <p className="text-green-600 mb-4">
            Your payment of {formatAmount(amount)} has been processed successfully.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-green-700">
              <strong>Gig:</strong> {gigTitle}
            </p>
            <p className="text-sm text-green-700">
              <strong>Amount:</strong> {formatAmount(amount)}
            </p>
          </div>
          <Button onClick={resetPayment} variant="outline" className="w-full">
            Make Another Payment
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (paymentStep === 'error') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">Payment Failed</h3>
          <p className="text-red-600 mb-4">
            Your payment could not be processed. Please try again.
          </p>
          <Button onClick={resetPayment} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (paymentStep === 'processing') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-blue-800 mb-2">Processing Payment</h3>
          <p className="text-blue-600 mb-4">
            Please wait while we process your payment...
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>Method:</strong> {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Amount:</strong> {formatAmount(amount)}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Fake Payment Gateway</CardTitle>
        <p className="text-muted-foreground">
          Demo payment system for testing
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
              Demo Payment
            </Badge>
          </div>
        </div>

        {/* Gig Details */}
        <div className="bg-gray-50 border rounded-lg p-3">
          <h4 className="font-medium text-sm text-gray-700 mb-1">Gig Details</h4>
          <p className="text-sm text-gray-600 truncate">{gigTitle}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>

        {/* Contact Details Form */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-medium text-sm text-muted-foreground">Your Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Your Name *</label>
              <input
                type="text"
                value={contactDetails.bidderContact.name}
                onChange={(e) => setContactDetails(prev => ({
                  ...prev,
                  bidderContact: { ...prev.bidderContact, name: e.target.value }
                }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Your Email *</label>
              <input
                type="email"
                value={contactDetails.bidderContact.email}
                onChange={(e) => setContactDetails(prev => ({
                  ...prev,
                  bidderContact: { ...prev.bidderContact, email: e.target.value }
                }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="your.email@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Your Phone *</label>
              <input
                type="tel"
                value={contactDetails.bidderContact.phone}
                onChange={(e) => setContactDetails(prev => ({
                  ...prev,
                  bidderContact: { ...prev.bidderContact, phone: e.target.value }
                }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="+91 9876543210"
                required
              />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            These details will be shared with the gig poster after successful payment.
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground">Select Payment Method</h3>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  selectedMethod === method.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{method.icon}</span>
                  <span className="font-medium text-sm">{method.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{method.description}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{method.processingTime}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 mb-1">Demo Payment System</p>
              <p className="text-yellow-700">
                This is a fake payment gateway for testing purposes. No real money will be charged.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={disabled || loading || !selectedMethod}
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
              <DollarSign className="h-4 w-4 mr-2" />
              Pay {formatAmount(amount)}
            </>
          )}
        </Button>

        {/* Terms */}
        <p className="text-xs text-muted-foreground text-center">
          This is a demo payment system. No real transactions will occur.
        </p>
      </CardContent>
    </Card>
  );
}
