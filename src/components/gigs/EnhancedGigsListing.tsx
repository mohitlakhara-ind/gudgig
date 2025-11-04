'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import FakeGigPayment from '@/components/payment/FakeGigPayment';
import RazorpayPayment from '@/components/payment/RazorpayPayment';
import ContactDetailsCard from './ContactDetailsCard';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users,
  Heart,
  ArrowRight,
  Briefcase,
  Calendar,
  Star,
  Eye,
  MessageCircle,
  Bookmark,
  TrendingUp,
  Zap,
  Shield,
  Award,
  RefreshCw,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CreditCard,
  Mail,
  Phone,
  Lock
} from 'lucide-react';
import { useGigs } from '@/contexts/GigsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useContactDetails } from '@/contexts/ContactDetailsContext';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatGigBudget, getDaysAgo, getGigStatusColor } from '@/hooks/useGigsManager';
import GigsSkeletonLoader from './GigsSkeletonLoader';

// Enhanced categories with better organization
const categories = [
  { value: 'all', label: 'All Categories', icon: '🎯' },
  { value: 'website development', label: 'Website Development', icon: '🌐' },
  { value: 'graphic design', label: 'Graphic Design', icon: '🎨' },
  { value: 'content writing', label: 'Content Writing', icon: '✍️' },
  { value: 'social media management', label: 'Social Media', icon: '📱' },
  { value: 'seo', label: 'SEO & Marketing', icon: '📈' },
  { value: 'app development', label: 'App Development', icon: '📱' },
  { value: 'game development', label: 'Game Development', icon: '🎮' }
];

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'budget-high', label: 'Highest Budget' },
  { value: 'budget-low', label: 'Lowest Budget' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'bids', label: 'Most Bids' },
  { value: 'views', label: 'Most Views' }
];

export default function EnhancedGigsListing() {
  const router = useRouter();
  const { user } = useAuth();
  const { state, actions, gigsManager } = useGigs();
  const { getDefaultContactDetails } = useContactDetails();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentGig, setPaymentGig] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [orderingGigId, setOrderingGigId] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [appliedGigIds, setAppliedGigIds] = useState<Set<string>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [rzpOrderId, setRzpOrderId] = useState<string | null>(null);
  const [rzpKeyId, setRzpKeyId] = useState<string | undefined>(undefined);
  const [payerEmail, setPayerEmail] = useState<string>('');
  const [payerContact, setPayerContact] = useState<string>('');

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        actions.addRecentSearch(searchQuery);
        setIsSearching(true);
        gigsManager.fetchGigs({
          category: state.filters.category !== 'all' ? state.filters.category as any : undefined,
          query: searchQuery
        }).finally(() => setIsSearching(false));
      } else {
        gigsManager.fetchGigs({
          category: state.filters.category !== 'all' ? state.filters.category as any : undefined,
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, state.filters.category]); // Remove actions and gigsManager to prevent infinite loop

  // Fetch user's applied gigs (bids) to filter them out
  useEffect(() => {
    const fetchAppliedGigs = async () => {
      if (!user) {
        setAppliedGigIds(new Set());
        return;
      }

      try {
        const response = await apiClient.getMyBids();
        if (response.success && response.data) {
          const gigIds = response.data.map((bid: any) => {
            const gigId = bid.gig?._id || bid.gig || bid.gigId;
            return gigId;
          }).filter(Boolean);
          setAppliedGigIds(new Set(gigIds));
        }
      } catch (error) {
        console.error('Error fetching applied gigs:', error);
        setAppliedGigIds(new Set());
      }
    };

    fetchAppliedGigs();
  }, [user]);

  // Filter out applied gigs from the display
  const filteredGigs = gigsManager.gigs.filter(gig => !appliedGigIds.has(gig._id));

  const handleSaveGig = async (gigId: string) => {
    if (!user) {
      toast.error('Please login to save gigs');
      router.push('/auth/login');
      return;
    }

    try {
      const isSaved = state.savedGigs.includes(gigId);
      
      if (isSaved) {
        await apiClient.unsaveJob(gigId);
        actions.toggleSavedGig(gigId);
        toast.success('Gig removed from saved');
      } else {
        await apiClient.saveJob(gigId);
        actions.toggleSavedGig(gigId);
        toast.success('Gig saved successfully');
      }
    } catch (error) {
      console.error('Error saving gig:', error);
      toast.error('Failed to save gig');
    }
  };

  const handlePlaceOrder = async (gigId: string) => {
    if (!user) {
      toast.error('Please login to place orders');
      router.push('/auth/login');
      return;
    }

    // Find the gig to get its title
    const gig = filteredGigs.find(g => g._id === gigId);
    if (!gig) {
      toast.error('Gig not found');
      return;
    }

    // Set loading state
    setOrderingGigId(gigId);
    
    try {
      // Set payment gig and show payment
      setPaymentGig({
        id: gigId,
        title: gig.title
      });
      setShowPayment(true);
    } catch (error) {
      console.error('Error opening order payment:', error);
      toast.error('Failed to open order form');
    } finally {
      setOrderingGigId(null);
    }
  };

  const handlePaymentSuccess = async (paymentId: string, orderId: string, contactFromPayment?: any) => {
    if (!paymentGig || !user) return;

    try {
      setPaymentLoading(true);
      
      // Prepare bidder contact details (required by backend)
      const defaultContact = typeof getDefaultContactDetails === 'function' ? getDefaultContactDetails() : null;
      const bidderContact = contactFromPayment?.bidderContact ? contactFromPayment.bidderContact : (defaultContact ? {
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
      });

      if (!bidderContact.name || !bidderContact.email || !bidderContact.phone) {
        toast.error('Please add your contact details (name, email, phone) before bidding.');
        setShowPayment(false);
        setPaymentGig(null);
        return;
      }

      // Submit bid after successful payment (uses gigs bidding flow)
      try {
        const res = await apiClient.createGigBid(paymentGig.id, {
          quotation: 0,
          proposal: 'Order placed',
          bidFeePaid: 10,
          contactDetails: { bidderContact }
        });
        if (!res?.success) {
          throw new Error(res?.message || 'Order creation failed');
        }
      } catch (e: any) {
        const msg = e?.message || '';
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
            jobTitle: paymentGig.title,
            quotation: 0,
            proposal: 'Order placed',
            bidFee: 10, // Updated to match active fee
          })
        });
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
      }

      toast.success('Access unlocked. Contact details will be shown.');
      setShowPayment(false);
      setPaymentGig(null);
      
      // Add to applied gigs (orders) to hide from list
      setAppliedGigIds(prev => new Set([...prev, paymentGig.id]));
      
      // Refresh gigs to show updated bid count and remove from list
      gigsManager.refresh();
      
      // Optionally, open contact details view (navigate to gig page)
      router.push(`/gigs/${paymentGig.id}`);
      
    } catch (error) {
      console.error('Payment success handling failed:', error);
      toast.error('Payment completed but order creation failed.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    toast.error(error);
    setShowPayment(false);
    setPaymentGig(null);
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
      const def = typeof getDefaultContactDetails === 'function' ? getDefaultContactDetails() : null;
      const email = def?.email || user?.email || '';
      const contact = def?.phone || (user as any)?.phone || '';
      if (!email || !contact) {
        toast.error('Please add your contact details (email, phone) in your profile before paying.');
        return;
      }
      setPayerEmail(email);
      setPayerContact(contact);

      setCreatingOrder(true);
      const base = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
      const resp = await fetch(`${base}/api/payment/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1000, gigId: paymentGig?.id, description: `Order fee for gig: ${paymentGig?.title}`, email, contact })
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

  const handleGuestOrderPrompt = () => {
    toast.error('Please login or register to place orders');
    router.push('/auth/login');
  };

  const handleViewGig = (gigId: string) => {
    router.push(`/gigs/${gigId}`);
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(cat => cat.value === category)?.label || category;
  };

  const getCategoryIcon = (category: string) => {
    return categories.find(cat => cat.value === category)?.icon || '🎯';
  };

  const handleRefresh = () => {
    gigsManager.refresh();
    toast.success('Gigs refreshed');
  };

  // Infinite scroll implementation
  const handleLoadMore = useCallback(() => {
    if (gigsManager.hasMore && !gigsManager.loading) {
      gigsManager.loadMoreGigs();
    }
  }, [gigsManager.hasMore, gigsManager.loading, gigsManager.loadMoreGigs]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && gigsManager.hasMore && !gigsManager.loading) {
          handleLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [handleLoadMore, gigsManager.hasMore, gigsManager.loading]);

  // Show payment screen if payment is in progress
  if (showPayment && paymentGig) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowPayment(false);
                setPaymentGig(null);
              }}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gigs
            </Button>

            {/* Payment Modal */}
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Place Your Bid</CardTitle>
                <p className="text-muted-foreground">
                  Submit your bid for: <strong>{paymentGig.title}</strong>
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Bid Fee Information */}
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span className="font-medium">Order Fee</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      A fee of ₹10 is required to place your order. This helps maintain quality and reduces spam.
                    </p>
                  </div>

                  {/* Razorpay Payment */}
                  {!rzpOrderId ? (
                    <Button onClick={startRazorpayCheckout} disabled={creatingOrder} className="w-full h-11">
                      {creatingOrder ? 'Preparing…' : 'Proceed to secure payment'}
                    </Button>
                  ) : (
                    <RazorpayPayment
                      amount={1000}
                      description={`Order fee for gig: ${paymentGig.title}`}
                      orderId={rzpOrderId}
                      keyId={rzpKeyId}
                      prefillEmail={payerEmail}
                      prefillContact={payerContact}
                      onSuccess={verifyAndSubmitAfterRzp}
                      onError={handlePaymentError}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="space-y-6">
          {/* Professional Search and Filters */}
          <Card className="professional-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-foreground text-xl">
                <Search className="h-5 w-5 text-primary" />
                Find Your Perfect Gig
              </CardTitle>
            </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search gigs, skills, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 professional-input"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
            
            <Select 
              value={state.filters.category} 
              onValueChange={(value) => actions.setFilters({ category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={state.sortBy} 
              onValueChange={actions.setSortBy}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                <Button
                  variant={state.viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => actions.setViewMode('grid')}
                      className="hover:scale-105 active:scale-95 transition-all duration-200"
                      aria-label="Grid view"
                >
                  <div className="grid grid-cols-2 gap-1">
                    <div className="w-1 h-1 bg-current rounded"></div>
                    <div className="w-1 h-1 bg-current rounded"></div>
                    <div className="w-1 h-1 bg-current rounded"></div>
                    <div className="w-1 h-1 bg-current rounded"></div>
                  </div>
                </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Grid view</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                <Button
                  variant={state.viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => actions.setViewMode('list')}
                      className="hover:scale-105 active:scale-95 transition-all duration-200"
                      aria-label="List view"
                >
                  <div className="flex flex-col gap-1">
                    <div className="w-3 h-1 bg-current rounded"></div>
                    <div className="w-3 h-1 bg-current rounded"></div>
                    <div className="w-3 h-1 bg-current rounded"></div>
                  </div>
                </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>List view</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={gigsManager.isRefreshing}
                    className="hover:scale-105 active:scale-95 transition-all duration-200"
                    aria-label="Refresh gigs list"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${gigsManager.isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Refresh gigs list</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="text-sm text-muted-foreground">
              {filteredGigs.length} gigs found
              {state.filters.category !== 'all' && ` in ${getCategoryLabel(state.filters.category)}`}
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Error State */}
      {gigsManager.error && gigsManager.gigs.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-destructive mb-4">
              <AlertCircle className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Unable to Connect to Server</h3>
              <p className="text-muted-foreground mb-4">{gigsManager.error}</p>
              <p className="text-sm text-muted-foreground mb-6">
                Please check your internet connection and ensure the server is running.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={gigsManager.retry}>
                  Try Again
                </Button>
                <Button variant="outline" onClick={handleRefresh}>
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {gigsManager.loading && gigsManager.gigs.length === 0 && (
        <GigsSkeletonLoader viewMode={state.viewMode} count={6} />
      )}

      {/* Empty State */}
      {!gigsManager.error && gigsManager.gigs.length === 0 && !gigsManager.loading && (
        <Card className="text-center py-16">
          <CardContent>
            <Briefcase className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-3">No gigs found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn't find any gigs matching your criteria. Try adjusting your search or browse all categories.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => {
                setSearchQuery('');
                actions.resetFilters();
              }}>
                Clear Filters
              </Button>
              <Button variant="outline" onClick={handleRefresh}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

              {/* Professional Gigs Grid/List */}
          {filteredGigs.length > 0 && (
            <>
              <div className={state.viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6" 
                : "space-y-6"
              }>
                {filteredGigs.map((gig) => (
                  <Card 
                    key={gig._id} 
                    className={`group relative overflow-hidden bg-card border border-border rounded-xl shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer ${
                      state.viewMode === 'list' 
                        ? 'hover:-translate-y-0' 
                        : 'hover:-translate-y-1'
                    }`}
                    onClick={() => handleViewGig(gig._id)}
                  >
                    {/* Save Button - Topmost Right Corner */}
                    <div className="absolute top-2 right-2 z-20">
                      <Tooltip>
                        <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveGig(gig._id);
                            }}
                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-all duration-200 hover:scale-105 active:scale-95 bg-white/90 backdrop-blur-sm shadow-sm"
                            aria-label={state.savedGigs.includes(gig._id) ? 'Remove from saved' : 'Save gig'}
                      >
                        <Heart 
                              className={`h-4 w-4 transition-all duration-200 ${
                            state.savedGigs.includes(gig._id) 
                                  ? 'fill-red-500 text-red-500 scale-110' 
                              : 'text-muted-foreground hover:text-red-500'
                          }`} 
                        />
                      </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>{state.savedGigs.includes(gig._id) ? 'Remove from saved' : 'Save gig'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Status Indicator */}
                    <div className="absolute top-2 right-12 z-10">
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-medium px-2 py-1 ${
                          gig.status === 'active' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : gig.status === 'paused'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full mr-1.5 ${
                          gig.status === 'active' 
                            ? 'bg-green-500' 
                            : gig.status === 'paused'
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                        }`} />
                        {gig.status || 'Active'}
                      </Badge>
                    </div>

                    <CardHeader className={`${state.viewMode === 'list' ? 'pb-4 pt-4' : 'pb-3 pt-6'}`}>
                      <div className={`flex items-start justify-between ${state.viewMode === 'list' ? 'flex-row' : 'flex-col'}`}>
                        <div className={`flex-1 ${state.viewMode === 'list' ? 'pr-6' : 'pr-4'}`}>
                          {/* Category Badge */}
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary border-primary/20">
                              <span className="mr-1">{getCategoryIcon(gig.category)}</span>
                              {getCategoryLabel(gig.category)}
                            </Badge>
                            {/* Urgency Indicator */}
                            {getDaysAgo(gig.createdAt) === 'Today' && (
                              <Badge variant="outline" className="text-xs font-medium px-2 py-1 bg-orange-50 text-orange-700 border-orange-200">
                                <Zap className="h-3 w-3 mr-1" />
                                New
                              </Badge>
                            )}
                          </div>

                          {/* Title */}
                          <CardTitle 
                            className={`${state.viewMode === 'list' ? 'text-xl' : 'text-lg'} font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight`}
                          >
                            {gig.title}
                          </CardTitle>

                          {/* Description */}
                          <p className={`text-muted-foreground text-sm leading-relaxed ${state.viewMode === 'list' ? 'line-clamp-1' : 'line-clamp-2'} mb-3`}>
                            {(gig as any).descriptionShort || gig.description}
                          </p>
                    </div>

                  </div>
                </CardHeader>

                    <CardContent className={`${state.viewMode === 'list' ? 'pt-0 pb-4' : 'space-y-4'}`}>
                      {state.viewMode === 'list' ? (
                        // List view layout
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                        {/* Skills */}
                        {gig.requirements && gig.requirements.length > 0 && (
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-muted-foreground" />
                            <div className="flex flex-wrap gap-1">
                                  {gig.requirements.slice(0, 2).map((skill, index) => (
                                    <Badge key={index} variant="outline" className="text-xs px-2 py-1 bg-muted/50">
                                  {skill}
                                </Badge>
                              ))}
                                  {gig.requirements.length > 2 && (
                                    <Badge variant="outline" className="text-xs px-2 py-1 bg-muted/50">
                                      +{gig.requirements.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                            {/* Budget */}
                            <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="font-semibold text-green-700">
                              {formatGigBudget(gig)}
                            </span>
                          </div>

                            {/* Posted Date */}
                            <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground text-sm">
                              {getDaysAgo(gig.createdAt)}
                            </span>
                          </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{(gig as any).bidsCount || 0} bids</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  className="h-10 px-4 font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewGig(gig._id);
                                  }}
                                  aria-label="View contact details"
                                >
                                  <Lock className="h-4 w-4 mr-2" />
                                  Unlock more details
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>Open gig to view contact details</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      ) : (
                        // Grid view layout
                        <>
                          {/* Skills */}
                          {gig.requirements && gig.requirements.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1 mb-2">
                                <Award className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Skills Required</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {gig.requirements.slice(0, 3).map((skill, index) => (
                                  <Badge key={index} variant="outline" className="text-xs px-2 py-1 bg-muted/50">
                                    {skill}
                                  </Badge>
                                ))}
                                {gig.requirements.length > 3 && (
                                  <Badge variant="outline" className="text-xs px-2 py-1 bg-muted/50">
                                    +{gig.requirements.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Gig Stats */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-green-50 rounded-md">
                                <DollarSign className="h-3.5 w-3.5 text-green-600" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-green-700 truncate">
                                  {formatGigBudget(gig)}
                                </div>
                                <div className="text-xs text-muted-foreground">Budget</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-blue-50 rounded-md">
                                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-foreground truncate">
                                  {getDaysAgo(gig.createdAt)}
                                </div>
                                <div className="text-xs text-muted-foreground">Posted</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-purple-50 rounded-md">
                                <Users className="h-3.5 w-3.5 text-purple-600" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-foreground truncate">
                                  {(gig as any).bidsCount || 0}
                                </div>
                                <div className="text-xs text-muted-foreground">Bids</div>
                              </div>
                            </div>
                            
                            {/* Removed views */}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  className="flex-1 h-10 font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewGig(gig._id);
                                  }}
                                  aria-label="View contact details"
                                >
                                  <Lock className="h-4 w-4 mr-2" />
                                  Unlock more details
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>Open gig to view contact details</p>
                              </TooltipContent>
                            </Tooltip>
                        </div>
                        </>
                      )}
                      </CardContent>
                    </Card>
                ))}
                </div>

          {/* Infinite Scroll Trigger */}
          {gigsManager.hasMore ? (
            <div ref={loadMoreRef} className="text-center mt-12">
              {gigsManager.loading ? (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading more gigs...
                </div>
              ) : (
              <Button 
                variant="outline" 
                size="lg" 
                  onClick={handleLoadMore}
                className="px-8"
              >
                    Load More Gigs
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          ) : filteredGigs.length > 0 && (
            <div className="text-center mt-12 py-8">
              <div className="text-muted-foreground">
                <Briefcase className="h-8 w-8 mx-auto mb-2" />
                <p>You've reached the end! No more gigs to load.</p>
              </div>
            </div>
          )}

          {/* Loading More Skeleton */}
          {gigsManager.loading && filteredGigs.length > 0 && (
            <div className="mt-6">
              <GigsSkeletonLoader viewMode={state.viewMode} count={6} />
            </div>
          )}
        </>
      )}

    </div>
    </TooltipProvider>
  );
}
