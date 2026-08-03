import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Store, Activity, Trash2, Ban, TrendingUp, Map as MapIcon, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import toast from 'react-hot-toast';

export function AdminDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') return;

    const fetchData = async () => {
      try {
        const [statsRes, usersRes, pharmRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/pharmacies`, { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());
        if (pharmRes.ok) setPharmacies(await pharmRes.json());
      } catch (err) {
        console.error("Admin fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, user]);

  const handleDelete = async (id: string, type: 'user' | 'pharmacy') => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        if (type === 'user') setUsers(users.filter(u => u._id !== id));
        if (type === 'pharmacy') setPharmacies(pharmacies.filter(p => p._id !== id));
        toast.success(`${type} deleted successfully`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete');
    }
  };

  const handleStatusToggle = async (id: string, type: 'user' | 'pharmacy', updates: { isVerified?: boolean, isBanned?: boolean }) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updatedUser = await res.json();
        if (type === 'user') setUsers(users.map(u => u._id === id ? updatedUser : u));
        if (type === 'pharmacy') setPharmacies(pharmacies.map(p => p._id === id ? updatedUser : p));
        toast.success(`Status updated successfully`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  // Mock data for Analytics
  const trendData = [
    { name: 'Mon', users: 400, searches: 240 },
    { name: 'Tue', users: 300, searches: 139 },
    { name: 'Wed', users: 500, searches: 480 },
    { name: 'Thu', users: 278, searches: 390 },
    { name: 'Fri', users: 189, searches: 480 },
    { name: 'Sat', users: 239, searches: 380 },
    { name: 'Sun', users: 349, searches: 430 },
  ];
  
  // Mock hotspots for Heat Map
  const hotspots = [
    { pos: [51.505, -0.09], intensity: 800 },
    { pos: [51.51, -0.1], intensity: 400 },
    { pos: [51.49, -0.08], intensity: 600 }
  ];

  if (user?.role !== 'admin') return <div className="p-20 text-center font-bold text-rose-500">Super Admin Access Required</div>;
  if (loading || !stats) return <div className="p-20 text-center">Loading Admin Panel...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Super Admin Panel</h1>
        <p className="text-slate-500">Platform-wide overview and management.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 mb-8">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={clsx("pb-4 px-2 font-bold transition-colors", activeTab === 'overview' ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-700")}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={clsx("pb-4 px-2 font-bold transition-colors", activeTab === 'users' ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-700")}
        >
          Manage Users
        </button>
        <button 
          onClick={() => setActiveTab('pharmacies')} 
          className={clsx("pb-4 px-2 font-bold transition-colors", activeTab === 'pharmacies' ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-700")}
        >
          Manage Pharmacies
        </button>
        <button 
          onClick={() => setActiveTab('analytics')} 
          className={clsx("pb-4 px-2 font-bold transition-colors", activeTab === 'analytics' ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-700")}
        >
          Analytics
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
            <div className="w-12 h-12 bg-blue-50 text-secondary rounded-xl flex items-center justify-center mb-4"><Users className="w-6 h-6"/></div>
            <p className="text-sm text-slate-500 font-medium">Total Users</p>
            <h3 className="text-3xl font-bold text-slate-900">{stats.totalUsers}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
            <div className="w-12 h-12 bg-emerald-50 text-primary rounded-xl flex items-center justify-center mb-4"><Store className="w-6 h-6"/></div>
            <p className="text-sm text-slate-500 font-medium">Total Pharmacies</p>
            <h3 className="text-3xl font-bold text-slate-900">{stats.totalPharmacies}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-4"><Activity className="w-6 h-6"/></div>
            <p className="text-sm text-slate-500 font-medium">Total Reservations</p>
            <h3 className="text-3xl font-bold text-slate-900">{stats.totalReservations}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-4"><span className="font-bold text-xl">$</span></div>
            <p className="text-sm text-slate-500 font-medium">Est. Platform Revenue</p>
            <h3 className="text-3xl font-bold text-slate-900">${stats.platformRevenue.toLocaleString()}</h3>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">{u.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right flex justify-end gap-2">
                    <button 
                      onClick={() => handleStatusToggle(u._id, 'user', { isBanned: !u.isBanned })} 
                      className={clsx("p-2 rounded-lg transition-colors", u.isBanned ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-600 hover:text-amber-600")}
                      title={u.isBanned ? "Unban User" : "Ban User"}
                    >
                      <Ban className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(u._id, 'user')} className="text-rose-500 hover:text-rose-700 bg-rose-50 p-2 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'pharmacies' && (
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pharmacy Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {pharmacies.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">{p.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">{p.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">{format(new Date(p.createdAt), 'MMM d, yyyy')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right flex justify-end gap-2">
                    <button 
                      onClick={() => handleStatusToggle(p._id, 'pharmacy', { isVerified: !p.isVerified })} 
                      className={clsx("p-2 rounded-lg transition-colors", p.isVerified ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600 hover:text-emerald-600")}
                      title={p.isVerified ? "Revoke Verification" : "Verify Pharmacy"}
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleStatusToggle(p._id, 'pharmacy', { isBanned: !p.isBanned })} 
                      className={clsx("p-2 rounded-lg transition-colors", p.isBanned ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-600 hover:text-amber-600")}
                      title={p.isBanned ? "Unban Pharmacy" : "Ban Pharmacy"}
                    >
                      <Ban className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(p._id, 'pharmacy')} className="text-rose-500 hover:text-rose-700 bg-rose-50 p-2 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Daily Platform Activity
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="users" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="searches" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <MapIcon className="h-5 w-5 text-primary" /> Search Density Heat Map (Simulated)
            </h3>
            <div className="h-[400px] rounded-xl overflow-hidden border border-slate-200 z-0">
              <MapContainer center={[51.505, -0.09]} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                {hotspots.map((spot, i) => (
                  <CircleMarker 
                    key={i} 
                    center={spot.pos as any} 
                    radius={spot.intensity / 20} 
                    pathOptions={{ color: 'transparent', fillColor: '#ef4444', fillOpacity: 0.4 }} 
                  />
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
