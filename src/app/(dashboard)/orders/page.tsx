import React from 'react';
import OrderManagement from '@/components/orders/OrderManagement';

export const metadata = {
  title: 'Orders',
  description: 'Track and manage your service orders.'
};

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold mb-2">As Buyer</h2>
          <OrderManagement role="buyer" />
        </div>
        <div>
          <h2 className="font-semibold mb-2">As Seller</h2>
          <OrderManagement role="seller" />
        </div>
      </div>
    </div>
  );
}


