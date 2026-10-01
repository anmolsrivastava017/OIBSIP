import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { CreditCard, Truck, MapPin, Phone, Mail, User, CheckCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService, paymentService } from '../services';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, deliveryFee, tax, total, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      postalCode: user?.address?.postalCode || '',
    }
  });

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          pizzaId: item.pizzaId,
          size: item.size,
          quantity: item.quantity,
          addOns: item.addOns || [],
        })),
        deliveryAddress: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          street: formData.street,
          city: formData.city,
          state: formData.state || '',
          postalCode: formData.postalCode,
        },
        paymentMethod,
      };

      if (paymentMethod === 'COD') {
        const res = await orderService.create(orderData);
        clearCart();
        toast.success('Order placed successfully! 🍕');
        navigate(`/order/${res.data.order._id}`);
      } else {
        // Razorpay flow
        const paymentRes = await paymentService.createOrder({ amount: total });
        const { order: rzpOrder, key, mode } = paymentRes.data;

        if (mode === 'mock') {
          // Mock payment for development
          toast('Development mode: Simulating payment...', { icon: '⚠️' });
          const createdOrder = await orderService.create(orderData);
          await paymentService.verify({
            razorpay_order_id: rzpOrder.id,
            razorpay_payment_id: 'mock_pay_' + Date.now(),
            razorpay_signature: 'mock_sig',
            orderId: createdOrder.data.order._id,
          });
          clearCart();
          toast.success('Payment successful! (Development Mode)');
          navigate(`/order/${createdOrder.data.order._id}`);
        } else {
          // Real Razorpay
          const rzpOptions = {
            key,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            name: 'PizzaHub',
            description: 'Pizza Order Payment',
            order_id: rzpOrder.id,
            handler: async (response) => {
              try {
                const createdOrder = await orderService.create(orderData);
                await paymentService.verify({
                  ...response,
                  orderId: createdOrder.data.order._id,
                });
                clearCart();
                toast.success('Payment successful! Order placed!');
                navigate(`/order/${createdOrder.data.order._id}`);
              } catch {
                toast.error('Payment verification failed. Contact support.');
              }
            },
            prefill: { name: formData.name, email: formData.email, contact: formData.phone },
            theme: { color: '#ff6b35' },
            modal: { ondismiss: () => { toast.error('Payment cancelled.'); setLoading(false); } },
          };
          const rzp = new window.Razorpay(rzpOptions);
          rzp.open();
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black mb-8">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Address + Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-6">
                <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                  <MapPin size={18} className="text-orange-500" /> Delivery Address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1.5">Full Name *</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...register('name', { required: 'Name is required' })}
                        placeholder="Your full name"
                        className={`input-field pl-9 ${errors.name ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1.5">Phone *</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...register('phone', { required: 'Phone is required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid phone number' } })}
                        placeholder="10-digit mobile number"
                        className={`input-field pl-9 ${errors.phone ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-400 text-sm mb-1.5">Email *</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                        placeholder="your@email.com"
                        className={`input-field pl-9 ${errors.email ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-400 text-sm mb-1.5">Street Address *</label>
                    <input
                      {...register('street', { required: 'Street address is required' })}
                      placeholder="House/flat no, street, area"
                      className={`input-field ${errors.street ? 'border-red-500' : ''}`}
                    />
                    {errors.street && <p className="text-red-400 text-xs mt-1">{errors.street.message}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1.5">City *</label>
                    <input
                      {...register('city', { required: 'City is required' })}
                      placeholder="City"
                      className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                    />
                    {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1.5">Postal Code *</label>
                    <input
                      {...register('postalCode', { required: 'Postal code is required', pattern: { value: /^\d{6}$/, message: '6-digit postal code required' } })}
                      placeholder="6-digit PIN code"
                      className={`input-field ${errors.postalCode ? 'border-red-500' : ''}`}
                    />
                    {errors.postalCode && <p className="text-red-400 text-xs mt-1">{errors.postalCode.message}</p>}
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-6">
                <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                  <CreditCard size={18} className="text-orange-500" /> Payment Method
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 rounded-xl border text-left transition-all ${paymentMethod === 'COD' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Truck size={20} className={paymentMethod === 'COD' ? 'text-orange-500' : 'text-gray-400'} />
                      <span className="text-white font-semibold">Cash on Delivery</span>
                    </div>
                    <p className="text-gray-400 text-xs">Pay with cash when your order arrives at your doorstep.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('RAZORPAY')}
                    className={`p-4 rounded-xl border text-left transition-all ${paymentMethod === 'RAZORPAY' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <CreditCard size={20} className={paymentMethod === 'RAZORPAY' ? 'text-orange-500' : 'text-gray-400'} />
                      <span className="text-white font-semibold">Razorpay</span>
                    </div>
                    <p className="text-gray-400 text-xs">UPI, Cards, Net Banking, Wallets — 100% secure payment.</p>
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Right: Order Summary */}
            <div>
              <div className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-6 sticky top-24">
                <h2 className="text-white font-bold text-lg mb-5">Order Summary</h2>

                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.key} className="flex gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&q=80'; }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium line-clamp-1">{item.name}</p>
                        <p className="text-gray-400 text-xs">{item.size} × {item.quantity}</p>
                      </div>
                      <span className="text-orange-500 text-sm font-semibold flex-shrink-0">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Delivery</span>
                    {deliveryFee === 0 ? (
                      <span className="text-green-400">FREE</span>
                    ) : (
                      <span className="text-white">₹{deliveryFee}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Tax (5%)</span>
                    <span className="text-white">₹{tax}</span>
                  </div>
                  <div className="border-t border-white/5 pt-3 flex justify-between">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-orange-500 font-black text-xl">₹{total}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full !py-3 mt-5 !justify-center disabled:opacity-60"
                >
                  {loading ? (
                    <><Loader size={18} className="animate-spin" /> Processing...</>
                  ) : (
                    <><CheckCircle size={18} /> Place Order</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
