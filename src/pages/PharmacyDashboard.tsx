import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';

export function PharmacyDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setStats(data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'pharmacy') fetchStats();
  }, [token, user]);

  if (user?.role !== 'pharmacy') {
    return <div className="p-20 text-center text-rose-500 font-bold">Access Denied: Pharmacy Role Required</div>;
  }

  if (loading || !stats) return <div className="p-20 text-center">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Pharmacy Dashboard</h1>
        <p className="text-slate-500">Welcome back, {user.name}. Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-secondary rounded-xl flex items-center justify-center"><Package className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Medicines</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.totalMedicines}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-primary rounded-xl flex items-center justify-center"><Calendar className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Today's Reservations</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.todaysReservations}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center"><TrendingUp className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Weekly Revenue</p>
            <h3 className="text-2xl font-bold text-slate-900">$3,450</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center"><AlertTriangle className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Low Stock Alerts</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.lowStockCount}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-6">Revenue Analytics (Last 7 Days)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `$${value}`} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar Alerts */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500"/> Low Stock Alerts</h3>
            {stats.lowStockItems?.length > 0 ? (
              <div className="space-y-3">
                {stats.lowStockItems.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <span className="font-medium text-slate-900">{item.brandName}</span>
                    <span className="text-xs font-bold text-rose-500 bg-rose-100 px-2 py-1 rounded">Only {item.stockAvailability.quantity} left</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">All inventory levels look good.</p>
            )}
            <button className="w-full mt-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Manage Inventory</button>
          </div>
        </div>
      </div>
    </div>
  );
}
