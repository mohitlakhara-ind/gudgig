'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, InputGroup, InputPrefix, InputSuffix } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { useResponsive } from '@/hooks/useResponsive';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatGigBudget, getDaysAgo, getGigStatusColor, formatMaxBids } from '@/hooks/useGigsManager';
import GigsSkeletonLoader from './GigsSkeletonLoader';

// Enhanced categories with better organization
const categories = [
  { value: 'all', label: 'All Categories', icon: '🎯' },
  { value: 'website development', label: 'Website Development', icon: '🌐' },
  { value: 'graphic design', label: 'Graphic Design', icon: '🎨' },
  { value: 'content writing', label: 'Content Writing', icon: '✍️' },
  { value: 'social media management', label: 'Social Media', icon: '📱' },
  { value: 'SEO', label: 'SEO', icon: '📈' },
  { value: 'app development', label: 'App Development', icon: '📱' },
  { value: 'game development', label: 'Game Development', icon: '🎮' },
  { value: 'video editing', label: 'Video Editing', icon: '🎞️' },
  { value: 'photography', label: 'Photography', icon: '📷' },
  { value: 'data entry', label: 'Data Entry', icon: '📁' },
  { value: 'virtual assistant', label: 'Virtual Assistant', icon: '🎧' },
  { value: 'digital marketing', label: 'Digital Marketing', icon: '📊' },
  { value: 'business consulting', label: 'Business Consulting', icon: '💼' }
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
  const { isMobile } = useResponsive();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentGig, setPaymentGig] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [orderingGigId, setOrderingGigId] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [appliedGigIds, setAppliedGigIds] = useState<Set<string>>(new Set());
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [rzpOrderId, setRzpOrderId] = useState<string | null>(null);
  const [rzpKeyId, setRzpKeyId] = useState<string | undefined>(undefined);
  const [payerEmail, setPayerEmail] = useState<string>('');
  const [payerContact, setPayerContact] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const filtersInitializedRef = useRef(false);
  const lastFilterSignatureRef = useRef<string>('');

  // Store fetchGigs in a ref to avoid dependency issues
  const fetchGigsRef = useRef(gigsManager.fetchGigs);
  useEffect(() => {
    fetchGigsRef.current = gigsManager.fetchGigs;
  }, [gigsManager.fetchGigs]);


  const filterSignature = useMemo(
    () =>
      JSON.stringify({
        search: activeSearchQuery,
        category: state.filters.category,
        sortBy: state.sortBy,
        location: locationFilter,
        skills: skillsFilter,
        minBudget: budgetMin,
        maxBudget: budgetMax
      }),
    [
      activeSearchQuery,
      state.filters.category,
      state.sortBy,
      locationFilter,
      skillsFilter,
      budgetMin,
      budgetMax
    ]
  );

  const buildSearchParams = useCallback((page: number, searchQueryOverride?: string) => {
    const params: any = {
      page,
      limit: 10,
      sortBy: state.sortBy
    };

    if (state.filters.category && state.filters.category !== 'all') {
      params.category = state.filters.category;
    }
    const queryToUse = searchQueryOverride !== undefined ? searchQueryOverride : activeSearchQuery;
    if (queryToUse) {
      params.query = queryToUse;
    }
    if (locationFilter.trim()) {
      params.location = locationFilter.trim();
    }
    if (skillsFilter.trim()) {
      const skills = skillsFilter
        .split(',')
        .map(skill => skill.trim())
        .filter(Boolean)
        .join(',');
      if (skills) {
        params.skills = skills;
      }
    }
    const min = parseInt(budgetMin, 10);
    if (!Number.isNaN(min)) {
      params.minBudget = min;
    }
    const max = parseInt(budgetMax, 10);
    if (!Number.isNaN(max)) {
      params.maxBudget = max;
    }
    return params;
  }, [
    state.sortBy,
    state.filters.category,
    activeSearchQuery,
    locationFilter,
    skillsFilter,
    budgetMin,
    budgetMax
  ]);

  const fetchPage = useCallback(async (page: number, options?: { keepPageState?: boolean }) => {
    if (!options?.keepPageState) {
      setCurrentPage(page);
    }
    setIsSearching(true);
    try {
      const params = buildSearchParams(page);
      await fetchGigsRef.current(params);
    } catch {
      // handled via toast inside gigs manager
    } finally {
      setIsSearching(false);
    }
  }, [buildSearchParams]);

  // Handle search button click or Enter key
  const handleSearch = useCallback(() => {
    const trimmedQuery = searchQuery.trim();
    setActiveSearchQuery(trimmedQuery);
    if (trimmedQuery) {
      actions.addRecentSearch(trimmedQuery);
    }
    setCurrentPage(1);
    setIsSearching(true);
    const params = buildSearchParams(1, trimmedQuery);
    fetchGigsRef.current(params)
      .catch(() => {
        // handled via toast inside gigs manager
      })
      .finally(() => {
        setIsSearching(false);
      });
  }, [searchQuery, actions, buildSearchParams]);

  // Handle Enter key in search input
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);

  // Initial fetch on mount and auto-fetch when filters change (not search query - that's handled by button)
  useEffect(() => {
    if (!filtersInitializedRef.current) {
      filtersInitializedRef.current = true;
      lastFilterSignatureRef.current = filterSignature;
      // Fetch initial gigs on mount
      const params = buildSearchParams(1);
      setIsSearching(true);
      fetchGigsRef.current(params)
        .catch(() => {
          // handled via toast inside gigs manager
        })
        .finally(() => {
          setIsSearching(false);
        });
      return;
    }
    
    // Only fetch if filter signature actually changed (excluding search query changes)
    const currentSignatureWithoutSearch = JSON.stringify({
      category: state.filters.category,
      sortBy: state.sortBy,
      location: locationFilter,
      skills: skillsFilter,
      minBudget: budgetMin,
      maxBudget: budgetMax
    });
    const lastSignatureWithoutSearch = JSON.parse(lastFilterSignatureRef.current || '{}');
    const lastSignatureWithoutSearchStr = JSON.stringify({
      category: lastSignatureWithoutSearch.category,
      sortBy: lastSignatureWithoutSearch.sortBy,
      location: lastSignatureWithoutSearch.location,
      skills: lastSignatureWithoutSearch.skills,
      minBudget: lastSignatureWithoutSearch.minBudget,
      maxBudget: lastSignatureWithoutSearch.maxBudget
    });
    
    if (lastSignatureWithoutSearchStr !== currentSignatureWithoutSearch) {
      lastFilterSignatureRef.current = filterSignature;
      setCurrentPage(1);
      const params = buildSearchParams(1);
      setIsSearching(true);
      fetchGigsRef.current(params)
        .catch(() => {
          // handled via toast inside gigs manager
        })
        .finally(() => {
          setIsSearching(false);
        });
    } else {
      lastFilterSignatureRef.current = filterSignature;
    }
  }, [state.filters.category, state.sortBy, locationFilter, skillsFilter, budgetMin, budgetMax, buildSearchParams]);

  useEffect(() => {
    const managerPage = gigsManager.pagination.page || 1;
    if (managerPage !== currentPage && !isSearching) {
      setCurrentPage(managerPage);
    }
  }, [gigsManager.pagination.page, currentPage, isSearching]);

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
  const totalPages = Math.max(gigsManager.pagination.totalPages || 1, 1);
  const totalResults = gigsManager.pagination.total || gigsManager.gigs.length;
  const pageSize = gigsManager.pagination.limit || 10;
  const showingFrom = filteredGigs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingTo = filteredGigs.length === 0 ? 0 : showingFrom + filteredGigs.length - 1;

  const pageNumbers = useMemo(() => {
    const pages = Math.max(totalPages, 1);
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > pages) {
      end = pages;
      start = Math.max(1, end - maxVisible + 1);
    }

    const numbers: Array<number | string> = [];
    if (start > 1) {
      numbers.push(1);
      if (start > 2) {
        numbers.push('start-ellipsis');
      }
    }
    for (let page = start; page <= end; page += 1) {
      numbers.push(page);
    }
    if (end < pages) {
      if (end < pages - 1) {
        numbers.push('end-ellipsis');
      }
      numbers.push(pages);
    }
    return numbers;
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    fetchPage(page, { keepPageState: true });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
          unlockFeePaid: 10,
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
            unlockFee: 10, // Updated to match active fee
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
      router.push(`/gigs/${paymentGig.id}#overview`);

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
    router.push(`/gigs/${gigId}#overview`);
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(cat => cat.value === category)?.label || category;
  };

  const getCategoryIcon = (category: string) => {
    return categories.find(cat => cat.value === category)?.icon || '🎯';
  };

  const handleRefresh = () => {
    gigsManager.clearCache();
    setIsSearching(true);
    fetchGigsRef.current(buildSearchParams(currentPage))
      .then(() => toast.success('Gigs refreshed'))
      .catch(() => toast.error('Failed to refresh gigs'))
      .finally(() => {
        setIsSearching(false);
      });
  };

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setActiveSearchQuery('');
    setLocationFilter('');
    setSkillsFilter('');
    setBudgetMin('');
    setBudgetMax('');
    actions.resetFilters();
    actions.setSortBy('recent');
    setCurrentPage(1);
    setIsSearching(true);
    const params = buildSearchParams(1, '');
    fetchGigsRef.current(params)
      .catch(() => {
        // handled via toast inside gigs manager
      })
      .finally(() => {
        setIsSearching(false);
      });
  }, [actions, buildSearchParams]);

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
                <CardTitle className="text-2xl font-bold">Unlock Contact Details</CardTitle>
                <p className="text-muted-foreground">
                  Unlock contact details for: <strong>{paymentGig.title}</strong>
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Bid Fee Information */}
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span className="font-medium">Unlock Fee</span>
                    </div>
                      A minimal fee is required to unlock contact details. This helps maintain quality and reduces spam.
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
        {/* Ensure filters (including dropdowns) render above gig cards and stay visible on scroll (mobile) */}
        <Card
          className={`professional-card relative z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur             `}
        >
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-foreground text-xl">
              <Search className="h-5 w-5 text-primary" />
              Find Your Perfect Gig
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2 flex gap-2">
                <InputGroup className="professional-input flex-1">
                  <InputPrefix>
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </InputPrefix>
                  <Input
                    placeholder="Search gigs, skills, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-10"
                  />
                  <InputSuffix>
                    {isSearching && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </InputSuffix>
                </InputGroup>
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-6"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              <Select
                value={state.filters.category}
                onValueChange={(value) => actions.setFilters({ category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
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
                <SelectContent className="z-[9999]">
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden space-y-4">
              <div className="flex gap-2">
                <InputGroup className="professional-input flex-1">
                  <InputPrefix>
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </InputPrefix>
                  <Input
                    placeholder="Search gigs, skills, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-10"
                  />
                  <InputSuffix>
                    {isSearching && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </InputSuffix>
                </InputGroup>
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-4"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex gap-2">
                <Dialog open={showFilters} onOpenChange={setShowFilters}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {(locationFilter || skillsFilter || budgetMin || budgetMax) && (
                        <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                          {(locationFilter ? 1 : 0) + (skillsFilter ? 1 : 0) + (budgetMin || budgetMax ? 1 : 0)}
                        </Badge>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Filter Gigs</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Category</label>
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
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Location</label>
                        <Input
                          placeholder="e.g., New York, Remote"
                          value={locationFilter}
                          onChange={(e) => setLocationFilter(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Skills (comma-separated)</label>
                        <Input
                          placeholder="e.g., React, Node.js, Python"
                          value={skillsFilter}
                          onChange={(e) => setSkillsFilter(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Budget Range</label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Min"
                            value={budgetMin}
                            onChange={(e) => setBudgetMin(e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Max"
                            value={budgetMax}
                            onChange={(e) => setBudgetMax(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Sort by</label>
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

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleClearFilters} variant="outline" className="flex-1">
                          Clear All
                        </Button>
                        <Button onClick={() => setShowFilters(false)} className="flex-1">
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {!isMobile && (
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
              )}

              <div className="text-sm text-muted-foreground">
                {totalResults} gigs found
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
                <Button onClick={handleClearFilters}>
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
              : isMobile ? "space-y-6" : "space-y-6"
            }>
              {filteredGigs.map((gig, index) => (
                <Card
                  key={`${gig._id}-${index}`}
                  className={`group relative z-0 overflow-hidden bg-card border border-border rounded-xl shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer ${state.viewMode === 'list' && !isMobile
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
                            className={`h-4 w-4 transition-all duration-200 ${state.savedGigs.includes(gig._id)
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
                      className={`text-xs font-medium px-2 py-1 ${gig.status === 'active'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : gig.status === 'paused'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                    >
                      <div className={`w-2 h-2 rounded-full mr-1.5 ${gig.status === 'active'
                        ? 'bg-green-500'
                        : gig.status === 'paused'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                        }`} />
                      {gig.status || 'Active'}
                    </Badge>
                  </div>

                  <CardHeader className={`${state.viewMode === 'list' && !isMobile ? 'pb-4 pt-4' : 'pb-3 pt-6'}`}>
                    <div className={`flex items-start justify-between ${state.viewMode === 'list' && !isMobile ? 'flex-row' : 'flex-col'}`}>
                      <div className={`flex-1 ${state.viewMode === 'list' && !isMobile ? 'pr-6' : 'pr-4'}`}>
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
                          className={`${state.viewMode === 'list' && !isMobile ? 'text-xl' : 'text-lg'} font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight`}
                        >
                          {gig.title}
                        </CardTitle>

                        {/* Description */}
                        <p className={`text-muted-foreground text-sm leading-relaxed ${state.viewMode === 'list' && !isMobile ? 'line-clamp-1' : 'line-clamp-2'} mb-3`}>
                          {(gig as any).descriptionShort || gig.description}
                        </p>
                      </div>

                    </div>
                  </CardHeader>

                  <CardContent className={`${state.viewMode === 'list' && !isMobile ? 'pt-0 pb-4' : 'space-y-4'}`}>
                    {state.viewMode === 'list' && !isMobile ? (
                      // List view layout
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          {/* Skills */}
                          {(() => {
                            const validRequirements = gig.requirements?.filter((skill): skill is string => typeof skill === 'string' && skill.trim() !== '') || [];
                            return validRequirements.length > 0 && (
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-wrap gap-1">
                                  {validRequirements.slice(0, 2).map((skill, index) => (
                                    <Badge key={index} variant="outline" className="text-xs px-2 py-1 bg-muted/50">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {validRequirements.length > 2 && (
                                    <Badge variant="outline" className="text-xs px-2 py-1 bg-muted/50">
                                      +{validRequirements.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

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
                              <span>{(gig as any).bidsCount || 0} / {formatMaxBids((gig as any).maxBids)} bids</span>
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
                                Unlock contact details
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
                        {(() => {
                          const validRequirements = gig.requirements?.filter((skill): skill is string => typeof skill === 'string' && skill.trim() !== '') || [];
                          return validRequirements.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1 mb-2">
                                <Award className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Skills Required</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {validRequirements.slice(0, 3).map((skill, index) => (
                                  <Badge key={index} variant="outline" className="text-xs px-2 py-1 bg-muted/50">
                                    {skill}
                                  </Badge>
                                ))}
                                {validRequirements.length > 3 && (
                                  <Badge variant="outline" className="text-xs px-2 py-1 bg-muted/50">
                                    +{validRequirements.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })()}

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
                                {(gig as any).bidsCount || 0} / {formatMaxBids((gig as any).maxBids)}
                              </div>
                              <div className="text-xs text-muted-foreground">Bids (Current/Limit)</div>
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
                                Unlock contact details
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

            {totalPages > 1 && (
              <div className="mt-10 flex flex-col items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  {filteredGigs.length === 0
                    ? 'Showing 0 gigs'
                    : `Showing ${showingFrom}-${showingTo} of ${totalResults} gigs`}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="min-w-[100px]"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  {pageNumbers.map((page, index) => {
                    if (typeof page === 'string') {
                      return (
                        <span key={`${page}-${index}`} className="px-2 text-muted-foreground select-none">
                          …
                        </span>
                      );
                    }
                    if (typeof page === 'number') {
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      );
                    }
                    return null;
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="min-w-[100px]"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </TooltipProvider>
  );
}
