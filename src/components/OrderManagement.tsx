import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { OrderService } from '../services/orderService.ts';
import { Order, OrderStatus } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { supabase } from '../services/supabaseClient.ts';

// Parse "Paired with #0042" from admin_notes
const getPairedOrderNumber = (adminNotes?: string): number | null => {
  if (!adminNotes) return null;
  const match = adminNotes.match(/Paired with #(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

const OrderManagement: React.FC = () => {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [trackingNumbers, setTrackingNumbers] = useState<Record<string, string>>({});
  const [shippingCarriers, setShippingCarriers] = useState<Record<string, string>>({});
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const [filter, setFilter] = useState<OrderStatus | 'all' | 'combined'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await OrderService.getAllOrders();
      setOrders(data);
      const initialNotes: Record<string, string> = {};
      const initialTracking: Record<string, string> = {};
      const initialCarriers: Record<string, string> = {};
      data.forEach(o => {
        if (o.admin_notes) initialNotes[o.id] = o.admin_notes;
        if (o.tracking_number) initialTracking[o.id] = o.tracking_number;
        if (o.shipping_carrier) initialCarriers[o.id] = o.shipping_carrier;
      });
      setAdminNotes(initialNotes);
      setTrackingNumbers(initialTracking);
      setShippingCarriers(initialCarriers);
    } catch (error) {
      console.error('Failed to load orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadOrders();

      const channel = supabase.channel('realtime_admin_orders')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
          showToast('🔔 🚨 NEW ORDER RECEIVED! Refreshing dashboard...', 'success');
          loadOrders();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile]);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      setActionLoading(orderId);
      const trackingNumber = trackingNumbers[orderId];
      const shippingCarrier = shippingCarriers[orderId];
      if (status === OrderStatus.Shipped && (!trackingNumber || !shippingCarrier)) {
        showToast('Please enter both a tracking number and shipping company.', 'error');
        return;
      }
      await OrderService.updateOrderStatus(orderId, status, trackingNumber, adminNotes[orderId], shippingCarrier);

      const order = orders.find(o => o.id === orderId);
      if (order) {
        // Staff reminder for combined orders when confirming
        if (status === OrderStatus.Confirmed) {
          const pairedNum = getPairedOrderNumber(order.admin_notes);
          const isPairedTo = orders.find(o => getPairedOrderNumber(o.admin_notes) === order.order_number);
          if (pairedNum || isPairedTo) {
            const linkedNum = pairedNum ?? isPairedTo?.order_number;
            showToast(
              `⚠️ Combined order! Remember to also confirm Order #${String(linkedNum).padStart(4, '0')} before shipping them together.`,
              'error',
              7000
            );
          }
        }

        if (status === OrderStatus.Confirmed) {
          await OrderService.sendConfirmedEmail({
            order_number: order.order_number,
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            property_title: order.property_title || 'Gold Item',
          });
        }
        if (status === OrderStatus.Shipped && trackingNumber && shippingCarrier) {
          await OrderService.sendShippedEmail({
            order_number: order.order_number,
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            property_title: order.property_title || 'Gold Item',
            tracking_number: trackingNumber,
            shipping_carrier: shippingCarrier,
          });
        }
      }

      if (status !== OrderStatus.Confirmed || !orders.find(o => o.id === orderId && (getPairedOrderNumber(o.admin_notes) || orders.find(x => getPairedOrderNumber(x.admin_notes) === o.order_number)))) {
        showToast(`Order marked as ${status}`);
      }
      await loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      showToast('Failed to update order status.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveNote = async (order: Order) => {
    try {
      setActionLoading(order.id + '_note');
      await OrderService.updateOrderStatus(order.id, order.status, order.tracking_number, adminNotes[order.id]);
      showToast('Admin note saved successfully');
      await loadOrders();
    } catch (error) {
      console.error('Error saving note:', error);
      showToast('Failed to save admin note.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTrackingChange = (orderId: string, value: string) => {
    setTrackingNumbers(prev => ({ ...prev, [orderId]: value }));
  };

  const handleNoteChange = (orderId: string, value: string) => {
    setAdminNotes(prev => ({ ...prev, [orderId]: value }));
  };

  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders;
    if (filter === 'combined') return orders.filter(o => o.admin_notes?.includes('[COMBINED SHIPPING]'));
    return orders.filter(o => o.status === filter);
  }, [orders, filter]);

  // For non-combined tabs: group paired orders together if both are in the same filtered view
  const renderGroups = useMemo(() => {
    if (filter === 'combined') return [];
    const seen = new Set<string>();
    const groups: Array<{ type: 'standalone'; order: Order } | { type: 'combined'; orders: Order[] }> = [];

    for (const order of filteredOrders) {
      if (seen.has(order.id)) continue;

      const pairedNum = getPairedOrderNumber(order.admin_notes);
      if (pairedNum) {
        const originalOrder = filteredOrders.find(o => o.order_number === pairedNum);
        if (originalOrder && !seen.has(originalOrder.id)) {
          groups.push({ type: 'combined', orders: [order, originalOrder] });
          seen.add(order.id);
          seen.add(originalOrder.id);
          continue;
        }
      } else {
        const combiner = filteredOrders.find(o => !seen.has(o.id) && getPairedOrderNumber(o.admin_notes) === order.order_number);
        if (combiner) {
          groups.push({ type: 'combined', orders: [combiner, order] });
          seen.add(combiner.id);
          seen.add(order.id);
          continue;
        }
      }

      groups.push({ type: 'standalone', order });
      seen.add(order.id);
    }

    return groups;
  }, [filteredOrders, filter]);

  // For Combined tab: show ONLY the actual pair (combined order + its specific original)
  const combinedPairs = useMemo(() => {
    if (filter !== 'combined') return [];
    const combinedOrders = orders.filter(o => o.admin_notes?.includes('[COMBINED SHIPPING]'));
    return combinedOrders.map(combinedOrder => {
      const pairedNum = getPairedOrderNumber(combinedOrder.admin_notes);
      const originalOrder = pairedNum ? (orders.find(o => o.order_number === pairedNum) || null) : null;
      return { combinedOrder, originalOrder };
    });
  }, [orders, filter]);

  // For a standalone order, get a pairing label if its pair is in a different status tab
  const getStandalonePairingLabel = (order: Order): string | null => {
    const pairedNum = getPairedOrderNumber(order.admin_notes);
    if (pairedNum) return `Paired w/ #${String(pairedNum).padStart(4, '0')}`;
    const combiner = orders.find(o => getPairedOrderNumber(o.admin_notes) === order.order_number);
    if (combiner) return `Combined w/ #${String(combiner.order_number).padStart(4, '0')}`;
    return null;
  };

  if (profile?.role !== 'admin') return null;

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending: return 'bg-amber-100 text-amber-800 border-amber-200';
      case OrderStatus.Confirmed: return 'bg-blue-100 text-blue-800 border-blue-200';
      case OrderStatus.Shipped: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case OrderStatus.Cancelled: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  const isEmpty = filter === 'combined' ? combinedPairs.length === 0 : renderGroups.length === 0;

  // Renders a single order row for the main 7-column table
  const renderOrderRow = (order: Order, pairingLabel?: string | null, rowClass?: string) => (
    <tr key={order.id} className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors ${rowClass || ''}`}>
      <td className="px-6 py-4 align-top w-28">
        <span className="text-[13px] font-black font-mono text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-700 select-all block w-max">
          #{String(order.order_number).padStart(4, '0')}
        </span>
        {pairingLabel && (
          <div className="mt-2 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1.5 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center gap-1 w-max">
            <span className="material-icons text-[12px]">call_merge</span>
            {pairingLabel}
          </div>
        )}
      </td>
      <td className="px-6 py-4 align-top min-w-[200px]">
        {order.property_slug ? (
          <Link to={`/item/${order.property_slug}`} className="flex items-center gap-3 hover:opacity-80 group inline-flex max-w-full">
            {order.property_image && (
              <img src={order.property_image} alt={order.property_title} className="w-10 h-10 rounded-lg object-cover bg-zinc-100 group-hover:ring-2 ring-primary transition-all flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover:text-primary transition-colors">{order.property_title || 'Unknown Item'}</p>
              <p className="text-xs text-zinc-500 truncate">{order.property_city || '—'}</p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3 w-full">
            {order.property_image && (
              <img src={order.property_image} alt={order.property_title} className="w-10 h-10 rounded-lg object-cover bg-zinc-100 flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{order.property_title || 'Unknown Item'}</p>
              <p className="text-xs text-zinc-500 truncate">{order.property_city || '—'}</p>
            </div>
          </div>
        )}
      </td>
      <td className="px-6 py-4 align-top">
        <p className="text-sm font-bold text-zinc-900 dark:text-white">{order.customer_name}</p>
        <p className="text-xs text-zinc-500">{order.customer_email}</p>
        <p className="text-xs text-zinc-500">{order.customer_phone}</p>
        <div className="mt-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Shipping To:</p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 break-words mt-0.5 w-48 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-2 border border-zinc-100 dark:border-zinc-800">
            {order.shipping_address}
          </p>
        </div>
      </td>
      <td className="px-6 py-4 align-top">
        <div className="w-56 text-right flex flex-col items-end">
          <textarea
            value={adminNotes[order.id] || ''}
            onChange={(e) => handleNoteChange(order.id, e.target.value)}
            placeholder="Add private note (e.g. WA chat, payment proof)..."
            className={`w-full text-xs p-2 rounded-lg border ${pairingLabel ? 'border-red-400 bg-red-50/50 dark:bg-red-900/10' : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800'} focus:outline-none focus:border-primary resize-none h-24`}
          />
          {adminNotes[order.id] !== (order.admin_notes || '') && (
            <button
              onClick={() => handleSaveNote(order)}
              disabled={actionLoading === order.id + '_note'}
              className="mt-1 text-[10px] bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-2 py-1 rounded hover:bg-zinc-300 transition-colors"
            >
              Save Note
            </button>
          )}
        </div>
      </td>
      <td className="px-6 py-4 align-top min-w-[120px]">
        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
          ₱{order.amount.toLocaleString()}
        </span>
        <p className="text-[10px] text-zinc-400 mt-1">
          {new Date(order.created_at).toLocaleDateString()}
        </p>
      </td>
      <td className="px-6 py-4 align-top">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
        {order.tracking_number && (
          <div className="mt-2 bg-zinc-50 dark:bg-zinc-800/50 rounded border border-zinc-100 dark:border-zinc-700 p-1.5 inline-block">
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Tracking:</p>
            <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300 mt-0.5">{order.tracking_number}</p>
          </div>
        )}
      </td>
      <td className="px-6 py-4 align-top w-48">
        <div className="flex flex-col items-end gap-2">
          {order.status === OrderStatus.Pending && (
            <div className="flex items-center gap-1.5 w-full justify-end">
              <button
                onClick={() => handleUpdateStatus(order.id, OrderStatus.Confirmed)}
                disabled={actionLoading === order.id}
                className="text-xs font-bold px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 inline-flex items-center whitespace-nowrap"
              >
                <span className="material-icons text-[14px] mr-1">check</span> Confirm
              </button>
              <button
                onClick={() => handleUpdateStatus(order.id, OrderStatus.Cancelled)}
                disabled={actionLoading === order.id}
                className="text-xs font-bold px-2.5 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
          {order.status === OrderStatus.Confirmed && (
            <div className="flex flex-col items-end gap-1.5 w-full">
              <input
                type="text"
                placeholder="Tracking #"
                value={trackingNumbers[order.id] || ''}
                onChange={(e) => handleTrackingChange(order.id, e.target.value)}
                className="text-xs w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                placeholder="Shipping company (e.g. LBC, DHL)"
                value={shippingCarriers[order.id] || ''}
                onChange={(e) => setShippingCarriers(prev => ({ ...prev, [order.id]: e.target.value }))}
                className="text-xs w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleUpdateStatus(order.id, OrderStatus.Shipped)}
                disabled={actionLoading === order.id || !trackingNumbers[order.id] || !shippingCarriers[order.id]}
                className="text-xs font-bold px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 inline-flex items-center justify-center w-full"
              >
                <span className="material-icons text-[14px] mr-1">local_shipping</span> Ship
              </button>
            </div>
          )}
          {order.status === OrderStatus.Shipped && (
            <p className="text-[10px] text-zinc-400 italic text-right whitespace-nowrap">Waiting delivery</p>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mt-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-bold animate-fade-in max-w-md text-center ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-white">Order Requests</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Manage customer purchase requests</p>
          </div>
          <button
            onClick={loadOrders}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl font-bold text-sm hover:text-primary transition-all"
          >
            <span className={`material-icons text-base ${isLoading ? 'animate-spin' : ''}`}>sync</span>
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
          {['all', 'pending', 'confirmed', 'shipped', 'cancelled', 'combined'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors whitespace-nowrap ${
                filter === f
                  ? f === 'combined' ? 'bg-red-500 text-white shadow-md' : 'bg-zinc-800 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800'
              }`}
            >
              {f === 'combined' && <span className="material-icons text-[12px] mr-1 align-middle">call_merge</span>}
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <span className="material-icons animate-spin text-primary text-3xl">sync</span>
        </div>
      ) : isEmpty ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
            <span className="material-icons text-zinc-300 dark:text-zinc-600 text-3xl">shopping_bag</span>
          </div>
          <p className="text-zinc-500 font-medium">No order requests found</p>
        </div>

      ) : filter === 'combined' ? (
        /* ── COMBINED TAB: show exact pairs only ── */
        <div className="p-6 space-y-6 bg-zinc-50/50 dark:bg-zinc-900/50">
          {combinedPairs.map(({ combinedOrder, originalOrder }) => {
            const groupOrders = originalOrder
              ? [combinedOrder, originalOrder]
              : [combinedOrder];
            return (
              <div key={combinedOrder.id} className="bg-white dark:bg-zinc-900 border-2 border-red-500 rounded-2xl overflow-hidden shadow-lg shadow-red-500/10">
                <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-100 dark:border-red-900/50 flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-black text-red-600 dark:text-red-400 flex items-center gap-2">
                    <span className="material-icons">local_shipping</span>
                    Ship these {groupOrders.length} items together!
                  </h3>
                  <span className="text-xs font-bold text-red-500">{combinedOrder.customer_email}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {groupOrders.map((order) => {
                        const isCombined = order.admin_notes?.includes('[COMBINED SHIPPING]');
                        const pairedOrderNum = isCombined
                          ? getPairedOrderNumber(order.admin_notes)
                          : combinedOrder.order_number;
                        const pairingLabel = isCombined
                          ? `Paired w/ #${String(pairedOrderNum).padStart(4, '0')}`
                          : `Combined w/ #${String(combinedOrder.order_number).padStart(4, '0')}`;
                        return (
                          <tr key={order.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                            <td className="px-6 py-4 align-top w-28">
                              <span className="text-[13px] font-black font-mono text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-700 select-all block w-max">
                                #{String(order.order_number).padStart(4, '0')}
                              </span>
                              <div className="mt-2 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1.5 rounded-lg flex items-center gap-1 w-max">
                                <span className="material-icons text-[12px]">call_merge</span>
                                {pairingLabel}
                              </div>
                            </td>
                            <td className="px-6 py-4 align-top min-w-[200px]">
                              {order.property_slug ? (
                                <Link to={`/item/${order.property_slug}`} className="flex items-center gap-3 hover:opacity-80 group inline-flex max-w-full">
                                  {order.property_image && (
                                    <img src={order.property_image} alt={order.property_title} className="w-10 h-10 rounded-lg object-cover bg-zinc-100 group-hover:ring-2 ring-primary transition-all flex-shrink-0" />
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover:text-primary transition-colors">{order.property_title || 'Unknown Item'}</p>
                                  </div>
                                </Link>
                              ) : (
                                <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{order.property_title || 'Unknown Item'}</p>
                              )}
                            </td>
                            <td className="px-6 py-4 align-top">
                              <p className="text-sm font-bold text-zinc-900 dark:text-white">{order.customer_name}</p>
                              <p className="text-xs text-zinc-500">{order.customer_phone}</p>
                            </td>
                            <td className="px-6 py-4 align-top min-w-[120px]">
                              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                ₱{order.amount.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 align-top">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

      ) : (
        /* ── ALL OTHER TABS: flat table with combined groups highlighted ── */
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500 w-28">Order #</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Item</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Notes</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-zinc-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {renderGroups.map((group, groupIdx) => {
                if (group.type === 'standalone') {
                  const pairingLabel = getStandalonePairingLabel(group.order);
                  return renderOrderRow(group.order, pairingLabel);
                }

                // Combined group — header row + both order rows
                const groupOrders = group.orders;
                return (
                  <React.Fragment key={`combined-group-${groupIdx}`}>
                    {/* Group header */}
                    <tr className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
                      <td colSpan={7} className="px-6 py-2">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <span className="material-icons text-base">call_merge</span>
                          <span className="text-xs font-black uppercase tracking-wider">
                            Combined Shipment — Ship these {groupOrders.length} items together!
                          </span>
                        </div>
                      </td>
                    </tr>
                    {/* Order rows */}
                    {groupOrders.map((order, orderIdx) => {
                      const otherOrder = groupOrders.find((_, i) => i !== orderIdx);
                      const isCombined = order.admin_notes?.includes('[COMBINED SHIPPING]');
                      const pairingLabel = isCombined
                        ? `Paired w/ #${String(otherOrder?.order_number).padStart(4, '0')}`
                        : `Combined w/ #${String(otherOrder?.order_number).padStart(4, '0')}`;
                      return renderOrderRow(order, pairingLabel, 'bg-red-50/20 dark:bg-red-900/5 border-l-4 border-red-300 dark:border-red-800');
                    })}
                    {/* Spacer */}
                    <tr><td colSpan={7} className="py-1 bg-transparent" /></tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
