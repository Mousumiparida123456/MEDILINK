import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pill, Mail, Lock, User as UserIcon, ArrowRight, Loader2, Phone, Eye, EyeOff, ShieldCheck, UserCheck, AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { useAuth, DEMO_USERS, type UserRole } from '../context/AuthContext';
import toast from 'react-hot-toast';

const mockPharmacies = [
  { licenceNumber: '20/MP/123456', pharmacyName: 'ABC Medical Store', state: 'Madhya Pradesh', status: 'verified' },
  { licenceNumber: '20/MP/789012', pharmacyName: 'City Care Pharmacy', state: 'Madhya Pradesh', status: 'verified' },
];

type PharmacyVerification = typeof mockPharmacies[number];

export function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user' as UserRole,
    pharmacyName: '',
    licenceNumber: '',
    licenceType: 'Form 20',
    pharmacistName: '',
    pharmacistRegistrationNumber: '',
    licenceFileName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pharmacyVerification, setPharmacyVerification] = useState<PharmacyVerification | null>(null);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const verifyPharmacy = async () => {
    const licenceNumber = formData.licenceNumber.trim().toUpperCase();
    if (!licenceNumber) {
      setError('Please enter your Drug Licence Number first.');
      return;
    }

    setLoading(true);
    setError('');
    setPharmacyVerification(null);
    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      let verifiedPharmacy: PharmacyVerification | null = null;
      if (apiUrl && apiUrl !== 'undefined') {
        const res = await fetch(`${apiUrl}/api/pharmacies/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ licenceNumber }),
        });
        if (res.ok) verifiedPharmacy = await res.json();
        else if (res.status !== 404) throw new Error('Pharmacy could not be verified. Please check your Drug Licence Number.');
      }

      verifiedPharmacy ||= mockPharmacies.find((pharmacy) => pharmacy.licenceNumber === licenceNumber) || null;
      if (!verifiedPharmacy) {
        throw new Error('Pharmacy could not be verified. Please check your Drug Licence Number.');
      }

      setPharmacyVerification(verifiedPharmacy);
      setFormData((current) => ({ ...current, licenceNumber }));
      toast.success('Pharmacy verified');
    } catch (err: any) {
      setError(err.message || 'Pharmacy verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const trimmedEmail = formData.email.trim().toLowerCase();

    if (!formData.name || !trimmedEmail || !formData.password) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (formData.role === 'manager' && !pharmacyVerification) {
      setError('Please verify your pharmacy before creating a Manager Account.');
      setLoading(false);
      return;
    }

    try {
      // 1. Check if email already exists in DEMO_USERS
      const demoExists = Object.values(DEMO_USERS).some(
        (d) => d.email.toLowerCase() === trimmedEmail
      );
      if (demoExists) {
        setError('An account with this email address already exists. Please click Sign In to log in.');
        toast.error('Account already exists');
        setLoading(false);
        return;
      }

      // 2. Check if email already exists in medilink_local_users
      const localUsersStr = localStorage.getItem('medilink_local_users') || '[]';
      let localUsers: any[] = [];
      try {
        localUsers = JSON.parse(localUsersStr);
      } catch {
        localUsers = [];
      }

      const existingLocal = localUsers.find((u: any) => u.email.toLowerCase() === trimmedEmail);
      if (existingLocal) {
        setError('An account with this email address already exists. Please click Sign In to log in.');
        toast.error('Account already exists');
        setLoading(false);
        return;
      }

      // 3. Attempt Remote API call if backend is available
      let userData: any = null;
      let tokenStr = '';
      const apiUrl = import.meta.env.VITE_API_URL;
      
      if (apiUrl && apiUrl !== 'undefined') {
        try {
          const res = await fetch(`${apiUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, email: trimmedEmail }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.user && data.token) {
              userData = data.user;
              tokenStr = data.token;
            }
          }
        } catch (netErr) {
          console.warn('Backend server offline. Proceeding with local client database registration.');
        }
      }

      // 4. Save to local storage if API didn't process
      if (!userData) {
        const newUser = {
          id: `user_${Date.now()}`,
          name: formData.name.trim(),
          email: trimmedEmail,
          phone: formData.phone.trim() || '+1 (555) 000-0000',
          role: formData.role,
          password: formData.password,
          ...(formData.role === 'manager' ? {
            pharmacyName: formData.pharmacyName.trim(),
            licenceNumber: formData.licenceNumber.trim().toUpperCase(),
            licenceType: formData.licenceType,
            pharmacistName: formData.pharmacistName.trim(),
            pharmacistRegistrationNumber: formData.pharmacistRegistrationNumber.trim(),
            licenceFileName: formData.licenceFileName,
            pharmacyVerification: 'verified',
          } : {}),
        };

        localUsers.push(newUser);
        localStorage.setItem('medilink_local_users', JSON.stringify(localUsers));

        userData = { 
          id: newUser.id, 
          name: newUser.name, 
          email: newUser.email, 
          role: newUser.role, 
          phone: newUser.phone 
        };
        tokenStr = `token_local_${Date.now()}`;
      }

      setSuccess(`Account created successfully! Welcome to MediLinkRx, ${userData.name}.`);
      toast.success('Registration successful!');

      // Authenticate newly registered user and navigate to appropriate dashboard
      login(tokenStr, userData);

      setTimeout(() => {
        if (userData.role === 'manager' || userData.role === 'pharmacy' || userData.role === 'admin') {
          navigate('/manager/dashboard', { replace: true });
        } else {
          navigate('/user/dashboard', { replace: true });
        }
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during account registration.');
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-soft border border-slate-100">
        
        {/* Header Branding */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-primary p-3 rounded-2xl text-white shadow-soft">
              <Pill className="h-7 w-7" />
            </div>
            <span className="font-extrabold text-3xl tracking-tight text-slate-900">
              MediLink<span className="text-primary">Rx</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">Create your account</h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">
              Sign in to MediLinkRx
            </Link>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 text-rose-600 p-3.5 rounded-2xl text-sm flex items-center gap-3 border border-rose-100 font-medium">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-2xl text-sm text-center border border-emerald-100 font-bold">
            {success}
          </div>
        )}

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          
          {/* Account Role Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'user' })}
                className={`py-2.5 px-3 text-xs font-bold rounded-xl flex justify-center items-center gap-2 transition-all ${
                  formData.role === 'user' 
                    ? 'bg-white text-primary shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserCheck className="h-4 w-4" /> Patient Account
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'manager' })}
                className={`py-2.5 px-3 text-xs font-bold rounded-xl flex justify-center items-center gap-2 transition-all ${
                  formData.role === 'manager' 
                    ? 'bg-white text-secondary shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="h-4 w-4" /> Manager Account
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserIcon className="h-5 w-5" />
              </div>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-10 pr-4 block w-full rounded-xl border border-slate-200 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                placeholder="Sarah Jenkins"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="h-5 w-5" />
              </div>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-10 pr-4 block w-full rounded-xl border border-slate-200 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                placeholder="+1 (555) 019-2834"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 pr-4 block w-full rounded-xl border border-slate-200 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                placeholder="name@example.com"
              />
            </div>
          </div>

          {formData.role === 'manager' && (
            <section className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-secondary">Pharmacy Verification</h3>
                <p className="mt-1 text-xs text-slate-500">Verify your retail drug licence to continue.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Pharmacy Name</label>
                <input type="text" required value={formData.pharmacyName} onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })} className="block w-full rounded-xl border border-slate-200 py-3 px-3 text-sm" placeholder="ABC Medical Store" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Drug Licence Number</label>
                <input type="text" required value={formData.licenceNumber} onChange={(e) => { setFormData({ ...formData, licenceNumber: e.target.value }); setPharmacyVerification(null); }} className="block w-full rounded-xl border border-slate-200 py-3 px-3 text-sm" placeholder="20/MP/123456" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Licence Type</label>
                <select value={formData.licenceType} onChange={(e) => setFormData({ ...formData, licenceType: e.target.value })} className="block w-full rounded-xl border border-slate-200 bg-white py-3 px-3 text-sm">
                  <option>Form 20</option>
                  <option>Form 21</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Registered Pharmacist Name</label>
                <input type="text" required value={formData.pharmacistName} onChange={(e) => setFormData({ ...formData, pharmacistName: e.target.value })} className="block w-full rounded-xl border border-slate-200 py-3 px-3 text-sm" placeholder="Ravi Kumar" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Pharmacist Registration Number</label>
                <input type="text" required value={formData.pharmacistRegistrationNumber} onChange={(e) => setFormData({ ...formData, pharmacistRegistrationNumber: e.target.value })} className="block w-full rounded-xl border border-slate-200 py-3 px-3 text-sm" placeholder="MP/PH/12345" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Upload Drug Licence</label>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-600 hover:border-secondary">
                  <Upload className="h-4 w-4" />
                  <span>{formData.licenceFileName || 'Choose File'}</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only" onChange={(e) => setFormData({ ...formData, licenceFileName: e.target.files?.[0]?.name || '' })} />
                </label>
              </div>

              <button type="button" onClick={verifyPharmacy} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-70">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Verify Pharmacy
              </button>

              {pharmacyVerification && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  <div className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-5 w-5" /> Pharmacy Verified</div>
                  <p className="mt-2">{pharmacyVerification.pharmacyName}<br />{pharmacyVerification.state}</p>
                  <p className="mt-2">Drug Licence: {pharmacyVerification.licenceNumber}</p>
                  <p className="mt-2 font-semibold">You can now create your Manager Account.</p>
                </div>
              )}
            </section>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 pr-10 block w-full rounded-xl border border-slate-200 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 shadow-sm mt-2"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>Create MediLinkRx Account</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center">
          <p className="text-xs text-slate-500">
            By signing up, you agree to MediLinkRx's Terms of Service & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
