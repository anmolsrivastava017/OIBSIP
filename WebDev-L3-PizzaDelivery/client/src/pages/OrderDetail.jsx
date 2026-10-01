import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Package, Truck, Home, ArrowLeft, Phone, MapPin } from 'lucide-react';
import { io } from 'socket.io-client';
import { orderService } from '../services';
import toast from 'react-hot-toast';

const STATUS_STEPS = [
  { key: 'PLACED', label: 'Order Placed', icon: Package, desc: 'Your order has been received' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle, desc: 'Restaurant confirmed your order' },
  { key: 'PREPARING', label: 'Preparing', icon: Clock, desc: 'Your pizza is being prepared' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck, desc: 'Your order is on the way' },
  { key: 'DELIVERED', label: 'Delivered', icon: Home, desc: 'Enjoy your meal!' },
];

const STATUS_ORDER = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const statusStyle = {
  PLACED: 'status-placed',
  CONFIRMED: 'status-confirmed',
  PREPARING: 'status-preparing',
  OUT_FOR_DELIVERY: 'status-out_for_delivery',
  DELIVERED: 'status-delivered',
  CANCELLED: 'status-cancelled',
};

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderService.getOne(id);
        setOrder(res.data.order);
      } catch {
        toast.error('Order not found');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();

    // Socket.IO connection for real-time tracking
    socketRef.current = io('/', { transports: ['websocket', 'polling'] });
    socketRef.current.emit('join-order', id);
    socketRef.current.on('order-status-update', (data) => {
      if (data.orderId === id) {
        setOrder((prev) => prev ? { ...prev, status: data.status, statusHistory: data.statusHistory } : prev);
        toast.success(`Order status: ${data.status.replace(/_/g, ' ')}`, { icon: '📦' });
      }
    });

    return () => {
      socketRef.current?.emit('leave-order', id);
      socketRef.current?.disconnect();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <Link to="/orders" className="btn-primary">My Orders</Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = order.status === 'CANCELLED' ? -1 : STATUS_ORDER.indexOf(order.status);

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/orders" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to My Orders
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black">Order <span className="gradient-text">#{order.orderNumber}</span></h1>
            <p className="text-gray-400 text-sm mt-1">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusStyle[order.status] || 'bg-gray-500/20 text-gray-300'}`}>
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Live Tracking */}
        {order.status !== 'CANCELLED' && (
          <div className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <h2 className="text-white font-bold">Live Order Tracking</h2>
            </div>

            {/* Progress Steps */}
            <div className="relative">
              {/* Progress line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-white/5 hidden sm:block" />
              <div
                className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-orange-500 to-orange-300 hidden sm:block transition-all duration-1000"
                style={{ width: `${currentStepIndex <= 0 ? 0 : (currentStepIndex / (STATUS_STEPS.length - 1)) * 90}%` }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {STATUS_STEPS.map((step, i) => {
                  const isDone = i <= currentStepIndex;
                  const isActive = i === currentStepIndex;
                  return (
                    <motion.div
                      key={step.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex flex-col items-center text-center relative"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 relative z-10 transition-all ${
                        isActive ? 'bg-orange-500 border-orange-500 shadow-lg shadow-orange-500/40' :
                        isDone ? 'bg-orange-500/20 border-orange-500' :
                        'bg-white/5 border-white/10'
                      }`}>
                        <step.icon size={16} className={isDone ? 'text-orange-400' : 'text-gray-500'} />
                        {isActive && (
                          <div className="absolute inset-0 rounded-full bg-orange-500/30 animate-ping" />
                        )}
                      </div>
                      <div className={`mt-2 text-xs font-semibold ${isDone ? 'text-white' : 'text-gray-500'}`}>
                        {step.label}
                      </div>
                      <div className="text-gray-500 text-xs mt-0.5 hidden sm:block">{step.desc}</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Estimated time */}
            {order.estimatedDelivery && order.status !== 'DELIVERED' && (
              <div className="mt-6 flex items-center gap-2 text-sm text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-2.5">
                <Clock size={15} />
                Estimated delivery: {new Date(order.estimatedDelivery).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        )}

        {order.status === 'CANCELLED' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-6">
            <h3 className="text-red-400 font-bold mb-1">Order Cancelled</h3>
            <p className="text-gray-400 text-sm">{order.cancellationReason || 'This order has been cancelled.'}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Items */}
          <div className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Items Ordered</h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&q=80'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-gray-400 text-xs">{item.size} × {item.quantity}</p>
                    {item.addOns?.length > 0 && (
                      <p className="text-gray-500 text-xs">{item.addOns.map((a) => a.name).join(', ')}</p>
                    )}
                  </div>
                  <span className="text-orange-500 text-sm font-semibold">₹{item.subtotal}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/5 mt-4 pt-4 space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span>₹{order.pricing.subtotal}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Delivery</span><span>{order.pricing.deliveryFee === 0 ? <span className="text-green-400">FREE</span> : `₹${order.pricing.deliveryFee}`}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Tax</span><span>₹{order.pricing.tax}</span></div>
              <div className="flex justify-between font-bold pt-2 border-t border-white/5"><span>Total</span><span className="text-orange-500">₹{order.pricing.total}</span></div>
            </div>
          </div>

          {/* Delivery + Payment Info */}
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <MapPin size={15} className="text-orange-500" /> Delivery Address
              </h3>
              <p className="text-white text-sm font-medium">{order.deliveryAddress.name}</p>
              <p className="text-gray-400 text-sm flex items-center gap-1.5 mt-1">
                <Phone size={12} /> {order.deliveryAddress.phone}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {order.deliveryAddress.street}, {order.deliveryAddress.city} — {order.deliveryAddress.postalCode}
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-3">Payment</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Method</span>
                <span className="text-white text-sm font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-400 text-sm">Status</span>
                <span className={`text-sm font-semibold ${order.paymentStatus === 'PAID' ? 'text-green-400' : order.paymentStatus === 'FAILED' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Status History */}
            {order.statusHistory?.length > 0 && (
              <div className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-3">Status History</h3>
                <div className="space-y-2.5">
                  {[...order.statusHistory].reverse().map((h, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                      <div>
                        <span className="text-white font-medium">{h.status.replace(/_/g, ' ')}</span>
                        {h.note && <p className="text-gray-400 text-xs">{h.note}</p>}
                        <p className="text-gray-500 text-xs">{new Date(h.updatedAt).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
