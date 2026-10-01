import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search, Package, X, Save, Loader } from 'lucide-react';
import { pizzaService, categoryService } from '../../services';
import toast from 'react-hot-toast';

const defaultForm = {
  name: '', description: '', category: '', isVeg: true, isSpicy: false,
  isBestseller: false, isFeatured: false, basePrice: '', stock: 100,
  preparationTime: 20, image: '', ingredients: '', tags: '',
  sizes: [
    { name: 'Small', price: '', discountPrice: 0 },
    { name: 'Medium', price: '', discountPrice: 0 },
    { name: 'Large', price: '', discountPrice: 0 },
    { name: 'XL', price: '', discountPrice: 0 },
  ],
  addOns: '',
};

const AdminProducts = () => {
  const [pizzas, setPizzas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [stockEdit, setStockEdit] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([pizzaService.getAll({ limit: 50 }), categoryService.getAll()]);
      setPizzas(pRes.data.pizzas);
      setCategories(cRes.data.categories);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const openEdit = (pizza) => {
    setEditing(pizza._id);
    setForm({
      ...pizza,
      category: pizza.category?._id || pizza.category || '',
      ingredients: pizza.ingredients?.join(', ') || '',
      tags: pizza.tags?.join(', ') || '',
      addOns: pizza.addOns?.map((a) => `${a.name}:${a.price}`).join(', ') || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.category || !form.basePrice) {
      toast.error('Name, category and base price are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        basePrice: Number(form.basePrice),
        stock: Number(form.stock),
        preparationTime: Number(form.preparationTime),
        ingredients: form.ingredients ? form.ingredients.split(',').map((s) => s.trim()).filter(Boolean) : [],
        tags: form.tags ? form.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
        addOns: form.addOns
          ? form.addOns.split(',').map((s) => {
              const [n, p] = s.trim().split(':');
              return { name: n?.trim(), price: Number(p?.trim() || 0) };
            }).filter((a) => a.name)
          : [],
        sizes: form.sizes.map((s) => ({ ...s, price: Number(s.price), discountPrice: Number(s.discountPrice || 0) })),
      };

      if (editing) {
        const res = await pizzaService.update(editing, payload);
        setPizzas((prev) => prev.map((p) => p._id === editing ? res.data.pizza : p));
        toast.success('Pizza updated!');
      } else {
        const res = await pizzaService.create(payload);
        setPizzas((prev) => [res.data.pizza, ...prev]);
        toast.success('Pizza created!');
      }
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pizza?')) return;
    try {
      await pizzaService.delete(id);
      setPizzas((prev) => prev.filter((p) => p._id !== id));
      toast.success('Pizza deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await pizzaService.toggleAvailability(id);
      setPizzas((prev) => prev.map((p) => p._id === id ? res.data.pizza : p));
      toast.success(res.data.pizza.isAvailable ? 'Pizza enabled' : 'Pizza disabled');
    } catch { toast.error('Toggle failed'); }
  };

  const handleStockUpdate = async (id, stock) => {
    try {
      const res = await pizzaService.updateStock(id, Number(stock));
      setPizzas((prev) => prev.map((p) => p._id === id ? res.data.pizza : p));
      setStockEdit((prev) => { const n = { ...prev }; delete n[id]; return n; });
      toast.success('Stock updated');
    } catch { toast.error('Stock update failed'); }
  };

  const filtered = pizzas.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Product Management</h1>
          <p className="text-gray-400 text-sm">{pizzas.length} products</p>
        </div>
        <button onClick={openCreate} className="btn-primary !py-2 !px-4 !text-sm">
          <Plus size={16} /> Add Pizza
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9"
        />
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-40 bg-[#1a1a1a] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((pizza, i) => (
            <motion.div
              key={pizza._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-[#1a1a1a] border rounded-xl overflow-hidden ${pizza.isAvailable ? 'border-white/6' : 'border-red-500/20 opacity-70'}`}
            >
              <div className="relative h-32 overflow-hidden">
                <img src={pizza.image} alt={pizza.name} className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80'; }} />
                {!pizza.isAvailable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs font-bold bg-red-600 px-2 py-1 rounded">DISABLED</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">{pizza.name}</h3>
                    <p className="text-orange-500 font-bold text-sm">₹{pizza.basePrice}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => handleToggle(pizza._id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" title="Toggle availability">
                      {pizza.isAvailable ? <ToggleRight size={16} className="text-green-400" /> : <ToggleLeft size={16} className="text-gray-400" />}
                    </button>
                    <button onClick={() => openEdit(pizza)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <Edit2 size={14} className="text-blue-400" />
                    </button>
                    <button onClick={() => handleDelete(pizza._id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors">
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Stock */}
                <div className="flex items-center gap-2 mt-2">
                  <Package size={12} className={pizza.stock <= 5 ? 'text-red-400' : pizza.stock <= 20 ? 'text-yellow-400' : 'text-green-400'} />
                  {stockEdit[pizza._id] !== undefined ? (
                    <div className="flex items-center gap-1 flex-1">
                      <input
                        type="number"
                        min="0"
                        value={stockEdit[pizza._id]}
                        onChange={(e) => setStockEdit((prev) => ({ ...prev, [pizza._id]: e.target.value }))}
                        className="w-16 px-2 py-0.5 bg-white/5 border border-white/10 rounded text-white text-xs"
                      />
                      <button onClick={() => handleStockUpdate(pizza._id, stockEdit[pizza._id])} className="text-green-400 hover:text-green-300 text-xs">✓</button>
                      <button onClick={() => setStockEdit((prev) => { const n = { ...prev }; delete n[pizza._id]; return n; })} className="text-gray-400 hover:text-gray-300 text-xs">✗</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setStockEdit((prev) => ({ ...prev, [pizza._id]: pizza.stock }))}
                      className={`text-xs ${pizza.stock === 0 ? 'text-red-400' : pizza.stock <= 10 ? 'text-yellow-400' : 'text-gray-400'} hover:text-white transition-colors`}
                    >
                      Stock: {pizza.stock}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg">{editing ? 'Edit Pizza' : 'Add New Pizza'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-lg"><X size={18} /></button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-gray-400 text-sm mb-1 block">Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Pizza name" className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-gray-400 text-sm mb-1 block">Description *</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Description" className="input-field resize-none" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field appearance-none">
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c._id} value={c._id} style={{ background: '#1a1a1a' }}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Base Price (₹) *</label>
                  <input type="number" min="0" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} placeholder="e.g. 199" className="input-field" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Stock</label>
                  <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Prep Time (min)</label>
                  <input type="number" min="0" value={form.preparationTime} onChange={(e) => setForm({ ...form, preparationTime: e.target.value })} className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-gray-400 text-sm mb-1 block">Image URL</label>
                  <input type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-gray-400 text-sm mb-1 block">Ingredients (comma separated)</label>
                  <input type="text" value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} placeholder="Tomato, Mozzarella, Basil" className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-gray-400 text-sm mb-1 block">Add-Ons (name:price, comma separated)</label>
                  <input type="text" value={form.addOns} onChange={(e) => setForm({ ...form, addOns: e.target.value })} placeholder="Extra Cheese:40, Jalapeños:20" className="input-field" />
                </div>

                {/* Size Pricing */}
                <div className="sm:col-span-2">
                  <label className="text-gray-400 text-sm mb-2 block">Size Pricing</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {form.sizes.map((size, idx) => (
                      <div key={size.name} className="bg-white/5 rounded-xl p-3">
                        <div className="text-white text-xs font-semibold mb-2">{size.name}</div>
                        <input
                          type="number" min="0" placeholder="Price"
                          value={size.price}
                          onChange={(e) => {
                            const newSizes = [...form.sizes];
                            newSizes[idx] = { ...newSizes[idx], price: e.target.value };
                            setForm({ ...form, sizes: newSizes });
                          }}
                          className="input-field !py-1.5 !text-xs mb-1"
                        />
                        <input
                          type="number" min="0" placeholder="Discount"
                          value={size.discountPrice}
                          onChange={(e) => {
                            const newSizes = [...form.sizes];
                            newSizes[idx] = { ...newSizes[idx], discountPrice: e.target.value };
                            setForm({ ...form, sizes: newSizes });
                          }}
                          className="input-field !py-1.5 !text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flags */}
                <div className="sm:col-span-2">
                  <label className="text-gray-400 text-sm mb-2 block">Options</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { key: 'isVeg', label: '🟢 Veg' },
                      { key: 'isSpicy', label: '🌶️ Spicy' },
                      { key: 'isBestseller', label: '👑 Bestseller' },
                      { key: 'isFeatured', label: '⭐ Featured' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form[key]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                          className="w-4 h-4 accent-orange-500"
                        />
                        <span className="text-gray-300 text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 !justify-center !py-2.5">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 !justify-center !py-2.5">
                  {saving ? <><Loader size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> {editing ? 'Update' : 'Create'}</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
