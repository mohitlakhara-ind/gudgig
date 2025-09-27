import React, { useCallback, useMemo } from 'react';
import useOrders from '@/hooks/useOrders';

interface OrderManagementProps {
  role?: 'buyer' | 'seller';
}

export default function OrderManagement({ role }: OrderManagementProps) {
  const { orders, isLoading, error, fetchOrders, updateOrderStatus, deliverOrder } = useOrders(role);

  const grouped = useMemo(() => {
    const map: Record<string, typeof orders> = {} as any;
    for (const o of orders) {
      map[o.status] = map[o.status] || [];
      map[o.status].push(o);
    }
    return map;
  }, [orders]);

  const markInProgress = useCallback(async (id: string) => {
    await updateOrderStatus(id, 'in_progress');
    fetchOrders();
  }, [updateOrderStatus, fetchOrders]);

  const markCompleted = useCallback(async (id: string) => {
    await updateOrderStatus(id, 'completed');
    fetchOrders();
  }, [updateOrderStatus, fetchOrders]);

  const submitDelivery = useCallback(async (id: string) => {
    await deliverOrder(id, { message: 'Delivery submitted' });
    fetchOrders();
  }, [deliverOrder, fetchOrders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <select className="border rounded px-3 py-2" onChange={(e) => fetchOrders(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="disputed">Disputed</option>
        </select>
      </div>

      {isLoading && <div>Loading orders...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {Object.entries(grouped).map(([status, list]) => (
        <div key={status} className="space-y-3">
          <h3 className="font-semibold capitalize">{status.replace('_', ' ')}</h3>
          <div className="space-y-3">
            {list.map((o) => (
              <div key={o._id} className="rounded border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{typeof o.service === 'string' ? o.service : (o.service as any)?.title}</div>
                    <div className="text-sm text-gray-600">Package: {o.package.name} · ${o.package.price}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {role === 'seller' && o.status === 'pending' && (
                      <button className="px-3 py-1 rounded border" onClick={() => markInProgress(o._id)}>Start</button>
                    )}
                    {role === 'seller' && o.status === 'in_progress' && (
                      <button className="px-3 py-1 rounded border" onClick={() => submitDelivery(o._id)}>Deliver</button>
                    )}
                    {role === 'buyer' && o.status === 'delivered' && (
                      <button className="px-3 py-1 rounded border" onClick={() => markCompleted(o._id)}>Approve</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


