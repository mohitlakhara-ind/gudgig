'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  MessageCircle,
  DollarSign,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import FakeGigPayment from '@/components/payment/FakeGigPayment';
import type { Job } from '@/types/api';

export default function BidPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const gigId = params.id as string;
  
  const [gig, setGig] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bidData, setBidData] = useState({
    quotation: '',
    proposal: ''
  });
  const [bidFee] = useState<number>(5);
  const [showPayment, setShowPayment] = useState(false);
  const [hasExistingBid, setHasExistingBid] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to place bids');
      router.push('/auth/login');
      return;
    }

    const fetchGig = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getGig(gigId);
        setGig(response.data || null);
        
        // Check if user already has a bid for this gig
        try {
          const myBids = await apiClient.getMyBids();
          const userBids = (myBids?.data || []).filter((bid: { jobId?: string }) => bid.jobId === gigId);
          setHasExistingBid(userBids.length > 0);
        } catch (err) {
          setHasExistingBid(false);
        }
      } catch (err: unknown) {
        toast.error('Failed to load gig details');
        router.push('/gigs');
      } finally {
        setLoading(false);
      }
    };

    if (gigId) {
      fetchGig();
    }
  }, [gigId, user, router]);

  const handleInputChange = (field: string, value: string) => {
    setBidData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!bidData.quotation || !bidData.proposal) {
      toast.error('Please fill in all required fields');
      return false;
    }
    
    const quotation = parseFloat(bidData.quotation);
    if (isNaN(quotation) || quotation <= 0) {
      toast.error('Please enter a valid quotation amount');
      return false;
    }
    
    if (bidData.proposal.length < 50) {
      toast.error('Proposal must be at least 50 characters long');
      return false;
    }
    
    return true;
  };

  const handleStartPayment = () => {
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentId: string, orderId: string) => {
    try {
      console.log('Payment successful, proceeding with bid submission');
      toast.success('Payment completed successfully!');
      setShowPayment(false);
      
      // Submit bid after successful payment
      await handleSubmitBid();
    } catch (error) {
      console.error('Payment success handling failed:', error);
      toast.error('Payment completed but bid submission failed.');
    }
  };

  const handleSubmitBid = async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);

      const payload = {
        quotation: parseFloat(bidData.quotation),
        proposal: bidData.proposal,
        bidFeePaid: bidFee,
      };

      const res = await apiClient.createGigBid(gigId, payload);
      if (!res?.success) {
        throw new Error(res?.message || 'Bid submission failed');
      }

      toast.success('Bid submitted successfully!');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bid:created', { detail: { jobId: gigId } }));
      }
      
      // Small delay before redirect to show the success message
      setTimeout(() => {
        router.push(`/gigs/${gigId}`);
      }, 1000);
      
    } catch (error: any) {
      console.error('Bid submission failed:', error);
      toast.error(error?.message || 'Failed to submit bid');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hasExistingBid) {
      toast.error('You have already placed a bid for this gig');
      return;
    }
    
    if (validateForm()) {
      handleStartPayment();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading gig details...</p>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Gig Not Found</h2>
          <p className="text-muted-foreground mb-6">The gig you are looking for does not exist.</p>
          <Button onClick={() => router.push('/gigs')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gigs
          </Button>
        </div>
      </div>
    );
  }

  if (hasExistingBid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Bid Already Placed</h2>
          <p className="text-muted-foreground mb-6">
            You have already placed a bid for this gig. You cannot place multiple bids for the same gig.
          </p>
          <div className="space-y-3">
            <Button onClick={() => router.push(`/gigs/${gigId}`)} className="w-full">
              View Gig Details
            </Button>
            <Button onClick={() => router.push('/gigs')} variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gigs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => router.push(`/gigs/${gigId}`)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gig
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Place Your Bid</CardTitle>
              <p className="text-muted-foreground">
                Submit your proposal for: <strong>{gig.title}</strong>
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Bid Fee Information */}
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="font-medium">Bid Fee</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    A small fee of ₹{bidFee} is required to place your bid. This helps maintain quality and reduces spam.
                  </p>
                </div>

                {/* Quotation */}
                <div className="space-y-2">
                  <Label htmlFor="quotation" className="text-sm font-medium">
                    Your Quotation (₹) *
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="quotation"
                      type="number"
                      placeholder="Enter your quotation amount"
                      value={bidData.quotation}
                      onChange={(e) => handleInputChange('quotation', e.target.value)}
                      className="pl-10"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the amount you're willing to work for this project
                  </p>
                </div>

                {/* Proposal */}
                <div className="space-y-2">
                  <Label htmlFor="proposal" className="text-sm font-medium">
                    Your Proposal *
                  </Label>
                  <Textarea
                    id="proposal"
                    placeholder="Describe your approach, experience, and why you're the right fit for this project..."
                    value={bidData.proposal}
                    onChange={(e) => handleInputChange('proposal', e.target.value)}
                    className="min-h-[120px]"
                    maxLength={500}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Minimum 50 characters</span>
                    <span>{bidData.proposal.length}/500</span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Place Bid (₹{bidFee})
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <FakeGigPayment
              gigId={gigId}
              gigTitle={gig?.title || 'Unknown Gig'}
              amount={bidFee}
              currency="INR"
              description={`Bid fee for gig: ${gig?.title}`}
              onSuccess={handlePaymentSuccess}
              onError={(error) => {
                console.error('Payment failed:', error);
                toast.error('Payment failed');
                setShowPayment(false);
              }}
              disabled={submitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}

