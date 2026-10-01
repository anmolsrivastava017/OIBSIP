import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Clock, ShoppingBag } from 'lucide-react';
import { orderService } from '../services';

const statusStyle = {
  PLACED: 'status-placed',
  CONFIRMED: 'status-confirmed',
  PREPARING: 'status-preparing',
  OUT_FOR_DELIVERY: 'status-out_for_delivery',
  DELIVERED: 'status-delivered',
  CANCELLED: 'status-cancelled',
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await orderService.getMyOrders({ page, limit: 10 });
        setOrders(res.data.orders);
        setTotal(res.data.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black mb-2">My <span className="gradient-text">Orders</span></h1>
        <p className="text-gray-400 mb-8">{total} orders total</p>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No orders yet</h3>
            <p className="text-gray-400 mb-6">Your order history will appear here once you place your first order.</p>
            <Link to="/menu" className="btn-primary">Order Now</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/order/${order._id}`}
                  className="block bg-[#1a1a1a] border border-white/6 rounded-2xl p-5 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                        <Package size={20} className="text-orange-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-white font-bold">#{order.orderNumber}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusStyle[order.status]}`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-0.5">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {order.paymentMethod}
                        </p>
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
                          <Clock size={11} />
                          {new Date(order.createdAt).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <div className="text-orange-500 font-black text-xl">₹{order.pricing.total}</div>
                        <div className={`text-xs font-medium ${order.paymentStatus === 'PAID' ? 'text-green-400' : 'text-yellow-400'}`}>
                          {order.paymentStatus}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-500 group-hover:text-orange-500 transition-colors" />
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="flex gap-2 mt-4 overflow-hidden">
                    {order.items.slice(0, 4).map((item, j) => (
                      <img
                        key={j}
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&q=80'; }}
                      />
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-400">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Pagination */}
            {total > 10 && (
              <div className="flex justify-center gap-3 mt-8">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary !py-2 !px-4 disabled:opacity-40">
                  Previous
                </button>
                <span className="flex items-center text-gray-400 text-sm">
                  Page {page} of {Math.ceil(total / 10)}
                </span>
                <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 10)} className="btn-secondary !py-2 !px-4 disabled:opacity-40">
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
