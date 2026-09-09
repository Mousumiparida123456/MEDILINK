import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Stethoscope, Calendar, TrendingUp, AlertTriangle, FileText, Settings, 
  LogOut, User as UserIcon, CheckCircle2, Plus, ShieldCheck, Activity, Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export function ManagerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'doctors' | 'appointments' | 'analytics' | 'reports' | 'alerts' | 'profile' | 'settings'>('overview');

  // Manager State Data
  const [stats] = useState({
    totalUsers: 1420,
    totalDoctors: 86,
    todaysAppointments: 42,
    pendingAppointments: 14,
    completedAppointments: 28,
    activePatients: 890,
    alertsCount: 3,
  });

  const [usersList, setUsersList] = useState([
    { id: 'usr_1', name: 'Sarah Jenkins', email: 'sarah.j@example.com', role: 'Patient', status: 'Active', joined: '2026-01-12' },
    { id: 'usr_2', name: 'David Chen', email: 'david.chen@example.com', role: 'Patient', status: 'Active', joined: '2026-02-19' },
    { id: 'usr_3', name: 'Emily Watson', email: 'emily.w@example.com', role: 'Patient', status: 'Pending Verification', joined: '2026-03-05' },
    { id: 'usr_4', name: 'Robert Miller', email: 'robert.m@example.com', role: 'Patient', status: 'Banned', joined: '2025-11-20' },
  ]);

  const [doctorsList, setDoctorsList] = useState([
    { id: 'doc_1', name: 'Dr. Emily Ross', specialty: 'General Practitioner', hospital: 'City Central Hospital', status: 'Verified', patientsCount: 145 },
    { id: 'doc_2', name: 'Dr. Marcus Vance', specialty: 'Cardiologist', hospital: 'Heart Institute', status: 'Verified', patientsCount: 98 },
    { id: 'doc_3', name: 'Dr. Anita Patel', specialty: 'Pediatrician', hospital: 'Family Care Clinic', status: 'Pending Review', patientsCount: 52 },
    { id: 'doc_4', name: 'Dr. James Wilson', specialty: 'Neurologist', hospital: 'Metro General', status: 'Verified', patientsCount: 110 },
  ]);

  const [appointmentsList] = useState([

    { id: 'apt_101', patient: 'Sarah Jenkins', doctor: 'Dr. Emily Ross', date: 'Today, 2:30 PM', type: 'General Checkup', status: 'Pending' },
    { id: 'apt_102', patient: 'David Chen', doctor: 'Dr. Marcus Vance', date: 'Today, 4:00 PM', type: 'Cardiology Review', status: 'Confirmed' },
    { id: 'apt_103', patient: 'Michael Brown', doctor: 'Dr. Anita Patel', date: 'Yesterday', type: 'Pediatric Consultation', status: 'Completed' },
  ]);

  const [alertsList] = useState([
    { id: 'alt_1', title: 'Low Inventory Warning', desc: 'Amoxicillin stock at City Central Pharmacy dropped below threshold (5 left).', severity: 'High', time: '10 mins ago' },
    { id: 'alt_2', title: 'New Doctor Verification Request', desc: 'Dr. Anita Patel submitted credentials for platform verification.', severity: 'Medium', time: '1 hour ago' },
    { id: 'alt_3', title: 'System Security Audit Clean', desc: 'Weekly automated security scan completed with 0 vulnerabilities.', severity: 'Low', time: '3 hours ago' },
  ]);

  // Analytics Chart Data
  const analyticsData = [
    { day: 'Mon', activeUsers: 640, appointments: 32, revenue: 1450 },
    { day: 'Tue', activeUsers: 780, appointments: 45, revenue: 2100 },
    { day: 'Wed', activeUsers: 820, appointments: 38, revenue: 1890 },
    { day: 'Thu', activeUsers: 910, appointments: 52, revenue: 2400 },
    { day: 'Fri', activeUsers: 890, appointments: 48, revenue: 2250 },
    { day: 'Sat', activeUsers: 720, appointments: 28, revenue: 1300 },
    { day: 'Sun', activeUsers: 650, appointments: 20, revenue: 980 },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out from Manager Portal');
    navigate('/login', { replace: true });
  };

  const handleToggleUserStatus = (id: string) => {
    setUsersList(usersList.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Active' ? 'Banned' : 'Active';
        toast.success(`User ${u.name} status changed to ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleVerifyDoctor = (id: string) => {
    setDoctorsList(doctorsList.map(d => {
      if (d.id === id) {
        toast.success(`Doctor ${d.name} verified successfully!`);
        return { ...d, status: 'Verified' };
      }
      return d;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Manager Header Bar */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold">MediLink Manager Console</h1>
                <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold rounded-full uppercase">
                  Admin Control Panel
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">Logged in as {user?.name || 'Manager'} ({user?.email})</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2 shadow-sm"
            >
              <LogOut className="w-4 h-4" /> Logout Manager Session
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Manager Sidebar Nav */}
          <div className="lg:col-span-1 bg-white p-4 rounded-3xl shadow-soft border border-slate-100 h-fit space-y-1">
            <div className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Platform Administration
            </div>

            {[
              { id: 'overview', label: 'Overview Metrics', icon: Activity },
              { id: 'users', label: 'Patient & User Directory', icon: Users, badge: stats.totalUsers },
              { id: 'doctors', label: 'Doctor Management', icon: Stethoscope, badge: stats.totalDoctors },
              { id: 'appointments', label: 'Appointment Control', icon: Calendar, badge: stats.todaysAppointments },
              { id: 'analytics', label: 'Platform Analytics', icon: TrendingUp },
              { id: 'reports', label: 'Reports & Exports', icon: FileText },
              { id: 'alerts', label: 'System Alerts', icon: AlertTriangle, badge: stats.alertsCount },
              { id: 'profile', label: 'Manager Profile', icon: UserIcon },
              { id: 'settings', label: 'System Settings', icon: Settings },
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
                      ? "bg-secondary text-white shadow-soft" 
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

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* 6 Key Performance Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="bg-white p-5 rounded-3xl shadow-soft border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">Total Users</span>
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-900">{stats.totalUsers}</h3>
                    <p className="text-xs text-emerald-600 font-bold mt-1">↑ 12% vs last month</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl shadow-soft border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">Total Doctors</span>
                      <Stethoscope className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-900">{stats.totalDoctors}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">Across 18 specialties</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl shadow-soft border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">Today's Appointments</span>
                      <Calendar className="w-5 h-5 text-purple-500" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-900">{stats.todaysAppointments}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">{stats.pendingAppointments} pending review</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl shadow-soft border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">Active Patients</span>
                      <Activity className="w-5 h-5 text-teal-500" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-900">{stats.activePatients}</h3>
                    <p className="text-xs text-emerald-600 font-bold mt-1">Active this week</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl shadow-soft border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">Completed Today</span>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-900">{stats.completedAppointments}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">66% completion rate</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl shadow-soft border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">System Alerts</span>
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-rose-600">{stats.alertsCount}</h3>
                    <p className="text-xs text-rose-500 font-bold mt-1">Action required</p>
                  </div>
                </div>

                {/* Analytics Chart Preview */}
                <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Weekly Active Platform Traffic & Bookings</h3>
                    <span className="text-xs text-slate-500">Real-time sync</span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="activeUsers" name="Active Users" fill="#0284c7" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="appointments" name="Appointments" fill="#10b981" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* System Alerts Container */}
                <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100 space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" /> Recent Manager Alerts
                  </h3>
                  <div className="space-y-3">
                    {alertsList.map((alt) => (
                      <div key={alt.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{alt.title}</h4>
                            <span className={clsx("text-[10px] px-2 py-0.5 rounded font-bold uppercase", 
                              alt.severity === 'High' ? 'bg-rose-100 text-rose-700' :
                              alt.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                            )}>
                              {alt.severity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{alt.desc}</p>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">{alt.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-100 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Patient & User Management</h3>
                    <p className="text-xs text-slate-500">Review registered accounts and manage platform permissions.</p>
                  </div>
                  <button onClick={() => toast.success('Add user modal opened')} className="px-4 py-2 bg-secondary text-white font-bold rounded-xl text-xs flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add New User
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                        <th className="p-3">User Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Joined Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {usersList.map((usr) => (
                        <tr key={usr.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-bold text-slate-900">{usr.name}</td>
                          <td className="p-3 text-slate-600">{usr.email}</td>
                          <td className="p-3 font-semibold text-slate-700">{usr.role}</td>
                          <td className="p-3 text-slate-500">{usr.joined}</td>
                          <td className="p-3">
                            <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-bold", 
                              usr.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                              usr.status === 'Banned' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                            )}>
                              {usr.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button 
                              onClick={() => handleToggleUserStatus(usr.id)}
                              className={clsx("px-3 py-1 rounded-lg text-xs font-bold transition-colors", 
                                usr.status === 'Active' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              )}
                            >
                              {usr.status === 'Active' ? 'Ban User' : 'Unban User'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* DOCTORS TAB */}
            {activeTab === 'doctors' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-100 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Doctor & Healthcare Provider Verification</h3>
                    <p className="text-xs text-slate-500">Manage doctor credentials, licenses, and availability status.</p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {doctorsList.map((doc) => (
                    <div key={doc.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900">{doc.name}</h4>
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-600">{doc.specialty}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{doc.hospital} • {doc.patientsCount} Active Patients</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={clsx("text-xs px-3 py-1 rounded-full font-bold", 
                          doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        )}>
                          {doc.status}
                        </span>
                        {doc.status !== 'Verified' && (
                          <button 
                            onClick={() => handleVerifyDoctor(doc.id)}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
                          >
                            Approve & Verify
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* APPOINTMENTS TAB */}
            {activeTab === 'appointments' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-100 space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Appointment Ledger & Dispatch</h3>
                <div className="space-y-3">
                  {appointmentsList.map((apt) => (
                    <div key={apt.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{apt.type} - {apt.patient}</h4>
                        <p className="text-xs text-slate-500">Assigned to: {apt.doctor} • {apt.date}</p>
                      </div>
                      <span className={clsx("text-xs px-3 py-1 rounded-full font-bold", 
                        apt.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                        apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      )}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-100 space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Platform Analytics & Financial Reports</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="revenue" name="Daily Revenue ($)" stroke="#0284c7" strokeWidth={3} dot={{r: 4}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* REPORTS TAB */}
            {activeTab === 'reports' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-100 space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Compliance & System Reports</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Monthly Patient Audit Log</h4>
                      <p className="text-xs text-slate-500">August 2026 • PDF Format</p>
                    </div>
                    <button onClick={() => toast.success('Report downloaded')} className="p-2 bg-white rounded-xl border text-slate-600 hover:text-primary">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Pharmacy Inventory Sync Report</h4>
                      <p className="text-xs text-slate-500">Weekly Summary • CSV Format</p>
                    </div>
                    <button onClick={() => toast.success('Report downloaded')} className="p-2 bg-white rounded-xl border text-slate-600 hover:text-primary">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ALERTS TAB */}
            {activeTab === 'alerts' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-100 space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Active System Alerts</h3>
                <div className="space-y-3">
                  {alertsList.map((alt) => (
                    <div key={alt.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{alt.title}</h4>
                        <p className="text-xs text-slate-600 mt-1">{alt.desc}</p>
                      </div>
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                        {alt.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-100 space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Manager Profile Details</h3>
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Manager Name</label>
                    <input type="text" readOnly value={user?.name || 'Alex Rivera'} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admin Email</label>
                    <input type="email" readOnly value={user?.email || 'manager@medilink.com'} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Access Level</label>
                    <input type="text" readOnly value="FULL PLATFORM MANAGER ACCESS" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-secondary" />
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-100 space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Global Manager Settings</h3>
                <div className="space-y-4 max-w-lg">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Auto-Approve Verified Doctors</h4>
                      <p className="text-xs text-slate-500">Automatically grant platform access upon medical license check</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-secondary" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Real-Time Inventory Alert Notifications</h4>
                      <p className="text-xs text-slate-500">Receive instant push notifications for low pharmacy stock</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-secondary" />
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
