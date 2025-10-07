# Payment Integration Guide

## Overview

The job portal now includes a comprehensive fake payment system for testing and demonstration purposes. This system simulates real payment processing without requiring actual payment gateway credentials.

## Features

### 1. Fake Payment Service
- **Location**: `src/services/fakePaymentsService.ts`
- **Purpose**: Provides realistic mock payment data and processing
- **Features**:
  - Multiple payment methods (Card, UPI, Net Banking, Digital Wallet)
  - Realistic processing times for each method
  - 95% success rate simulation
  - Payment history tracking
  - Statistics and analytics

### 2. Fake Gig Payment Component
- **Location**: `src/components/payment/FakeGigPayment.tsx`
- **Purpose**: Interactive payment interface for gig payments
- **Features**:
  - Payment method selection
  - Real-time processing simulation
  - Success/failure states
  - Responsive design
  - User-friendly error handling

### 3. API Endpoints
- **Gig Payments**: `/api/fake-payments/gig`
  - `POST`: Process gig payments
  - `GET`: Retrieve payments for specific gigs
- **General Payments**: `/api/fake-payments`
  - `POST`: Create new payments
  - `GET`: List all payments with filtering

## Integration Points

### 1. Gig Detail Page (`/gig/[id]`)
- **Payment Button**: "Pay for Gig" button in the action sidebar
- **Payment Info Card**: Displays gig budget and payment details
- **Full-screen Payment Modal**: Complete payment flow

### 2. Bid Page (`/gig/[id]/bid`)
- **Bid Fee Payment**: Required payment before placing bids
- **Modal Payment Interface**: Overlay payment component
- **Payment Recording**: All payments are tracked in the system

## Usage

### For Gig Payments:
1. Navigate to any gig detail page
2. Click "Pay for Gig" button
3. Select payment method
4. Complete the payment process
5. Payment is automatically recorded

### For Bid Payments:
1. Navigate to bid page for a gig
2. Fill in bid details
3. Click "Place Bid" button
4. Complete payment for bid fee
5. Bid is submitted after successful payment

## Configuration

### Environment Variables (Optional)
If you want to use real Razorpay payments instead of fake payments:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

### Fallback Behavior
- If Razorpay credentials are not configured, the system automatically falls back to fake payment mode
- No real money is charged in fake payment mode
- All payments are recorded for tracking and analytics

## Payment Methods Supported

1. **Credit/Debit Card** - Instant processing
2. **UPI** - Instant processing  
3. **Net Banking** - 2-5 minutes processing
4. **Digital Wallet** - Instant processing

## Security Features

- Clear indicators that payments are fake/demo
- No real financial data is processed
- All transactions are logged for debugging
- User-friendly error messages

## Development Notes

- The fake payment service is a singleton that persists data in memory
- Payment data is reset when the server restarts
- All payment methods have realistic processing times
- Success/failure rates are configurable in the service

## Testing

- All payment flows can be tested without real payment gateways
- Payment success/failure can be simulated
- Payment history can be viewed in the admin panel
- Statistics are automatically calculated

## Future Enhancements

- Database persistence for payment data
- More payment methods
- Payment analytics dashboard
- Integration with real payment gateways
- Payment refund functionality
