import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Users, DollarSign, Package, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { orderService } from '../../services';

const statusStyle = {
  PLACED: 'status-placed',
  CONFIRMED: 'status-confirmed',
  PREPARING: 'status-preparing',
  OUT_FOR_DELIVERY: 'status-out_for_delivery',
  DELIVERED: 'status-delivered',
  CANCELLED: 'status-cancelled',
};

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-5"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-3xl font-black text-white mt-1">{value}</p>
        {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await orderService.getStats();
        setStats(res.data.stats);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusMap = {};
  stats?.statusCounts?.forEach((s) => { statusMap[s._id] = s.count; });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Live overview of PizzaHub operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₹${((stats?.totalRevenue || 0) / 1000).toFixed(1)}K`}
          subtitle="From paid orders"
          icon={DollarSign}
          color="bg-gradient-to-br from-green-500 to-emerald-600"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          subtitle="All time orders"
          icon={ShoppingBag}
          color="bg-gradient-to-br from-blue-500 to-cyan-600"
        />
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          subtitle="Registered users"
          icon={Users}
          color="bg-gradient-to-br from-purple-500 to-pink-600"
        />
        <StatCard
          title="Pending Orders"
          value={(statusMap['PLACED'] || 0) + (statusMap['CONFIRMED'] || 0) + (statusMap['PREPARING'] || 0)}
          subtitle="Need attention"
          icon={Clock}
          color="bg-gradient-to-br from-orange-500 to-red-600"
        />
      </div>

      {/* Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-5">
          <h2 className="text-white font-bold mb-4">Order Status Breakdown</h2>
          <div className="space-y-3">
            {[
              { key: 'PLACED', label: 'Placed', icon: Package },
              { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
              { key: 'PREPARING', label: 'Preparing', icon: Clock },
              { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: TrendingUp },
              { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
              { key: 'CANCELLED', label: 'Cancelled', icon: AlertCircle },
            ].map(({ key, label, icon: Icon }) => {
              const count = statusMap[key] || 0;
              const total = stats?.totalOrders || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle[key]}`}>{label}</span>
                    <span className="text-white text-sm font-bold">{count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full">
                    <div
                      className="h-1.5 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">Low Stock Alert</h2>
            <Link to="/admin/products" className="text-orange-500 text-xs hover:text-orange-400 flex items-center gap-1">
              Manage <ChevronRight size={12} />
            </Link>
          </div>
          {stats?.lowStock?.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">All products are well stocked!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.lowStock?.map((pizza) => (
                <div key={pizza._id} className="flex items-center gap-3">
                  <img src={pizza.image} alt={pizza.name} className="w-10 h-10 rounded-lg object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&q=80'; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{pizza.name}</p>
                    <p className={`text-xs ${pizza.stock === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                      {pizza.stock === 0 ? 'Out of stock' : `${pizza.stock} left`}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${pizza.stock === 0 ? 'bg-red-500' : 'bg-yellow-500'}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold">Recent Orders</h2>
          <Link to="/admin/orders" className="text-orange-500 text-xs hover:text-orange-400 flex items-center gap-1">
            View All <ChevronRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-gray-400 font-medium py-2 pr-4">Order</th>
                <th className="text-left text-gray-400 font-medium py-2 pr-4">Customer</th>
                <th className="text-left text-gray-400 font-medium py-2 pr-4">Status</th>
                <th className="text-right text-gray-400 font-medium py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.map((order) => (
                <tr key={order._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="py-3 pr-4">
                    <Link to={`/admin/orders`} className="text-orange-500 hover:text-orange-400 font-mono text-xs">
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-gray-300">{order.customer?.name || 'N/A'}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle[order.status]}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-right text-orange-500 font-bold">₹{order.pricing?.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
