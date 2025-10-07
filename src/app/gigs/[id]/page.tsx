'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Eye,
  Heart,
  MessageCircle,
  MapPin,
  Clock,
  Award,
  CreditCard,
  Zap
} from 'lucide-react';
import CustomLoader from '@/components/CustomLoader';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Job } from '@/types/api';
import FakeGigPayment from '@/components/payment/FakeGigPayment';

export default function GigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const gigId = params.id as string;
  
  const [gig, setGig] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedGigs, setSavedGigs] = useState<string[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchGig = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getGig(gigId);
        setGig(response.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load gig');
        toast.error('Failed to load gig details');
      } finally {
        setLoading(false);
      }
    };

    if (gigId) {
      fetchGig();
    }
  }, [gigId]);

  useEffect(() => {
    const saved = localStorage.getItem('savedGigs');
    if (saved) {
      setSavedGigs(JSON.parse(saved));
    }
  }, []);

  const handleSaveGig = () => {
    if (!gig) return;
    
    const newSavedGigs = savedGigs.includes(gigId) 
      ? savedGigs.filter(id => id !== gigId)
      : [...savedGigs, gigId];
    
    setSavedGigs(newSavedGigs);
    localStorage.setItem('savedGigs', JSON.stringify(newSavedGigs));
    
    if (savedGigs.includes(gigId)) {
      toast.success('Gig removed from saved');
    } else {
      toast.success('Gig saved successfully');
    }
  };

  const handlePlaceBid = () => {
    if (!user) {
      toast.error('Please login to place a bid');
      return;
    }
    router.push(`/gigs/${gigId}/bid`);
  };

  const handleGuestBidPrompt = () => {
    toast.error('Please login to place a bid');
    router.push('/login');
  };

  const handlePaymentSuccess = async (paymentId: string, orderId: string) => {
    try {
      setPaymentLoading(true);
      
      // Call the fake payment API to record the payment
      const response = await fetch('/api/fake-payments/gig', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gigId,
          gigTitle: gig?.title || 'Unknown Gig',
          amount: gig?.budget || 0,
          currency: 'INR',
          description: `Payment for gig: ${gig?.title}`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Payment recorded:', data);
        toast.success('Payment completed successfully!');
        setShowPayment(false);
      } else {
        throw new Error('Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Payment completed but failed to record. Please contact support.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    toast.error(error);
  };

  const handleStartPayment = () => {
    if (!user) {
      toast.error('Please login to make a payment');
      router.push('/login');
      return;
    }
    setShowPayment(true);
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget);
  };

  const getDaysAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - postDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CustomLoader size={32} color="#0966C2" />
        <span className="ml-2 text-muted-foreground">Loading gig details...</span>
      </div>
    );
  }

  // Show payment modal if payment is in progress
  if (showPayment) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              onClick={() => setShowPayment(false)}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gig
            </Button>

            {/* Payment Component */}
            <div className="flex justify-center">
              <FakeGigPayment
                gigId={gigId}
                gigTitle={gig?.title || 'Unknown Gig'}
                amount={gig?.budget || 0}
                currency="INR"
                description={`Payment for gig: ${gig?.title}`}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                disabled={paymentLoading}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Gig Not Found</h2>
          <p className="text-muted-foreground mb-6">{error || 'The gig you are looking for does not exist.'}</p>
          <Button onClick={() => router.push('/gigs')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gigs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gig Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold text-foreground mb-2">
                        {gig.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Posted {getDaysAgo(gig.createdAt)} days ago</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{gig.views || 0} views</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {gig.skills?.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveGig}
                        className={savedGigs.includes(gigId) ? 'text-red-500' : ''}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${savedGigs.includes(gigId) ? 'fill-current' : ''}`} />
                        {savedGigs.includes(gigId) ? 'Saved' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Description</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {gig.description}
                      </p>
                    </div>
                    
                    {gig.requirements && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Requirements</h3>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          {gig.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="font-medium">Budget:</span>
                      <span className="text-foreground font-bold text-lg">{formatBudget(gig.budget)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">Duration:</span>
                      <span className="text-foreground">{gig.duration || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium">Location:</span>
                      <span className="text-foreground">{gig.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium">Experience:</span>
                      <span className="text-foreground">{gig.experienceLevel || 'Any'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Action Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Take Action</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user ? (
                    <Button 
                      onClick={handlePlaceBid}
                      className="w-full"
                      size="lg"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Place Bid
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleGuestBidPrompt}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Login to Bid
                    </Button>
                  )}

                  {/* Payment Button */}
                  <Button 
                    onClick={handleStartPayment}
                    variant="default"
                    className="w-full"
                    size="lg"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay for Gig
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleSaveGig}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${savedGigs.includes(gigId) ? 'fill-current text-red-500' : ''}`} />
                    {savedGigs.includes(gigId) ? 'Remove from Saved' : 'Save Gig'}
                  </Button>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Payment Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {formatBudget(gig.budget)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        One-time payment
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      Secure payment processing with fake gateway for demo purposes
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gig Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Gig Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Views</span>
                      <span className="font-medium">{gig.views || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bids</span>
                      <span className="font-medium">{gig.bidCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Posted</span>
                      <span className="font-medium">{getDaysAgo(gig.createdAt)} days ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

