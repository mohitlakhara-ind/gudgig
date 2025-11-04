'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Download, 
  DollarSign, 
  Calendar, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  User,
  CreditCard,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentLog {
  _id: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending' | 'refunded';
  paymentId: string;
  orderId: string;
  method: string;
  description: string;
  userId: string;
  userEmail: string;
  userName: string;
  bidId?: string;
  jobId?: string;
  jobTitle?: string;
  createdAt: string;
  updatedAt: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
}

export default function PaymentLogsPage() {
  const [payments, setPayments] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchPaymentLogs();
  }, [pagination.page, statusFilter, methodFilter, dateFilter]);

  const fetchPaymentLogs = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (methodFilter !== 'all') params.method = methodFilter;
      // dateFilter could be mapped to dateFrom/dateTo if needed

  const response = await apiClient.getPayments(params);
      const list = Array.isArray(response?.data) ? response.data : [];

      const normalized: PaymentLog[] = list.map((p: any) => ({
        _id: p._id,
        amount: p.amount,
        currency: p.currency || 'INR',
        status: p.status,
        paymentId: p.paymentId,
        orderId: p.orderId,
        method: p.method,
        description: p.description || 'Payment',
        userId: p.userId || '',
        userEmail: p.userEmail || '',
        userName: p.userName || '',
        bidId: p.bid?._id,
        jobId: p.bid?.job?._id,
        jobTitle: p.bid?.job?.title,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        refundAmount: p.refundAmount,
        refundReason: p.refundReason,
        refundedAt: p.refundedAt,
      }));

      setPayments(normalized);
      const total = (response as any)?.meta?.total ?? normalized.length;
      const pages = (response as any)?.meta?.pages ?? 1;
      setPagination(prev => ({ ...prev, total, totalPages: pages }));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch payment logs');
      setPayments([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'failed':
        return 'bg-error/10 text-error border-error/20';
      case 'refunded':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-warning/10 text-warning border-warning/20';
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
    }).format(amount / 100);
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

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'upi':
        return <div className="w-4 h-4 bg-success/10 rounded flex items-center justify-center">
          <span className="text-success font-bold text-xs">UPI</span>
        </div>;
      case 'netbanking':
        return <div className="w-4 h-4 bg-primary/10 rounded flex items-center justify-center">
          <span className="text-primary font-bold text-xs">NB</span>
        </div>;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = (payment.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (payment.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (payment.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (payment.paymentId || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalRevenue = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunds = payments
    .filter(p => p.status === 'refunded')
    .reduce((sum, p) => sum + (p.refundAmount || 0), 0);

  const netRevenue = totalRevenue - totalRefunds;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading payment logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Payment Logs</h1>
            <p className="text-muted-foreground">
              Track all payment transactions and revenue
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-success">{formatAmount(totalRevenue)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Net Revenue</p>
                    <p className="text-2xl font-bold text-primary">{formatAmount(netRevenue)}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Refunds</p>
                    <p className="text-2xl font-bold text-error">{formatAmount(totalRefunds)}</p>
                  </div>
                  <Download className="h-8 w-8 text-error" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold">{payments.length}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search payments by user, description, or payment ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    <option value="all">All Methods</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="netbanking">Net Banking</option>
                  </select>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Button */}
          <div className="flex justify-end mb-6">
            <Button variant="outline" onClick={() => toast.error('Export functionality coming soon')}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Payments List */}
          {filteredPayments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No payments found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || statusFilter !== 'all' || methodFilter !== 'all' || dateFilter !== 'all'
                    ? 'No payments match your current filters.' 
                    : 'No payment transactions have been recorded yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <Card key={payment._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Payment Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">
                              {payment.description}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {payment.userName} ({payment.userEmail})
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
                          <div className="flex items-center gap-1">
                            <span>ID: {payment.paymentId}</span>
                          </div>
                          {payment.jobTitle && (
                            <div className="flex items-center gap-1">
                              <span>For: {payment.jobTitle}</span>
                            </div>
                          )}
                        </div>

                        {payment.status === 'refunded' && payment.refundAmount && (
                          <div className="mt-3 p-3 bg-error/10 border border-error/20 rounded-lg">
                            <div className="flex items-center gap-2 text-error">
                              <Download className="h-4 w-4" />
                              <span className="font-medium">Refunded: {formatAmount(payment.refundAmount)}</span>
                            </div>
                            {payment.refundReason && (
                              <p className="text-sm text-error mt-1">Reason: {payment.refundReason}</p>
                            )}
                            {payment.refundedAt && (
                              <p className="text-xs text-error mt-1">
                                Refunded on: {formatDate(payment.refundedAt)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Amount and Actions */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            payment.status === 'refunded' ? 'text-red-600' : 
                            payment.status === 'success' ? 'text-success' : 'text-primary'
                          }`}>
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
                            onClick={() => toast.error('View details coming soon')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                          
                          {payment.status === 'success' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toast.error('Refund functionality coming soon')}
                            >
                              Process Refund
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


