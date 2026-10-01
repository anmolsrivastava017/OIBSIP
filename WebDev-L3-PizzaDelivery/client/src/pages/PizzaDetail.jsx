import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Clock, Flame, Crown, ArrowLeft, Plus, Minus, ChevronRight } from 'lucide-react';
import { pizzaService } from '../services';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const PizzaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [pizza, setPizza] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  useEffect(() => {
    const fetchPizza = async () => {
      try {
        const res = await pizzaService.getOne(id);
        setPizza(res.data.pizza);
        setSelectedSize(res.data.pizza.sizes?.[1]?.name || res.data.pizza.sizes?.[0]?.name);
      } catch {
        toast.error('Pizza not found');
        navigate('/menu');
      } finally {
        setLoading(false);
      }
    };
    fetchPizza();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!pizza) return null;

  const currentSize = pizza.sizes?.find((s) => s.name === selectedSize);
  const basePrice = currentSize?.discountPrice || currentSize?.price || 0;
  const addOnTotal = selectedAddOns.reduce((sum, ao) => sum + ao.price, 0);
  const itemPrice = basePrice + addOnTotal;
  const totalPrice = itemPrice * quantity;

  const toggleAddOn = (addOn) => {
    setSelectedAddOns((prev) =>
      prev.find((a) => a.name === addOn.name)
        ? prev.filter((a) => a.name !== addOn.name)
        : [...prev, addOn]
    );
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addItem(pizza, selectedSize, quantity, selectedAddOns);
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Menu
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden bg-[#1a1a1a]">
              <img
                src={pizza.image}
                alt={pizza.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80'; }}
              />
            </div>
            {/* Floating badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={pizza.isVeg ? 'badge-veg' : 'badge-nonveg'}>
                {pizza.isVeg ? '🟢 Vegetarian' : '🔴 Non-Vegetarian'}
              </span>
            </div>
            {pizza.isBestseller && (
              <div className="absolute top-4 right-4">
                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Crown size={12} /> Bestseller
                </span>
              </div>
            )}
            {!pizza.isAvailable && (
              <div className="absolute inset-0 rounded-3xl bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-xl bg-black/60 px-6 py-3 rounded-full">Out of Stock</span>
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-black text-white">{pizza.name}</h1>
                {pizza.isSpicy && (
                  <span className="bg-red-600/20 text-red-400 border border-red-600/30 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Flame size={10} /> Spicy
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                {pizza.category && (
                  <>
                    <span className="text-orange-500">{pizza.category.name}</span>
                    <span>·</span>
                  </>
                )}
                <Clock size={14} />
                <span>{pizza.preparationTime} min</span>
                {pizza.ratings?.count > 0 && (
                  <>
                    <span>·</span>
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold">{pizza.ratings.average.toFixed(1)}</span>
                    <span>({pizza.ratings.count.toLocaleString()} reviews)</span>
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed">{pizza.description}</p>

            {/* Ingredients */}
            {pizza.ingredients?.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3">Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {pizza.ingredients.map((ing) => (
                    <span key={ing} className="bg-white/5 border border-white/10 text-gray-300 text-xs px-3 py-1.5 rounded-full">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {pizza.sizes?.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3">Choose Size</h3>
                <div className="grid grid-cols-2 gap-3">
                  {pizza.sizes.map((size) => {
                    const price = size.discountPrice || size.price;
                    const hasDiscount = size.discountPrice > 0;
                    return (
                      <button
                        key={size.name}
                        onClick={() => setSelectedSize(size.name)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedSize === size.name
                            ? 'border-orange-500 bg-orange-500/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="text-white font-semibold text-sm">{size.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-orange-500 font-bold">₹{price}</span>
                          {hasDiscount && (
                            <span className="text-gray-500 line-through text-xs">₹{size.price}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add-Ons */}
            {pizza.addOns?.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3">Add-Ons</h3>
                <div className="space-y-2">
                  {pizza.addOns.map((addOn) => {
                    const selected = !!selectedAddOns.find((a) => a.name === addOn.name);
                    return (
                      <button
                        key={addOn.name}
                        onClick={() => toggleAddOn(addOn)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                          selected ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <span className="text-gray-300 text-sm">{addOn.name}</span>
                        <span className={`font-semibold text-sm ${selected ? 'text-orange-500' : 'text-gray-400'}`}>
                          +₹{addOn.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-gray-400 text-sm">Total Price</div>
                  <div className="text-3xl font-black text-orange-500">₹{totalPrice}</div>
                  {quantity > 1 && (
                    <div className="text-gray-500 text-xs">₹{itemPrice} × {quantity}</div>
                  )}
                </div>
                {/* Quantity control */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-white font-bold text-lg w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!pizza.isAvailable || pizza.stock === 0}
                className="btn-primary w-full !py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={18} />
                {pizza.isAvailable ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>

            {/* Stock info */}
            {pizza.stock <= 10 && pizza.stock > 0 && (
              <p className="text-yellow-500 text-sm font-medium">
                ⚠️ Only {pizza.stock} left in stock!
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PizzaDetail;
