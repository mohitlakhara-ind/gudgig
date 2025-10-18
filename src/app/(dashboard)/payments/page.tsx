'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Download, 
  CreditCard, 
  Calendar, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Filter,
  TrendingUp,
  BarChart3,
  Receipt,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Payment {
  _id: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending' | 'refunded';
  paymentId: string;
  orderId: string;
  method: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  bid?: {
    _id: string;
    job: {
      _id: string;
      title: string;
    };
  };
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, []);

  // Refetch payments when status filter changes
  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPayments({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 50
      });
      
      if (response.success && response.data) {
        setPayments(response.data);
      } else {
        setPayments([]);
      }
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast.error(error.message || 'Failed to fetch payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.getPaymentStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  const handleCreateTestPayment = async () => {
    try {
      const testPayment = {
        amount: Math.floor(Math.random() * 2000) + 500,
        currency: 'INR',
        status: 'pending',
        paymentId: `pay_test_${Date.now()}`,
        orderId: `order_test_${Date.now()}`,
        method: ['card', 'upi', 'netbanking', 'wallet'][Math.floor(Math.random() * 4)],
        description: `Test payment for: ${['Website Design', 'Mobile App', 'Logo Design', 'Content Writing'][Math.floor(Math.random() * 4)]}`,
        bid: {
          _id: `bid_test_${Date.now()}`,
          job: {
            _id: `job_test_${Date.now()}`,
            title: 'Test Project'
          }
        }
      };

      const response = await apiClient.createFakePayment(testPayment);
      if (response.success) {
        toast.success('Test payment created successfully');
        fetchPayments();
        fetchStats();
      }
    } catch (error) {
      console.error('Error creating test payment:', error);
      toast.error('Failed to create test payment');
    }
  };

  const handleUpdatePaymentStatus = async (id: string, status: string) => {
    try {
      const response = await apiClient.updateFakePaymentStatus(id, status);
      if (response.success) {
        toast.success('Payment status updated successfully');
        fetchPayments();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      const response = await apiClient.deleteFakePayment(id);
      if (response.success) {
        toast.success('Payment deleted successfully');
        fetchPayments();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Failed to delete payment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'refunded':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'refunded':
        return <Download className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const generateReceiptHtml = (payment: Payment) => {
    const amount = formatAmount(payment.amount);
    const createdAt = formatDate(payment.createdAt);
    const status = payment.status.toUpperCase();
    const jobTitle = payment.bid?.job?.title || 'N/A';
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Payment Receipt - ${payment.paymentId}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'; margin: 24px; color: #0f172a; }
      .receipt { max-width: 720px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; }
      .header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 16px; }
      .brand { display:flex; align-items:center; gap: 8px; font-weight: 700; color: #0ea5e9; }
      .muted { color:#64748b; font-size: 12px; }
      .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .row { display:flex; justify-content:space-between; gap: 16px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
      .label { color:#64748b; }
      .value { font-weight: 600; }
      .amount { font-size: 20px; font-weight: 700; color:#0ea5e9; }
      .status { padding: 4px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; }
      .status-success { background:#dcfce7; color:#15803d; }
      .status-failed { background:#fee2e2; color:#b91c1c; }
      .status-pending { background:#fef3c7; color:#a16207; }
      .status-refunded { background:#dbeafe; color:#1d4ed8; }
      .footer { margin-top: 16px; display:flex; justify-content:space-between; align-items:center; }
      .btn { display:inline-block; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; text-decoration:none; color:#0f172a; }
    </style>
  </head>
  <body>
    <div class="receipt">
      <div class="header">
        <div class="brand">Gigs Mint <span class="muted">Payment Receipt</span></div>
        <div class="muted">${createdAt}</div>
      </div>
      <div class="row"><span class="label">Payment ID</span><span class="value">${payment.paymentId}</span></div>
      <div class="row"><span class="label">Order ID</span><span class="value">${payment.orderId}</span></div>
      <div class="row"><span class="label">Amount</span><span class="amount">${amount} ${payment.currency}</span></div>
      <div class="row"><span class="label">Status</span><span class="value"><span class="status status-${payment.status}">${status}</span></span></div>
      <div class="row"><span class="label">Method</span><span class="value">${payment.method}</span></div>
      <div class="row"><span class="label">Gig</span><span class="value">${jobTitle}</span></div>
      <div class="row" style="border-bottom:0"><span class="label">Description</span><span class="value">${payment.description}</span></div>
      <div class="footer">
        <span class="muted">This is a system-generated receipt.</span>
        <a href="#" class="btn" onclick="window.print(); return false;">Print</a>
      </div>
    </div>
  </body>
  </html>`;
  };

  const handleViewReceipt = (payment: Payment) => {
    try {
      const html = generateReceiptHtml(payment);
      const win = window.open('', '_blank');
      if (!win) return toast.error('Popup blocked. Allow popups to view receipt.');
      win.document.open();
      win.document.write(html);
      win.document.close();
    } catch (e) {
      console.error('Failed to open receipt', e);
      toast.error('Unable to generate receipt');
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'upi':
        return <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
          <span className="text-green-600 font-bold text-xs">UPI</span>
        </div>;
      case 'netbanking':
        return <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
          <span className="text-blue-600 font-bold text-xs">NB</span>
        </div>;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const filteredAndSortedPayments = payments
    .filter(payment => {
      const matchesSearch = payment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           payment.paymentId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const paymentDate = new Date(payment.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'today':
            matchesDate = daysDiff === 0;
            break;
          case 'week':
            matchesDate = daysDiff <= 7;
            break;
          case 'month':
            matchesDate = daysDiff <= 30;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'amount-high':
          return b.amount - a.amount;
        case 'amount-low':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

  // Use stats from fake service if available, otherwise calculate from current payments
  const calculatedStats = stats || {
    totalSpent: payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0),
    totalPayments: payments.length,
    successfulPayments: payments.filter(p => p.status === 'success').length,
    failedPayments: payments.filter(p => p.status === 'failed').length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading payment history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Payment History</h1>
          <p className="text-muted-foreground">Track all your bid payments and transactions</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleCreateTestPayment}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Test Payment
          </Button>
          <Button asChild>
            <Link href="/gigs">
              <CreditCard className="h-4 w-4 mr-2" />
              Browse Gigs
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{formatAmount(calculatedStats.totalSpent)}</div>
                <div className="text-xs text-muted-foreground">Total Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{calculatedStats.totalPayments}</div>
                <div className="text-xs text-muted-foreground">Total Payments</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">{calculatedStats.successfulPayments}</div>
                <div className="text-xs text-muted-foreground">Successful</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">{calculatedStats.failedPayments}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments by description or payment ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount-high">Amount (High)</SelectItem>
                  <SelectItem value="amount-low">Amount (Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      {filteredAndSortedPayments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No payments found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'No payments match your current filters.' 
                : 'You haven\'t made any payments yet.'}
            </p>
            <Button asChild>
              <Link href="/gigs">
                <CreditCard className="h-4 w-4 mr-2" />
                Browse Available Gigs
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedPayments.map((payment) => (
            <Card key={payment._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Payment Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          {payment.description}
                        </h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            Payment ID: {payment.paymentId}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(payment.createdAt)}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(payment.status)}`}
                      >
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status}</span>
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(payment.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getMethodIcon(payment.method)}
                        <span className="capitalize">{payment.method}</span>
                      </div>
                      {payment.bid && (
                        <div className="flex items-center gap-1">
                          <span>For: {payment.bid.job.title}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amount and Action */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatAmount(payment.amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {payment.currency}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewReceipt(payment)}
                        title="View and print receipt"
                      >
                        <Receipt className="h-4 w-4 mr-2" />
                        View Receipt
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
