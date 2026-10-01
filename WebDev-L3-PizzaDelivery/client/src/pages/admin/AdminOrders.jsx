import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronDown, Eye, RefreshCw } from 'lucide-react';
import { io } from 'socket.io-client';
import { orderService } from '../../services';
import toast from 'react-hot-toast';

const statusStyle = {
  PLACED: 'status-placed',
  CONFIRMED: 'status-confirmed',
  PREPARING: 'status-preparing',
  OUT_FOR_DELIVERY: 'status-out_for_delivery',
  DELIVERED: 'status-delivered',
  CANCELLED: 'status-cancelled',
};

const STATUSES = ['ALL', 'PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
const NEXT_STATUS = {
  PLACED: 'CONFIRMED',
  CONFIRMED: 'PREPARING',
  PREPARING: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('/', { transports: ['websocket', 'polling'] });
    socketRef.current.emit('join-admin');
    socketRef.current.on('new-order', (order) => {
      toast.success(`New order #${order.orderNumber}!`, { icon: '🍕' });
      fetchOrders();
    });
    return () => socketRef.current?.disconnect();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search) params.search = search;
      const res = await orderService.getAllAdmin(params);
      setOrders(res.data.orders);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter, search]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await orderService.updateStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data.order : o)));
      toast.success(`Order updated to ${newStatus.replace(/_/g, ' ')}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Order Management</h1>
          <p className="text-gray-400 text-sm">{total} total orders</p>
        </div>
        <button onClick={fetchOrders} className="btn-secondary !py-2 !px-4 !text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all ${statusFilter === s ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'}`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-[#1a1a1a] border border-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-[#1a1a1a] rounded-2xl border border-white/6">
          <div className="text-5xl mb-3">📦</div>
          <h3 className="text-white font-bold mb-1">No orders found</h3>
          <p className="text-gray-400 text-sm">Try changing your filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-[#1a1a1a] border border-white/6 rounded-xl p-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Order info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-orange-500 font-bold text-sm">#{order.orderNumber}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle[order.status]}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${order.paymentStatus === 'PAID' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-4 text-sm flex-wrap">
                    <span className="text-gray-300">{order.customer?.name}</span>
                    <span className="text-gray-400 text-xs">{order.customer?.phone}</span>
                    <span className="text-gray-400 text-xs">{new Date(order.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="mt-1.5 text-gray-500 text-xs">
                    {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · ₹{order.pricing?.total} · {order.paymentMethod}
                  </div>
                </div>

                {/* Delivery address */}
                <div className="text-xs text-gray-400 hidden xl:block max-w-48">
                  <p className="text-gray-300 font-medium">{order.deliveryAddress?.name}</p>
                  <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.postalCode}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-orange-500 font-black text-lg">₹{order.pricing?.total}</span>
                  {NEXT_STATUS[order.status] && order.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, NEXT_STATUS[order.status])}
                      disabled={updatingId === order._id}
                      className="btn-primary !py-1.5 !px-3 !text-xs disabled:opacity-50"
                    >
                      {updatingId === order._id ? '...' : `→ ${NEXT_STATUS[order.status].replace(/_/g, ' ')}`}
                    </button>
                  )}
                  {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, 'CANCELLED')}
                      disabled={updatingId === order._id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 15 && (
        <div className="flex justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary !py-2 !px-4 !text-sm disabled:opacity-40">Previous</button>
          <span className="flex items-center text-gray-400 text-sm">Page {page} of {Math.ceil(total / 15)}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 15)} className="btn-secondary !py-2 !px-4 !text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
