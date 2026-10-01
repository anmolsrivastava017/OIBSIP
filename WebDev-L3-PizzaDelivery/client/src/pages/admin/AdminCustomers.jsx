import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ToggleLeft, ToggleRight, ShoppingBag, Mail, Phone, Clock } from 'lucide-react';
import { userService } from '../../services';
import toast from 'react-hot-toast';

const AdminCustomers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [togglingId, setTogglingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll({ page, limit: 20, search });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const handleToggle = async (id) => {
    setTogglingId(id);
    try {
      const res = await userService.toggleStatus(id);
      setUsers((prev) => prev.map((u) => u._id === id ? res.data.user : u));
      toast.success(res.data.user.isActive ? 'User activated!' : 'User deactivated!');
    } catch { toast.error('Toggle failed'); }
    finally { setTogglingId(null); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black">Customer Management</h1>
        <p className="text-gray-400 text-sm">{total} customers registered</p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" placeholder="Search by name or email..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-[#1a1a1a] rounded-xl animate-pulse" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-[#1a1a1a] rounded-2xl border border-white/6">
          <p className="text-gray-400">No customers found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user, i) => (
            <motion.div key={user._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={`bg-[#1a1a1a] border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${!user.isActive ? 'border-red-500/20 opacity-70' : 'border-white/6'}`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-white font-semibold">{user.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 flex-wrap">
                  <span className="flex items-center gap-1"><Mail size={11} />{user.email}</span>
                  {user.phone && <span className="flex items-center gap-1"><Phone size={11} />{user.phone}</span>}
                  <span className="flex items-center gap-1"><Clock size={11} />Joined {new Date(user.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-center hidden sm:block">
                  <div className="text-orange-500 font-bold">{user.totalOrders || 0}</div>
                  <div className="text-gray-400 text-xs">Orders</div>
                </div>
                <div className="text-center hidden sm:block">
                  <div className="text-green-400 font-bold">₹{(user.totalSpent || 0).toLocaleString()}</div>
                  <div className="text-gray-400 text-xs">Spent</div>
                </div>
                <button
                  onClick={() => handleToggle(user._id)}
                  disabled={togglingId === user._id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50"
                  style={user.isActive
                    ? { background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)', color: '#f87171' }
                    : { background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)', color: '#34d399' }
                  }
                >
                  {user.isActive ? <><ToggleRight size={14} /> Deactivate</> : <><ToggleLeft size={14} /> Activate</>}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary !py-2 !px-4 !text-sm disabled:opacity-40">Previous</button>
          <span className="flex items-center text-gray-400 text-sm">Page {page} of {Math.ceil(total / 20)}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 20)} className="btn-secondary !py-2 !px-4 !text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
