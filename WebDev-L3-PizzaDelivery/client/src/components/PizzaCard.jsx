import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Flame, Crown } from 'lucide-react';
import { useCart } from '../context/CartContext';

const PizzaCard = ({ pizza, delay = 0 }) => {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const defaultSize = pizza.sizes?.[1] || pizza.sizes?.[0];
  const displayPrice = defaultSize?.discountPrice || defaultSize?.price;
  const originalPrice = defaultSize?.price;
  const hasDiscount = defaultSize?.discountPrice > 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultSize) return;
    addItem(pizza, defaultSize.name);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="pizza-card group"
      onClick={() => navigate(`/pizza/${pizza._id}`)}
    >
      {/* Image */}
      <div className="relative overflow-hidden h-48">
        <img
          src={pizza.image || 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80'}
          alt={pizza.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80'; }}
        />
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={pizza.isVeg ? 'badge-veg' : 'badge-nonveg'}>
            {pizza.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          {pizza.isBestseller && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Crown size={10} /> Bestseller
            </span>
          )}
          {pizza.isSpicy && (
            <span className="bg-red-600/80 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Flame size={10} /> Spicy
            </span>
          )}
        </div>
        {!pizza.isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-white text-base leading-tight mb-1 line-clamp-1">{pizza.name}</h3>
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-3">{pizza.description}</p>

        {/* Rating */}
        {pizza.ratings?.count > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <Star size={13} className="fill-yellow-400 text-yellow-400" />
            <span className="text-yellow-400 text-xs font-semibold">{pizza.ratings.average.toFixed(1)}</span>
            <span className="text-gray-500 text-xs">({pizza.ratings.count.toLocaleString()})</span>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-orange-500 font-bold text-lg">₹{displayPrice}</span>
            {hasDiscount && (
              <span className="text-gray-500 line-through text-sm ml-2">₹{originalPrice}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!pizza.isAvailable}
            className="btn-primary !py-1.5 !px-3 !text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={14} />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PizzaCard;
