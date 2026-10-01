import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Lock, Save, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
  });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await authService.updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        address: { street: profileForm.street, city: profileForm.city, state: profileForm.state, postalCode: profileForm.postalCode },
      });
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPassLoading(true);
    try {
      await authService.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black mb-8">My <span className="gradient-text">Profile</span></h1>

        {/* Profile Header */}
        <div className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">{user?.name}</h2>
            <p className="text-gray-400">{user?.email}</p>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 inline-block ${user?.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </span>
          </div>
          <div className="ml-auto text-right hidden sm:block">
            <div className="text-2xl font-black text-orange-500">{user?.totalOrders || 0}</div>
            <div className="text-gray-400 text-sm">Total Orders</div>
          </div>
        </div>

        {/* Update Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
            <User size={18} className="text-orange-500" /> Update Profile
          </h2>
          <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="input-field"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Phone</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="input-field"
                placeholder="10-digit number"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-400 text-sm mb-1.5">Street Address</label>
              <input
                type="text"
                value={profileForm.street}
                onChange={(e) => setProfileForm({ ...profileForm, street: e.target.value })}
                className="input-field"
                placeholder="Street address"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">City</label>
              <input
                type="text"
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                className="input-field"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Postal Code</label>
              <input
                type="text"
                value={profileForm.postalCode}
                onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                className="input-field"
                placeholder="PIN code"
              />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={profileLoading} className="btn-primary !py-2.5">
                {profileLoading ? <><Loader size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
            <Lock size={18} className="text-orange-500" /> Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
            {[
              { key: 'currentPassword', label: 'Current Password', placeholder: 'Current password' },
              { key: 'newPassword', label: 'New Password', placeholder: 'Min 6 characters' },
              { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Repeat new password' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-gray-400 text-sm mb-1.5">{label}</label>
                <input
                  type="password"
                  value={passForm[key]}
                  onChange={(e) => setPassForm({ ...passForm, [key]: e.target.value })}
                  className="input-field"
                  placeholder={placeholder}
                />
              </div>
            ))}
            <button type="submit" disabled={passLoading} className="btn-primary !py-2.5">
              {passLoading ? <><Loader size={16} className="animate-spin" /> Changing...</> : <><Lock size={16} /> Change Password</>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
