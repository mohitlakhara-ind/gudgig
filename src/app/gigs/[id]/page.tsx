'use client';

import { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Heart,
  MapPin,
  Clock,
  CreditCard,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import CustomLoader from '@/components/CustomLoader';
import { ContactDetailsCard } from '@/components/gigs';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Job } from '@/types/api';
import RazorpayPayment from '@/components/payment/RazorpayPayment';
import GuestCheckout from '@/components/payment/GuestCheckout';
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
  const [bidsLoading, setBidsLoading] = useState(true);
  const [contactDetails, setContactDetails] = useState<any>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [bidCount, setBidCount] = useState<number>(0);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [rzpOrderId, setRzpOrderId] = useState<string | null>(null);
  const [rzpKeyId, setRzpKeyId] = useState<string | undefined>(undefined);
  const [paymentMode, setPaymentMode] = useState<'authenticated' | 'guest' | null>(null);
  const [paymentEmail, setPaymentEmail] = useState<string>('');
  const [paymentPhone, setPaymentPhone] = useState<string>('');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const closePaymentModal = () => {
    setShowPayment(false);
    setPaymentMode(null);
    setRzpOrderId(null);
    setRzpKeyId(undefined);
  };

  const openPaymentModal = () => {
    setPaymentMode(user ? 'authenticated' : 'guest');
    setShowPayment(true);
  };

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
    if (!showPayment || paymentMode !== 'authenticated' || !user) return;
    const defaultContact = contactCtx && typeof contactCtx.getDefaultContactDetails === 'function'
      ? contactCtx.getDefaultContactDetails()
      : null;
    setPaymentEmail(prev => prev || defaultContact?.email || user?.email || '');
    setPaymentPhone(prev => prev || defaultContact?.phone || (user as any)?.phone || '');
  }, [showPayment, paymentMode, contactCtx, user]);

  useEffect(() => {
    const saved = localStorage.getItem('savedGigs');
    if (saved) {
      setSavedGigs(JSON.parse(saved));
    }
  }, []);

  // Fetch real-time bid count for this gig
  const fetchBidCount = async () => {
    try {
      const res = await apiClient.getJobBidCount(gigId);
      if (res?.success) {
        setBidCount(res.data?.count || 0);
      }
    } catch { }
  };
  useEffect(() => {
    if (gigId) fetchBidCount();
  }, [gigId]);

  // Fetch user bids and contact details if user is logged in
  useEffect(() => {
    const fetchUserBidsAndContacts = async () => {
      if (!gigId) return;
      if (!user) {
        setBidsLoading(false);
        return;
      }

      try {
        setBidsLoading(true);
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
      } finally {
        setBidsLoading(false);
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

  const handlePaymentSuccess = async (paymentId: string, orderId: string) => {
    try {
      setPaymentLoading(true);

      const defaultContact = contactCtx && typeof contactCtx.getDefaultContactDetails === 'function'
        ? contactCtx.getDefaultContactDetails()
        : null;

      const bidderContact = {
        name: (defaultContact?.name || user?.name || '').trim(),
        email: (paymentEmail || defaultContact?.email || user?.email || '').trim(),
        phone: (paymentPhone || defaultContact?.phone || (user as any)?.phone || '').trim(),
        countryCode: defaultContact?.countryCode || (user as any)?.countryCode || 'US',
        company: defaultContact?.company || '',
        position: defaultContact?.position || ''
      };

      if (!bidderContact.name || !bidderContact.email || !bidderContact.phone) {
        toast.error('Please add your contact details (name, email, phone) before bidding.');
        closePaymentModal();
        return;
      }

      // Submit bid after successful payment
      const payload = {
        quotation: 0,
        proposal: 'Bid submitted',
        bidFeePaid: 5,
        contactDetails: { bidderContact }
      } as any;

      try {
        const res = await apiClient.createGigBid(gigId, payload);
        if (!res?.success) {
          throw new Error(res?.message || 'Bid submission failed');
        }
      } catch (e: any) {
        const msg = e?.message || '';
        // Treat duplicate-bid conflict as success (already unlocked)
        if (!/already placed a bid/i.test(msg)) {
          throw e;
        }
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

      toast.success('Access unlocked. Contact details will be shown.');
      closePaymentModal();

      // Refresh user bids to show contact details
      const fetchUserBidsAndContacts = async () => {
        try {
          setBidsLoading(true);
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
        } finally {
          setBidsLoading(false);
        }
      };

      fetchUserBidsAndContacts();
      // Refresh bid count after successful payment/bid
      fetchBidCount();

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
    closePaymentModal();
  };

  const verifyAndSubmitAfterRzp = async (paymentId: string, signature: string) => {
    try {
      if (!rzpOrderId) return;
      const base = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
      const resp = await fetch(`${base}/api/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: rzpOrderId, payment_id: paymentId, signature })
      });
      const data = await resp.json();
      if (!data?.success) throw new Error(data?.message || 'Verification failed');
      await handlePaymentSuccess(paymentId, rzpOrderId);
    } catch (e: any) {
      console.error('Verification failed:', e);
      toast.error(e?.message || 'Payment verification failed');
    }
  };

  const startRazorpayCheckout = async () => {
    try {
      const def = contactCtx && typeof contactCtx.getDefaultContactDetails === 'function'
        ? contactCtx.getDefaultContactDetails()
        : null;
      const email = (paymentEmail || def?.email || user?.email || '').trim();
      const contact = (paymentPhone || def?.phone || (user as any)?.phone || '').trim();
      if (!email || !contact) {
        toast.error('Please add your contact details (email, phone) in your profile before paying.');
        return;
      }
      setPaymentEmail(email);
      setPaymentPhone(contact);

      setCreatingOrder(true);
      const base = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
      const resp = await fetch(`${base}/api/payment/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 500, gigId, description: `Bid fee for gig: ${gig?.title}`, email, contact })
      });
      const data = await resp.json();
      if (!data?.success) throw new Error(data?.message || 'Failed to create order');
      setRzpOrderId(data.order.id);
      setRzpKeyId(data.keyId);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to start payment');
    } finally {
      setCreatingOrder(false);
    }
  };

  useEffect(() => {
    if (
      showPayment &&
      paymentMode === 'authenticated' &&
      !rzpOrderId &&
      !creatingOrder &&
      paymentEmail &&
      paymentPhone
    ) {
      startRazorpayCheckout();
    }
  }, [showPayment, paymentMode, rzpOrderId, creatingOrder, paymentEmail, paymentPhone]);


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
    const isAuthenticatedFlow = paymentMode === 'authenticated' && !!user;
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={closePaymentModal}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gig
            </Button>

            <Card className="max-w-xl mx-auto shadow-xl border-border/60">
              <CardHeader className="space-y-3">
                <CardTitle className="text-2xl font-bold">
                  {isAuthenticatedFlow ? 'Confirm unlock' : 'Unlock without logging in'}
                </CardTitle>
                <p className="text-muted-foreground">
                  Pay a small one-time fee to reveal the full brief and verified contact details for <strong>{gig?.title}</strong>.
                </p>
              </CardHeader>
              <CardContent>
                {isAuthenticatedFlow ? (
                  <div className="space-y-6">
                    <div className="bg-muted p-4 rounded-lg border border-dashed border-border/60">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span className="font-medium">Bid Fee — ₹5</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        This lightweight fee keeps the marketplace spam-free and instantly unlocks employer contact details.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground">Email</label>
                        <Input
                          type="email"
                          value={paymentEmail}
                          onChange={(e) => setPaymentEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Phone</label>
                        <Input
                          type="tel"
                          value={paymentPhone}
                          onChange={(e) => setPaymentPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
                      <Image
                        src="/razorpay-secure.svg"
                        width={120}
                        height={36}
                        alt="Razorpay secure badge"
                        className="h-10 w-auto"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Secure Razorpay checkout</p>
                        <p className="text-xs text-muted-foreground">UPI · Cards · Netbanking supported</p>
                      </div>
                    </div>

                    <RazorpayPayment
                      amount={500}
                      description={`Bid fee for gig: ${gig?.title}`}
                      orderId={rzpOrderId || ''}
                      keyId={rzpKeyId}
                      prefillEmail={paymentEmail}
                      prefillContact={paymentPhone}
                      onSuccess={verifyAndSubmitAfterRzp}
                      onError={handlePaymentError}
                      disabled={!paymentEmail || !paymentPhone}
                      preparing={!rzpOrderId || creatingOrder}
                    />
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="bg-muted p-4 rounded-lg border border-dashed border-border/60">
                      <p className="text-sm text-muted-foreground">
                        No account? No problem. Complete a secure Razorpay checkout and we&apos;ll automatically create a guest session for you.
                      </p>
                    </div>
                    <GuestCheckout
                      gigId={gigId}
                      amountInPaise={500}
                      description={`Bid fee for gig: ${gig?.title}`}
                    />
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
                      <Image
                        src="/razorpay-secure.svg"
                        width={120}
                        height={36}
                        alt="Razorpay secure badge"
                        className="h-10 w-auto"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Trusted payments</p>
                        <p className="text-xs text-muted-foreground">PCI DSS compliant · 256-bit SSL encryption</p>
                      </div>
                    </div>
                  </div>
                )}
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
            <div id="overview" className="lg:col-span-2 space-y-6 scroll-mt-24">
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
                          <Users className="h-4 w-4" />
                          <span>{bidCount} bids</span>
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
                      <h3 className="font-semibold text-foreground mb-2">Summary</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {(gig as any).descriptionShort || (gig as any).descriptionPreview || gig.description || 'Details available after unlocking.'}
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

              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle>Full Description</CardTitle>
                  {!bidsLoading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                      className="self-start sm:self-auto"
                    >
                      {isDescriptionExpanded ? 'Collapse' : 'Expand'}
                      {isDescriptionExpanded ? (
                        <ChevronUp className="h-4 w-4 ml-2" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-2" />
                      )}
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {bidsLoading ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                      <div className="h-4 bg-muted rounded w-4/5"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  ) : hasUserBid ? (
                    <div className={`text-foreground leading-relaxed whitespace-pre-line transition-all ${isDescriptionExpanded ? '' : 'max-h-64 overflow-hidden'}`}>
                      {(gig as any).descriptionFull || gig.description}
                    </div>
                  ) : (
                    <div className="relative">
                      <div className={`select-none filter blur-sm opacity-80 transition-all ${isDescriptionExpanded ? '' : 'max-h-48 overflow-hidden'}`}>
                        <p className="leading-relaxed whitespace-pre-line">
                          {(gig as any).descriptionShort || (gig as any).descriptionPreview || 'Unlock to view the complete project description, deliverables, and guidelines.'}
                        </p>
                      </div>
                      {!isDescriptionExpanded && (
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          className="h-10 px-6 bg-gradient-to-r from-primary to-primary/90 text-white shadow-md hover:shadow-lg"
                          onClick={openPaymentModal}
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Unlock full description
                        </Button>
                      </div>
                    </div>
                  )}
                  {!bidsLoading && !isDescriptionExpanded && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Expand to read the entire project brief.
                    </p>
                  )}
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
                        className="w-full h-11"
                        size="lg"
                        onClick={() => {
                          const el = document.getElementById('contact-details');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        View contact details
                      </Button>
                    ) : (
                      <Button
                        onClick={openPaymentModal}
                        className="w-full h-11 font-medium bg-gradient-to-r from-primary to-primary/90 text-white shadow-md hover:shadow-lg hover:from-primary/90 hover:to-primary active:scale-[0.99] transition-all"
                        size="lg"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Unlock full details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )
                  ) : (
                    <div className="space-y-3">
                      <Button
                        onClick={openPaymentModal}
                        className="w-full h-11 font-medium bg-gradient-to-r from-primary to-primary/90 text-white shadow-md hover:shadow-lg"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Unlock instantly
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        No login required. We&apos;ll walk you through a secure Razorpay checkout.
                      </p>
                    </div>
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
              {/* Contact: skeleton while unlock status loading; locked preview when not unlocked */}
              {bidsLoading ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Contact Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : !(user && hasUserBid) ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Contact Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 w-2/3 bg-muted/60 rounded blur-[1px]" />
                      <div className="h-4 w-1/2 bg-muted/60 rounded blur-[1px]" />
                      <div className="h-4 w-1/3 bg-muted/60 rounded blur-[1px]" />
                      <p className="text-xs text-muted-foreground">Unlock to reveal poster's email and phone.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

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
                  <div className="space-y-3 mb-10 md:mb-0 lg:mb-0">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bids</span>
                      <span className="font-medium">{bidCount}</span>
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
          {/* Testimonials section intentionally removed per request */}
        </div>
      </div>

      {!hasUserBid && !showPayment && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-background via-background/95 to-transparent px-4 pb-4 pt-6 md:hidden">
          <Button
            className="w-full h-13 rounded-2xl shadow-xl bg-primary text-primary-foreground hover:shadow-2xl hover:scale-[1.01] transition-all"
            onClick={openPaymentModal}
            aria-label="Unlock Full details"
          >
            <Lock className="h-4 w-4 mr-2" />
            Unlock Full details
          </Button>
        </div>
      )}
    </div>
  );
}

