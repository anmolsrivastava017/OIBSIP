import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { pizzaService, categoryService } from '../services';
import PizzaCard from '../components/PizzaCard';

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'name', label: 'A-Z' },
];

const SkeletonCard = () => (
  <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden animate-pulse">
    <div className="h-48 bg-white/5" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-white/5 rounded w-3/4" />
      <div className="h-3 bg-white/5 rounded w-full" />
      <div className="h-3 bg-white/5 rounded w-2/3" />
      <div className="flex justify-between">
        <div className="h-6 bg-white/5 rounded w-16" />
        <div className="h-8 bg-white/5 rounded w-20" />
      </div>
    </div>
  </div>
);

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pizzas, setPizzas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [isVeg, setIsVeg] = useState(searchParams.get('isVeg') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    categoryService.getAll().then((r) => setCategories(r.data.categories));
  }, []);

  const fetchPizzas = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (isVeg !== '') params.isVeg = isVeg;
      if (sort) params.sort = sort;

      const res = await pizzaService.getAll(params);
      setPizzas(res.data.pizzas);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, isVeg, sort, page]);

  useEffect(() => {
    const timer = setTimeout(fetchPizzas, 300);
    return () => clearTimeout(timer);
  }, [fetchPizzas]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setIsVeg('');
    setSort('');
    setPage(1);
  };

  const hasFilters = search || selectedCategory || isVeg !== '' || sort;

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#1a1a1a] to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black mb-2">Our <span className="gradient-text">Menu</span></h1>
          <p className="text-gray-400">{total} pizzas available · Something for everyone</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search pizzas, ingredients..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="input-field pr-8 appearance-none w-full lg:w-48 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id} style={{ background: '#1a1a1a' }}>{c.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Veg filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setIsVeg(isVeg === 'true' ? '' : 'true'); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${isVeg === 'true' ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'}`}
            >
              🟢 Veg
            </button>
            <button
              onClick={() => { setIsVeg(isVeg === 'false' ? '' : 'false'); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${isVeg === 'false' ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'}`}
            >
              🔴 Non-Veg
            </button>
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="input-field pr-8 appearance-none w-full lg:w-48 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ background: '#1a1a1a' }}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors">
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        {categories.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2 mb-8 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${!selectedCategory ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => { setSelectedCategory(c._id); setPage(1); }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${selectedCategory === c._id ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Pizza Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : pizzas.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍕</div>
            <h3 className="text-xl font-bold text-white mb-2">No pizzas found</h3>
            <p className="text-gray-400 mb-6">Try different search terms or filters</p>
            <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pizzas.map((pizza, i) => (
              <PizzaCard key={pizza._id} pizza={pizza} delay={i * 0.04} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && total > 12 && (
          <div className="flex justify-center gap-3 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary !py-2 !px-4 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="flex items-center px-4 text-gray-400 text-sm">
              Page {page} of {Math.ceil(total / 12)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 12)}
              className="btn-secondary !py-2 !px-4 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
