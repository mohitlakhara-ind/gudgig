'use client';

import { useState, useEffect, useContext } from 'react';
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
  Zap,
  Shield,
  Mail,
  Phone
} from 'lucide-react';
import CustomLoader from '@/components/CustomLoader';
import { ContactDetailsCard } from '@/components/gigs';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Job } from '@/types/api';
import FakeGigPayment from '@/components/payment/FakeGigPayment';
import ContactDetailsContext from '@/contexts/ContactDetailsContext';

export default function GigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const contactCtx = useContext(ContactDetailsContext);
  const gigId = params.id as string;
  
  const [gig, setGig] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedGigs, setSavedGigs] = useState<string[]>([]);
  const [userBids, setUserBids] = useState<any[]>([]);
  const [contactDetails, setContactDetails] = useState<any>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchGig = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getGig(gigId);
        setGig(response.data || null);
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

  // Fetch user bids and contact details if user is logged in
  useEffect(() => {
    const fetchUserBidsAndContacts = async () => {
      if (!user || !gigId) return;

      try {
        // Fetch user's bids
        const bidsResponse = await apiClient.getMyBids();
        const userBidsList = bidsResponse.data || [];
        
        // Filter bids for this specific gig
        const gigBids = userBidsList.filter((bid: any) => {
          const byGigNested = bid.gig && (bid.gig._id === gigId);
          const byGigId = bid.gigId === gigId;
          const byJobLegacy = bid.jobId && (bid.jobId._id === gigId || bid.jobId === gigId);
          return byGigNested || byGigId || byJobLegacy;
        });
        
        setUserBids(gigBids);

        // If user has bids for this gig, fetch contact details
        if (gigBids.length > 0) {
          const bid = gigBids[0]; // Get the first bid
          setContactLoading(true);
          
          try {
            const contactResponse = await apiClient.getGigBidContacts(gigId, bid._id);
            if (contactResponse.success && contactResponse.data) {
              setContactDetails(contactResponse.data);
            }
          } catch (contactErr) {
            console.error('Failed to fetch contact details:', contactErr);
            // Don't show error to user as this is secondary information
          } finally {
            setContactLoading(false);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user bids:', err);
        // Don't show error to user as this is secondary information
      }
    };

    fetchUserBidsAndContacts();
  }, [user, gigId]);

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
    setShowPayment(true);
  };

  const handleGuestBidPrompt = () => {
    toast.error('Please login to place a bid');
    router.push('/login');
  };

  const handlePaymentSuccess = async (paymentId: string, orderId: string) => {
    try {
      setPaymentLoading(true);
      
      // Prepare bidder contact details (required by backend)
      const defaultContact = contactCtx && typeof contactCtx.getDefaultContactDetails === 'function' 
        ? contactCtx.getDefaultContactDetails() 
        : null;
      const bidderContact = defaultContact ? {
        name: defaultContact.name,
        email: defaultContact.email,
        phone: defaultContact.phone,
        countryCode: defaultContact.countryCode || 'US',
        company: defaultContact.company || '',
        position: defaultContact.position || ''
      } : {
        name: user?.name || '',
        email: user?.email || '',
        phone: (user as any)?.phone || '',
        countryCode: (user as any)?.countryCode || 'US',
        company: '',
        position: ''
      };

      if (!bidderContact.name || !bidderContact.email || !bidderContact.phone) {
        toast.error('Please add your contact details (name, email, phone) before bidding.');
        setShowPayment(false);
        return;
      }

      // Submit bid after successful payment
      const payload = {
        quotation: 0,
        proposal: 'Bid submitted',
        bidFeePaid: 10,
        contactDetails: { bidderContact }
      } as any;

      const res = await apiClient.createGigBid(gigId, payload);
      if (!res?.success) {
        throw new Error(res?.message || 'Bid submission failed');
      }

      // Send email notification
      try {
        await fetch('/api/automations/bid-submitted', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?._id,
            userEmail: user?.email,
            userName: user?.name,
            jobTitle: gig?.title,
            quotation: 0,
            proposal: 'Bid submitted',
            bidFee: 10,
          })
        });
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
      }

      toast.success('Bid submitted successfully! Contact details will be shown.');
      setShowPayment(false);
      
      // Refresh user bids to show contact details
      const fetchUserBidsAndContacts = async () => {
        try {
          const bidsResponse = await apiClient.getMyBids();
          const userBidsList = bidsResponse.data || [];
          
          const gigBids = userBidsList.filter((bid: any) => {
            const byGigNested = bid.gig && (bid.gig._id === gigId);
            const byGigId = bid.gigId === gigId;
            const byJobLegacy = bid.jobId && (bid.jobId._id === gigId || bid.jobId === gigId);
            return byGigNested || byGigId || byJobLegacy;
          });
          
          setUserBids(gigBids);

          if (gigBids.length > 0) {
            const bid = gigBids[0];
            setContactLoading(true);
            
            try {
              const contactResponse = await apiClient.getGigBidContacts(gigId, bid._id);
              if (contactResponse.success && contactResponse.data) {
                setContactDetails(contactResponse.data);
              }
            } catch (contactErr) {
              console.error('Failed to fetch contact details:', contactErr);
            } finally {
              setContactLoading(false);
            }
          }
        } catch (err) {
          console.error('Failed to fetch user bids:', err);
        }
      };
      
      fetchUserBidsAndContacts();
      
    } catch (error) {
      console.error('Payment success handling failed:', error);
      toast.error('Payment completed but bid submission failed.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    toast.error(error);
    setShowPayment(false);
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

  // Check if user has submitted a bid for this gig
  const hasUserBid = userBids.length > 0;

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

            {/* Payment Modal */}
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Place Your Bid</CardTitle>
                <p className="text-muted-foreground">
                  Submit your bid for: <strong>{gig?.title}</strong>
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Bid Fee Information */}
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span className="font-medium">Bid Fee</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      A small fee of ₹5 is required to place your bid. This helps maintain quality and reduces spam.
                    </p>
                  </div>

                  {/* Payment Component */}
                  <div className="flex justify-center">
                    <FakeGigPayment
                      gigId={gigId}
                      gigTitle={gig?.title || 'Unknown Gig'}
                      amount={5}
                      currency="INR"
                      description={`Bid fee for gig: ${gig?.title}`}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      disabled={paymentLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CustomLoader size={32} color="#0966C2" />
        <span className="ml-2 text-muted-foreground">Loading gig details...</span>
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
                        {(gig as any).skills?.map((skill: string, index: number) => (
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
                      <span className="text-foreground font-bold text-lg">{formatBudget((gig as any).budget)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">Duration:</span>
                      <span className="text-foreground">{(gig as any).duration || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium">Location:</span>
                      <span className="text-foreground">{gig.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium">Experience:</span>
                      <span className="text-foreground">{(gig as any).experienceLevel || 'Any'}</span>
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
                    hasUserBid ? (
                      <Button 
                        variant="outline"
                        className="w-full"
                        size="lg"
                        disabled
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Bid Submitted
                      </Button>
                    ) : (
                      <Button 
                        onClick={handlePlaceBid}
                        className="w-full"
                        size="lg"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Place Bid
                      </Button>
                    )
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


              {/* Contact Details - Only show if user has bids */}
              {user && userBids.length > 0 && (
                <ContactDetailsCard 
                  contactDetails={contactDetails} 
                  loading={contactLoading}
                />
              )}

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
                      <span className="font-medium">{(gig as any).bidCount || 0}</span>
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

