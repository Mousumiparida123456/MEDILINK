import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, FileText, Pill, Stethoscope, Bell, User as UserIcon, Settings, LogOut, 
  Search, Clock, MapPin, ChevronRight, Activity
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'reservations' | 'records' | 'prescriptions' | 'doctors' | 'notifications' | 'profile' | 'settings'>('overview');

  // Initial Default Reservations
  const DEFAULT_RESERVATIONS = [
    { id: 'res_101', medicine: 'Amoxicillin 500mg', pharmacy: 'City Central Pharmacy', status: 'Ready for Pickup', date: '2026-09-08', price: 18.50 },
    { id: 'res_102', medicine: 'Paracetamol Extra 650mg', pharmacy: 'Apollo Pharmacy KIIT', status: 'Completed', date: '2026-09-02', price: 12.00 },
    { id: 'res_103', medicine: 'Atorvastatin 20mg', pharmacy: 'Metro Meds 24/7', status: 'Processing', date: '2026-09-09', price: 34.00 },
  ];

  // Dynamic User Reservations State
  const [reservations, setReservations] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('medilink_reservations');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading local reservations:', e);
    }
    return DEFAULT_RESERVATIONS;
  });

  // Sync state with localStorage whenever reservations are updated
  useEffect(() => {
    const loadReservations = () => {
      try {
        const stored = localStorage.getItem('medilink_reservations');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReservations(parsed);
            return;
          }
        }
      } catch (e) {
        console.warn('Error loading reservations:', e);
      }
      setReservations(DEFAULT_RESERVATIONS);
    };

    window.addEventListener('medilink_reservation_created', loadReservations);
    window.addEventListener('storage', loadReservations);
    window.addEventListener('focus', loadReservations);

    return () => {
      window.removeEventListener('medilink_reservation_created', loadReservations);
      window.removeEventListener('storage', loadReservations);
      window.removeEventListener('focus', loadReservations);
    };
  }, []);

  const [records] = useState([
    { id: 'rec_1', title: 'Blood Work Report - Q3', doctor: 'Dr. Emily Ross', date: '2026-08-15', fileType: 'PDF' },
    { id: 'rec_2', title: 'Cardiology Consultation Notes', doctor: 'Dr. Marcus Vance', date: '2026-07-22', fileType: 'PDF' },
    { id: 'rec_3', title: 'Annual Health Physical', doctor: 'Dr. Sarah Jenkins', date: '2026-05-10', fileType: 'PDF' },
  ]);

  const [prescriptions] = useState([
    { id: 'rx_1', name: 'Amoxicillin Trihydrate', dosage: '500mg - 3x Daily', refillsLeft: 2, doctor: 'Dr. Emily Ross', activeUntil: '2026-10-15' },
    { id: 'rx_2', name: 'Lisinopril', dosage: '10mg - Once Daily', refillsLeft: 4, doctor: 'Dr. Marcus Vance', activeUntil: '2026-12-01' },
  ]);

  const [doctors] = useState([
    { id: 'doc_1', name: 'Dr. Emily Ross', specialty: 'General Physician', location: 'City Healthcare Clinic', rating: 4.9, available: 'Today' },
    { id: 'doc_2', name: 'Dr. Marcus Vance', specialty: 'Cardiologist', location: 'Heart & Vascular Center', rating: 4.8, available: 'Tomorrow' },
    { id: 'doc_3', name: 'Dr. Anita Patel', specialty: 'Pediatrician', location: 'Family Health Hub', rating: 5.0, available: 'Sep 12' },
  ]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Bar */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-100 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 text-primary rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-inner">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Welcome, {user?.name || 'Patient'}</h1>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-primary text-xs font-bold rounded-full uppercase">
                  Patient Portal
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">{user?.email} • ID: {user?.id}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link 
              to="/find" 
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-primary" /> Find Medicine
            </Link>
            <Link 
              to="/optimizer" 
              className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2 shadow-sm"
            >
              <Pill className="w-4 h-4" /> Prescription Optimizer
            </Link>
            <button 
              onClick={handleLogout}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-sm transition-colors flex items-center gap-2 border border-rose-100"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Main Grid: Sidebar Nav + Dashboard Body */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1 bg-white p-4 rounded-3xl shadow-soft border border-slate-100 h-fit space-y-1">
            <div className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
              User Menu
            </div>

            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'reservations', label: 'Reservations & Orders', icon: Calendar, badge: reservations.length },
              { id: 'records', label: 'Medical Records', icon: FileText },
              { id: 'prescriptions', label: 'My Prescriptions', icon: Pill },
              { id: 'doctors', label: 'Doctors & Clinics', icon: Stethoscope },
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: 2 },
              { id: 'profile', label: 'My Profile', icon: UserIcon },
              { id: 'settings', label: 'Account Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={clsx(
                    "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left",
                    isActive 
                      ? "bg-primary text-white shadow-soft" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={clsx("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span className={clsx("text-xs px-2 py-0.5 rounded-full font-bold", isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600")}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-primary rounded-2xl flex items-center justify-center">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Active Reservations</p>
                      <h3 className="text-2xl font-extrabold text-slate-900">{reservations.length}</h3>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-secondary rounded-2xl flex items-center justify-center">
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Active Prescriptions</p>
                      <h3 className="text-2xl font-extrabold text-slate-900">{prescriptions.length}</h3>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Medical Records</p>
                      <h3 className="text-2xl font-extrabold text-slate-900">{records.length}</h3>
                    </div>
                  </div>
                </div>

                {/* Recent Reservations */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" /> Recent Medicine Reservations
                    </h3>
                    <button onClick={() => setActiveTab('reservations')} className="text-xs font-bold text-primary hover:underline">
                      View All
                    </button>
                  </div>

                  <div className="space-y-4">
                    {reservations.map((res) => (
                      <div key={res.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900">{res.medicine}</h4>
                            <span className={clsx("text-xs px-2.5 py-0.5 rounded-full font-bold", 
                              res.status === 'Ready for Pickup' ? 'bg-emerald-100 text-emerald-700' :
                              res.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                            )}>
                              {res.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                            <span><MapPin className="w-3 h-3 inline text-slate-400" /> {res.pharmacy}</span>
                            <span>•</span>
                            <span>{res.date}</span>
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <span className="font-extrabold text-slate-900">${res.price.toFixed(2)}</span>
                          <button className="text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors">
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-3xl shadow-soft">
                    <Pill className="w-8 h-8 mb-4 opacity-90" />
                    <h3 className="text-xl font-bold mb-1">Need a Medicine Refill?</h3>
                    <p className="text-xs text-emerald-100 mb-6">Search real-time stock across 500+ verified pharmacies in your local area.</p>
                    <Link to="/find" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-800 font-bold rounded-xl text-xs hover:bg-emerald-50 transition-colors shadow-sm">
                      Search Pharmacies <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-3xl shadow-soft">
                    <Activity className="w-8 h-8 mb-4 opacity-90" />
                    <h3 className="text-xl font-bold mb-1">Prescription Route Optimizer</h3>
                    <p className="text-xs text-blue-100 mb-6">Calculate the cheapest & fastest route to collect all your prescribed medications.</p>
                    <Link to="/optimizer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-900 font-bold rounded-xl text-xs hover:bg-blue-50 transition-colors shadow-sm">
                      Run Optimizer <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

              </div>
            )}

            {/* RESERVATIONS TAB */}
            {activeTab === 'reservations' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-100 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Reservations & Pickup Orders</h3>
                    <p className="text-xs text-slate-500">Track and manage your reserved medications.</p>
                  </div>
                  <Link to="/find" className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-sm hover:bg-primary-dark">
                    + New Reservation
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {reservations.map((res) => (
                    <div key={res.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{res.medicine}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{res.pharmacy} • Reserved on {res.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-slate-900">${res.price.toFixed(2)}</span>
                        <span className="text-xs px-3 py-1 rounded-full font-bold bg-emerald-50 text-primary border border-emerald-100">
                          {res.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MEDICAL RECORDS TAB */}
            {activeTab === 'records' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-100 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Medical Records Ledger</h3>
                    <p className="text-xs text-slate-500">Securely view your health reports and doctor consultations.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {records.map((rec) => (
                    <div key={rec.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-secondary rounded-xl flex items-center justify-center font-bold text-xs">
                          {rec.fileType}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{rec.title}</h4>
                          <p className="text-xs text-slate-500">{rec.doctor} • {rec.date}</p>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-primary bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-100 transition-colors">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PRESCRIPTIONS TAB */}
            {activeTab === 'prescriptions' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-100 space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Active Prescriptions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prescriptions.map((rx) => (
                    <div key={rx.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-900">{rx.name}</h4>
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                          {rx.refillsLeft} refills left
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">Dosage: {rx.dosage}</p>
                      <p className="text-xs text-slate-500">Prescribed by {rx.doctor} • Valid until {rx.activeUntil}</p>
                      <Link to="/find" className="inline-block mt-2 text-xs font-bold text-primary hover:underline">
                        Order Refill Now →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DOCTORS TAB */}
            {activeTab === 'doctors' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-100 space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Partnered Doctors & Clinics</h3>
                <div className="space-y-4">
                  {doctors.map((doc) => (
                    <div key={doc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="font-bold text-slate-900">{doc.name}</h4>
                        <p className="text-xs text-slate-500">{doc.specialty} • {doc.location}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                          ★ {doc.rating}
                        </span>
                        <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-colors">
                          Book Appointment
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-100 space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Notifications</h3>
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
                  <Bell className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Reservation Ready</h4>
                    <p className="text-xs text-slate-600 mt-1">Your reservation for Amoxicillin 500mg is ready for pickup at City Central Pharmacy.</p>
                  </div>
                </div>
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-100 space-y-6">
                <h3 className="text-xl font-bold text-slate-900">User Profile</h3>
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                    <input type="text" readOnly value={user?.name || ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                    <input type="email" readOnly value={user?.email || ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                    <input type="text" readOnly value={user?.role?.toUpperCase() || 'USER'} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-primary" />
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-100 space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Account & Privacy Settings</h3>
                <div className="space-y-4 max-w-lg">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Email Notifications</h4>
                      <p className="text-xs text-slate-500">Receive medicine availability alerts via email</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Two-Factor Authentication</h4>
                      <p className="text-xs text-slate-500">Secure your Medilink account with 2FA</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 accent-primary" />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
