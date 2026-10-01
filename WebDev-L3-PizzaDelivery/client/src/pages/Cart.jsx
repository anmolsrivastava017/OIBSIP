import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { items, itemCount, subtotal, deliveryFee, tax, total, removeItem, updateQuantity, clearCart } = useCart();

  if (itemCount === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-4"
        >
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-3xl font-black text-white mb-3">Your cart is empty</h2>
          <p className="text-gray-400 mb-8">Looks like you haven't added any pizzas yet. Let's fix that!</p>
          <Link to="/menu" className="btn-primary text-base !py-3 !px-8">
            <ShoppingCart size={18} /> Browse Menu
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black">Your <span className="gradient-text">Cart</span></h1>
          <button
            onClick={clearCart}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
          >
            <Trash2 size={14} /> Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.key}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-4 flex gap-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-white font-semibold text-sm">{item.name}</h3>
                        <p className="text-gray-400 text-xs mt-0.5">
                          Size: <span className="text-gray-300">{item.size}</span>
                          {item.addOns?.length > 0 && (
                            <span> · {item.addOns.map((a) => a.name).join(', ')}</span>
                          )}
                        </p>
                        <span className={`text-xs mt-1 inline-block ${item.isVeg ? 'text-green-400' : 'text-red-400'}`}>
                          {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(item.key)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-white font-bold text-sm w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-orange-500 font-bold">₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-6 sticky top-24">
              <h2 className="text-white font-bold text-lg mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal ({itemCount} items)</span>
                  <span className="text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-400 font-semibold">FREE</span>
                  ) : (
                    <span className="text-white">₹{deliveryFee}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">GST (5%)</span>
                  <span className="text-white">₹{tax}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg p-2">
                    💡 Add ₹{500 - subtotal} more for free delivery!
                  </div>
                )}
              </div>

              <div className="border-t border-white/5 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-white font-bold">Grand Total</span>
                  <span className="text-orange-500 font-black text-xl">₹{total}</span>
                </div>
              </div>

              <Link to="/checkout" className="btn-primary w-full !py-3 !justify-center">
                Proceed to Checkout <ArrowRight size={18} />
              </Link>

              <Link to="/menu" className="btn-secondary w-full !py-2.5 !justify-center mt-3 !text-sm">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
