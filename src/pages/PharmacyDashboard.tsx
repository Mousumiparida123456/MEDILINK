import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, TrendingUp, AlertTriangle, Calendar, Plus, Edit2, Trash2, Search, CheckCircle2, X } from 'lucide-react';
import clsx from 'clsx';

export function PharmacyDashboard() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory'>('overview');
  
  // Dashboard state
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Inventory state
  const [inventory, setInventory] = useState<any[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state for Add/Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    brandName: '',
    genericName: '',
    price: '',
    quantity: '',
    diseaseTags: '',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/stats`, {
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

  const fetchInventory = async () => {
    setInventoryLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setInventory(data);
    } catch (err) {
      console.error("Inventory fetch error:", err);
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchInventory();
    }
  }, [activeTab]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ brandName: '', genericName: '', price: '', quantity: '', diseaseTags: '' });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item._id);
    setFormData({
      brandName: item.brandName,
      genericName: item.genericName,
      price: item.price.toString(),
      quantity: item.stockAvailability.quantity.toString(),
      diseaseTags: item.diseaseTags ? item.diseaseTags.join(', ') : '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchInventory();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      brandName: formData.brandName,
      genericName: formData.genericName,
      price: Number(formData.price),
      stockAvailability: {
        inStock: Number(formData.quantity) > 0,
        quantity: Number(formData.quantity)
      },
      diseaseTags: formData.diseaseTags.split(',').map(t => t.trim()).filter(t => t)
    };

    try {
      const url = editingId 
        ? `${import.meta.env.VITE_API_URL}/api/inventory/${editingId}` 
        : `${import.meta.env.VITE_API_URL}/api/inventory`;
      
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsFormOpen(false);
        fetchInventory();
        // Refresh dashboard stats silently
        const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (statsRes.ok) setStats(await statsRes.json());
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  if (user?.role !== 'pharmacy') {
    return <div className="p-20 text-center text-rose-500 font-bold">Access Denied: Pharmacy Role Required</div>;
  }

  if (loading || !stats) return <div className="p-20 text-center">Loading Dashboard...</div>;

  const filteredInventory = inventory.filter(item => 
    item.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.genericName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Pharmacy Dashboard</h1>
          <p className="text-slate-500">Welcome back, {user.name}.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('overview')}
            className={clsx("flex-1 md:px-8 py-2.5 rounded-lg text-sm font-bold transition-all", activeTab === 'overview' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={clsx("flex-1 md:px-8 py-2.5 rounded-lg text-sm font-bold transition-all", activeTab === 'inventory' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
          >
            Inventory Management
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                <button onClick={() => setActiveTab('inventory')} className="w-full mt-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Manage Inventory</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white rounded-2xl shadow-soft border border-slate-100 p-6">
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search medicines..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <button onClick={handleOpenAdd} className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-colors">
              <Plus className="h-5 w-5" /> Add Medicine
            </button>
          </div>

          {inventoryLoading ? (
            <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-sm font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Brand Name</th>
                    <th className="p-4">Generic Name</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredInventory.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4 font-bold text-slate-900">{item.brandName}</td>
                      <td className="p-4 text-slate-600">{item.genericName}</td>
                      <td className="p-4 text-slate-900 font-medium">${item.price.toFixed(2)}</td>
                      <td className="p-4 font-medium">{item.stockAvailability.quantity}</td>
                      <td className="p-4">
                        {item.stockAvailability.inStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="h-3 w-3"/> In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                            <AlertTriangle className="h-3 w-3"/> Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(item)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredInventory.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">No medicines found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Medicine' : 'Add New Medicine'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Brand Name *</label>
                  <input required type="text" value={formData.brandName} onChange={e => setFormData({...formData, brandName: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. Panadol" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Generic Name *</label>
                  <input required type="text" value={formData.genericName} onChange={e => setFormData({...formData, genericName: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. Paracetamol" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Price ($) *</label>
                  <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Stock Quantity *</label>
                  <input required type="number" min="0" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="100" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Disease Tags (comma separated)</label>
                <input type="text" value={formData.diseaseTags} onChange={e => setFormData({...formData, diseaseTags: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. fever, headache, pain relief" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-colors shadow-sm">{editingId ? 'Save Changes' : 'Add Medicine'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
