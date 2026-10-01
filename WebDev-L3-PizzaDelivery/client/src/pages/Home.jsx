import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock, Shield, Truck, ChevronRight, Flame, Crown, Leaf } from 'lucide-react';
import { pizzaService, categoryService } from '../services';
import PizzaCard from '../components/PizzaCard';

const testimonials = [
  { name: 'Priya Sharma', rating: 5, text: 'Best pizza in the city! The Paneer Tikka Masala is absolutely divine. Delivered in 25 minutes!', avatar: 'PS', location: 'Mumbai' },
  { name: 'Rahul Verma', rating: 5, text: 'Four Cheese Delight is my go-to every Friday. PizzaHub never disappoints — quality is consistently excellent.', avatar: 'RV', location: 'Delhi' },
  { name: 'Ananya Reddy', rating: 5, text: 'Truffle Mushroom pizza changed my life. The ingredients are fresh and the crust is perfectly crispy.', avatar: 'AR', location: 'Bengaluru' },
  { name: 'Karan Mehta', rating: 4, text: 'Great variety, easy ordering, and always on time. The BBQ Chicken Feast is incredible.', avatar: 'KM', location: 'Pune' },
];

const offers = [
  { title: '20% OFF', subtitle: 'On first order', code: 'FIRST20', color: 'from-orange-500 to-red-600', icon: '🎉' },
  { title: 'Free Delivery', subtitle: 'On orders above ₹500', code: 'FREEDEL', color: 'from-purple-500 to-pink-600', icon: '🛵' },
  { title: 'Buy 2 Get 1', subtitle: 'On selected pizzas', code: 'B2G1', color: 'from-blue-500 to-cyan-600', icon: '🍕' },
];

const whyUs = [
  { icon: Clock, title: '30 Min Delivery', desc: 'Hot pizza delivered to your door in 30 minutes or your next order is free.' },
  { icon: Leaf, title: 'Fresh Ingredients', desc: 'We source premium ingredients daily. No frozen stuff, ever.' },
  { icon: Star, title: '4.8★ Rated', desc: 'Over 10,000 happy customers rate us 4.8 out of 5 stars.' },
  { icon: Shield, title: 'Safe & Hygienic', desc: 'FSSAI certified kitchen with strict hygiene protocols.' },
];

const SkeletonCard = () => (
  <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden animate-pulse">
    <div className="h-48 bg-white/5" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-white/5 rounded w-3/4" />
      <div className="h-3 bg-white/5 rounded w-full" />
      <div className="h-3 bg-white/5 rounded w-2/3" />
      <div className="flex justify-between items-center">
        <div className="h-6 bg-white/5 rounded w-16" />
        <div className="h-8 bg-white/5 rounded w-20" />
      </div>
    </div>
  </div>
);

const Home = () => {
  const [featuredPizzas, setFeaturedPizzas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pizzaRes, catRes] = await Promise.all([
          pizzaService.getAll({ featured: 'true', limit: 8 }),
          categoryService.getAll(),
        ]);
        setFeaturedPizzas(pizzaRes.data.pizzas);
        setCategories(catRes.data.categories);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1920&q=80"
            alt="Hero pizza"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                <Flame size={14} className="text-orange-500" />
                India's Most Loved Pizza Delivery
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight mb-6"
            >
              Crafted with{' '}
              <span className="gradient-text">Passion</span>,
              <br />Delivered with{' '}
              <span className="gradient-text">Speed</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-300 text-xl leading-relaxed mb-10"
            >
              From our stone-fired ovens to your doorstep — artisanal pizzas made with premium ingredients, delivered in 30 minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/menu" className="btn-primary text-base !py-3 !px-8">
                Order Now <ArrowRight size={18} />
              </Link>
              <Link to="/menu" className="btn-secondary text-base !py-3 !px-8">
                Explore Menu
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex gap-8 mt-12"
            >
              {[
                { value: '50K+', label: 'Orders Delivered' },
                { value: '4.8★', label: 'Average Rating' },
                { value: '30 Min', label: 'Avg Delivery' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-orange-500">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h2 className="section-title">Browse by <span className="gradient-text">Category</span></h2>
          <Link to="/menu" className="flex items-center gap-1 text-orange-500 hover:text-orange-400 text-sm font-semibold transition-colors">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {loading
            ? Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-28 bg-[#1a1a1a] rounded-2xl animate-pulse" />
              ))
            : categories.map((cat, i) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={`/menu?category=${cat._id}`}
                    className="glass-card p-5 flex flex-col items-center justify-center gap-3 text-center hover:border-orange-500/30 hover:bg-orange-500/5 transition-all group"
                  >
                    <span className="text-3xl">{getCategoryEmoji(cat.slug)}</span>
                    <span className="text-white font-semibold text-sm group-hover:text-orange-400 transition-colors">{cat.name}</span>
                  </Link>
                </motion.div>
              ))}
        </div>
      </section>

      {/* Offers */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title mb-10">Today's <span className="gradient-text">Deals</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer, i) => (
            <motion.div
              key={offer.code}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${offer.color} p-6 cursor-pointer hover:scale-[1.02] transition-transform`}
            >
              <div className="absolute -right-4 -top-4 text-6xl opacity-30">{offer.icon}</div>
              <div className="text-4xl font-black text-white mb-1">{offer.title}</div>
              <div className="text-white/80 text-sm mb-3">{offer.subtitle}</div>
              <div className="inline-block bg-white/20 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                Code: {offer.code}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Pizzas */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="section-title">
              <Crown size={28} className="inline text-orange-500 mr-2" />
              Featured <span className="gradient-text">Pizzas</span>
            </h2>
            <p className="text-gray-400 mt-2">Our most loved creations, handpicked for you</p>
          </div>
          <Link to="/menu" className="flex items-center gap-1 text-orange-500 hover:text-orange-400 text-sm font-semibold transition-colors">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : featuredPizzas.map((pizza, i) => (
                <PizzaCard key={pizza._id} pizza={pizza} delay={i * 0.05} />
              ))
          }
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-3">Why Choose <span className="gradient-text">PizzaHub?</span></h2>
          <p className="text-gray-400 text-center mb-14">We're not just another pizza place. We're your pizza obsession.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUs.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 text-center hover:border-orange-500/20 transition-colors group"
              >
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-500/20 transition-colors">
                  <item.icon size={24} className="text-orange-500" />
                </div>
                <h3 className="text-white font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title text-center mb-3">What Our <span className="gradient-text">Customers Say</span></h2>
        <p className="text-gray-400 text-center mb-14">Don't just take our word for it</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-5"
            >
              <div className="flex gap-1 mb-3">
                {Array(t.rating).fill(0).map((_, j) => (
                  <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{t.name}</div>
                  <div className="text-gray-400 text-xs">{t.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-br from-orange-500/10 to-red-600/5 border-y border-orange-500/10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-black mb-4">Ready to Order? <span className="gradient-text">Let's Go!</span></h2>
          <p className="text-gray-300 text-lg mb-8">Fresh, hot, and delicious pizzas — just a click away.</p>
          <Link to="/menu" className="btn-primary text-lg !py-4 !px-10">
            Order Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

const getCategoryEmoji = (slug) => {
  const map = { classic: '🍕', veggie: '🥦', 'non-veg': '🍗', premium: '👑', spicy: '🌶️' };
  return map[slug] || '🍕';
};

export default Home;
