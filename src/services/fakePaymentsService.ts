/**
 * Fake Payments Service
 * Provides realistic mock payment data for development and testing
 */

export interface FakePayment {
  _id: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending' | 'refunded';
  paymentId: string;
  orderId: string;
  method: 'card' | 'upi' | 'netbanking' | 'wallet' | 'bank_transfer';
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
  metadata?: {
    gateway?: string;
    transactionFee?: number;
    netAmount?: number;
    reference?: string;
  };
}

export interface FakePaymentStats {
  totalSpent: number;
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  refundedPayments: number;
  averagePaymentAmount: number;
  monthlySpending: number;
}

class FakePaymentsService {
  private payments: FakePayment[] = [];
  private nextId = 1;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const now = new Date();
    const mockPayments: Omit<FakePayment, '_id'>[] = [
      {
        amount: 500,
        currency: 'INR',
        status: 'success',
        paymentId: 'pay_1234567890',
        orderId: 'order_1234567890',
        method: 'card',
        description: 'Bid fee for: Website Development Project',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        bid: {
          _id: 'bid_1',
          job: {
            _id: 'job_1',
            title: 'Website Development Project'
          }
        },
        metadata: {
          gateway: 'Razorpay',
          transactionFee: 15,
          netAmount: 485,
          reference: 'TXN1234567890'
        }
      },
      {
        amount: 1000,
        currency: 'INR',
        status: 'success',
        paymentId: 'pay_0987654321',
        orderId: 'order_0987654321',
        method: 'upi',
        description: 'Bid fee for: Mobile App Development',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        bid: {
          _id: 'bid_2',
          job: {
            _id: 'job_2',
            title: 'Mobile App Development'
          }
        },
        metadata: {
          gateway: 'Razorpay',
          transactionFee: 30,
          netAmount: 970,
          reference: 'TXN0987654321'
        }
      },
      {
        amount: 750,
        currency: 'INR',
        status: 'failed',
        paymentId: 'pay_5555555555',
        orderId: 'order_5555555555',
        method: 'netbanking',
        description: 'Bid fee for: E-commerce Platform',
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        bid: {
          _id: 'bid_3',
          job: {
            _id: 'job_3',
            title: 'E-commerce Platform'
          }
        },
        metadata: {
          gateway: 'Razorpay',
          transactionFee: 22.5,
          netAmount: 0,
          reference: 'TXN5555555555'
        }
      },
      {
        amount: 1200,
        currency: 'INR',
        status: 'success',
        paymentId: 'pay_1111111111',
        orderId: 'order_1111111111',
        method: 'wallet',
        description: 'Bid fee for: AI Chatbot Development',
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        bid: {
          _id: 'bid_4',
          job: {
            _id: 'job_4',
            title: 'AI Chatbot Development'
          }
        },
        metadata: {
          gateway: 'PayU',
          transactionFee: 36,
          netAmount: 1164,
          reference: 'TXN1111111111'
        }
      },
      {
        amount: 800,
        currency: 'INR',
        status: 'pending',
        paymentId: 'pay_2222222222',
        orderId: 'order_2222222222',
        method: 'bank_transfer',
        description: 'Bid fee for: Blockchain Integration',
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        bid: {
          _id: 'bid_5',
          job: {
            _id: 'job_5',
            title: 'Blockchain Integration'
          }
        },
        metadata: {
          gateway: 'Razorpay',
          transactionFee: 24,
          netAmount: 0,
          reference: 'TXN2222222222'
        }
      },
      {
        amount: 600,
        currency: 'INR',
        status: 'refunded',
        paymentId: 'pay_3333333333',
        orderId: 'order_3333333333',
        method: 'card',
        description: 'Bid fee for: React Native App',
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        bid: {
          _id: 'bid_6',
          job: {
            _id: 'job_6',
            title: 'React Native App'
          }
        },
        metadata: {
          gateway: 'Razorpay',
          transactionFee: 18,
          netAmount: 600,
          reference: 'TXN3333333333'
        }
      },
      {
        amount: 1500,
        currency: 'INR',
        status: 'success',
        paymentId: 'pay_4444444444',
        orderId: 'order_4444444444',
        method: 'upi',
        description: 'Bid fee for: Full Stack Web Application',
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        bid: {
          _id: 'bid_7',
          job: {
            _id: 'job_7',
            title: 'Full Stack Web Application'
          }
        },
        metadata: {
          gateway: 'Razorpay',
          transactionFee: 45,
          netAmount: 1455,
          reference: 'TXN4444444444'
        }
      },
      {
        amount: 900,
        currency: 'INR',
        status: 'success',
        paymentId: 'pay_5555555556',
        orderId: 'order_5555555556',
        method: 'netbanking',
        description: 'Bid fee for: Data Analytics Dashboard',
        createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        bid: {
          _id: 'bid_8',
          job: {
            _id: 'job_8',
            title: 'Data Analytics Dashboard'
          }
        },
        metadata: {
          gateway: 'PayU',
          transactionFee: 27,
          netAmount: 873,
          reference: 'TXN5555555556'
        }
      }
    ];

    this.payments = mockPayments.map(payment => ({
      ...payment,
      _id: `payment_${this.nextId++}`
    }));
  }

  // Get all payments with optional filtering
  getPayments(filters?: {
    status?: string;
    method?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    page?: number;
  }): { payments: FakePayment[]; total: number; page: number; pages: number } {
    let filteredPayments = [...this.payments];

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      filteredPayments = filteredPayments.filter(p => p.status === filters.status);
    }

    if (filters?.method && filters.method !== 'all') {
      filteredPayments = filteredPayments.filter(p => p.method === filters.method);
    }

    if (filters?.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filteredPayments = filteredPayments.filter(p => new Date(p.createdAt) >= fromDate);
    }

    if (filters?.dateTo) {
      const toDate = new Date(filters.dateTo);
      filteredPayments = filteredPayments.filter(p => new Date(p.createdAt) <= toDate);
    }

    // Sort by creation date (newest first)
    filteredPayments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

    return {
      payments: paginatedPayments,
      total: filteredPayments.length,
      page,
      pages: Math.ceil(filteredPayments.length / limit)
    };
  }

  // Get payment by ID
  getPaymentById(id: string): FakePayment | null {
    return this.payments.find(p => p._id === id) || null;
  }

  // Get payment statistics
  getPaymentStats(): FakePaymentStats {
    const successfulPayments = this.payments.filter(p => p.status === 'success');
    const failedPayments = this.payments.filter(p => p.status === 'failed');
    const pendingPayments = this.payments.filter(p => p.status === 'pending');
    const refundedPayments = this.payments.filter(p => p.status === 'refunded');

    const totalSpent = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
    const averagePaymentAmount = this.payments.length > 0 ? totalSpent / this.payments.length : 0;

    // Calculate monthly spending (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlySpending = successfulPayments
      .filter(p => new Date(p.createdAt) >= thirtyDaysAgo)
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalSpent,
      totalPayments: this.payments.length,
      successfulPayments: successfulPayments.length,
      failedPayments: failedPayments.length,
      pendingPayments: pendingPayments.length,
      refundedPayments: refundedPayments.length,
      averagePaymentAmount,
      monthlySpending
    };
  }

  // Create a new payment (for testing)
  createPayment(paymentData: Omit<FakePayment, '_id' | 'createdAt' | 'updatedAt'>): FakePayment {
    const now = new Date().toISOString();
    const newPayment: FakePayment = {
      ...paymentData,
      _id: `payment_${this.nextId++}`,
      createdAt: now,
      updatedAt: now
    };

    this.payments.unshift(newPayment); // Add to beginning
    return newPayment;
  }

  // Update payment status
  updatePaymentStatus(id: string, status: FakePayment['status']): FakePayment | null {
    const payment = this.payments.find(p => p._id === id);
    if (payment) {
      payment.status = status;
      payment.updatedAt = new Date().toISOString();
      return payment;
    }
    return null;
  }

  // Delete payment
  deletePayment(id: string): boolean {
    const index = this.payments.findIndex(p => p._id === id);
    if (index !== -1) {
      this.payments.splice(index, 1);
      return true;
    }
    return false;
  }

  // Get payments by date range
  getPaymentsByDateRange(startDate: string, endDate: string): FakePayment[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.payments.filter(payment => {
      const paymentDate = new Date(payment.createdAt);
      return paymentDate >= start && paymentDate <= end;
    });
  }

  // Get payments by method
  getPaymentsByMethod(method: string): FakePayment[] {
    return this.payments.filter(p => p.method === method);
  }

  // Get recent payments
  getRecentPayments(limit: number = 5): FakePayment[] {
    return this.payments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Simulate payment processing delay
  async simulatePaymentProcessing(paymentId: string, delay: number = 2000): Promise<FakePayment | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const payment = this.getPaymentById(paymentId);
        if (payment && payment.status === 'pending') {
          // Simulate random success/failure
          const success = Math.random() > 0.1; // 90% success rate
          payment.status = success ? 'success' : 'failed';
          payment.updatedAt = new Date().toISOString();
        }
        resolve(payment);
      }, delay);
    });
  }

  // Reset to initial mock data
  reset(): void {
    this.payments = [];
    this.nextId = 1;
    this.initializeMockData();
  }
}

// Create and export singleton instance
export const fakePaymentsService = new FakePaymentsService();
export default fakePaymentsService;


