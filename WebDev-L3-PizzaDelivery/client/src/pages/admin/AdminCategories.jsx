import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, Loader } from 'lucide-react';
import { categoryService } from '../../services';
import toast from 'react-hot-toast';

const defaultForm = { name: '', description: '', image: '', sortOrder: 0 };

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchCats = async () => {
    try {
      const res = await categoryService.getAllAdmin();
      setCategories(res.data.categories);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchCats(); }, []);

  const openCreate = () => { setEditing(null); setForm(defaultForm); setShowForm(true); };
  const openEdit = (cat) => { setEditing(cat._id); setForm({ name: cat.name, description: cat.description || '', image: cat.image || '', sortOrder: cat.sortOrder || 0 }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name) { toast.error('Category name required'); return; }
    setSaving(true);
    try {
      if (editing) {
        const res = await categoryService.update(editing, form);
        setCategories((prev) => prev.map((c) => c._id === editing ? res.data.category : c));
        toast.success('Category updated!');
      } else {
        const res = await categoryService.create(form);
        setCategories((prev) => [...prev, res.data.category]);
        toast.success('Category created!');
      }
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { await categoryService.delete(id); setCategories((prev) => prev.filter((c) => c._id !== id)); toast.success('Deleted!'); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Category Management</h1>
          <p className="text-gray-400 text-sm">{categories.length} categories</p>
        </div>
        <button onClick={openCreate} className="btn-primary !py-2 !px-4 !text-sm">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-24 bg-[#1a1a1a] rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div key={cat._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[#1a1a1a] border border-white/6 rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 text-2xl">
                {getCatEmoji(cat.slug)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">{cat.name}</h3>
                <p className="text-gray-400 text-xs truncate">{cat.description || cat.slug}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${cat.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10">
                  <Edit2 size={14} className="text-blue-400" />
                </button>
                <button onClick={() => handleDelete(cat._id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold">{editing ? 'Edit Category' : 'Add Category'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-lg"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Category name" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Description</label>
                  <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="Short description" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="input-field" />
                </div>
              </div>
              <div className="flex gap-3 mt-5 pt-4 border-t border-white/5">
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

const getCatEmoji = (slug) => ({ classic: '🍕', veggie: '🥦', 'non-veg': '🍗', premium: '👑', spicy: '🌶️' })[slug] || '🍕';

export default AdminCategories;
