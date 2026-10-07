import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pill, Mail, Lock, User as UserIcon, ArrowRight, Loader2, Phone, Eye, EyeOff, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { type UserRole } from '../context/AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { isValidEmailAddress, isValidPhoneNumber } from '../utils/validation';
import { registerNewAccount } from '../utils/accountStore';
import toast from 'react-hot-toast';

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
    pharmacistRegistrationNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

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

    if (!isValidEmailAddress(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      setLoading(false);
      return;
    }

    if (!formData.phone || !isValidPhoneNumber(formData.phone)) {
      setError('Please enter a valid 10-digit mobile phone number (e.g. 9876543210).');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (formData.role === 'manager') {
      if (trimmedEmail !== 'nlm.qwerty1289@gmail.com') {
        setError('Manager registration is restricted to authorized manager accounts.');
        setLoading(false);
        return;
      }
      if (formData.password !== 'qwerty') {
        setError('Manager password must match the authorized manager password (qwerty).');
        setLoading(false);
        return;
      }
      if (!formData.pharmacyName || !formData.licenceNumber || !formData.pharmacistName || !formData.pharmacistRegistrationNumber) {
        setError('Please complete all pharmacy verification details before creating a manager account.');
        setLoading(false);
        return;
      }
    }

    if (!isSupabaseConfigured) {
      const regResult = registerNewAccount({
        name: formData.name.trim(),
        email: trimmedEmail,
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role,
        pharmacyName: formData.pharmacyName,
        licenceNumber: formData.licenceNumber,
        pharmacistName: formData.pharmacistName,
        pharmacistRegistrationNumber: formData.pharmacistRegistrationNumber,
      });

      if (!regResult.success) {
        setError(regResult.message || 'Registration failed.');
        setLoading(false);
        return;
      }

      setSuccess('Account created successfully! Please sign in with your credentials.');
      toast.success('Account created successfully! Please sign in with your email and password.');
      navigate('/login', { replace: true });
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: formData.password,
        options: {
          data: {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            requested_role: formData.role,
            pharmacy_name: formData.pharmacyName.trim(),
            drug_licence_number: formData.licenceNumber.trim(),
            licence_type: formData.licenceType,
            pharmacist_name: formData.pharmacistName.trim(),
            pharmacist_registration_number: formData.pharmacistRegistrationNumber.trim(),
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.session) {
        if (formData.role === 'manager') {
          setSuccess('Account created. Your manager access is pending administrator review of your pharmacy credentials.');
          toast.success('Manager application submitted for review');
          navigate('/user/dashboard', { replace: true });
          return;
        }
        setSuccess(`Account created successfully! Welcome to MediLinkRx, ${formData.name.trim()}.`);
        toast.success('Registration successful!');
        navigate('/user/dashboard', { replace: true });
      } else {
        setSuccess(formData.role === 'manager'
          ? 'Account created. Check your email to confirm it. Manager access remains disabled until an administrator reviews your pharmacy credentials.'
          : 'Account created. Check your email to confirm your address, then sign in.');
        toast.success(formData.role === 'manager' ? 'Manager application submitted for review' : 'Check your email to confirm your account.');
      }
    } catch (err: any) {
      const message = typeof err?.message === 'string' ? err.message : '';
      const isNetworkError = /failed to fetch|networkerror|fetch failed/i.test(message);
      setError(
        isNetworkError
          ? 'Could not reach the registration service. Check your internet connection and confirm the Supabase project URL and anon key in your local environment configuration.'
          : message || 'An unexpected error occurred during account registration.'
      );
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

        {formData.role === 'manager' && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3.5 text-sm font-medium text-blue-800">
            Manager access is granted only after an administrator reviews your pharmacy and pharmacist credentials.
          </div>
        )}

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
                onClick={() => {
                  setError('');
                  setFormData({ ...formData, role: 'user' });
                }}
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
                onClick={() => {
                  setError('');
                  setFormData({ ...formData, role: 'manager' });
                }}
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
                <p className="mt-1 text-xs text-slate-500">Submit your credentials for administrator review. They will not grant manager access until approved.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Pharmacy Name</label>
                <input type="text" required value={formData.pharmacyName} onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })} className="block w-full rounded-xl border border-slate-200 py-3 px-3 text-sm" placeholder="ABC Medical Store" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Drug Licence Number</label>
                <input type="text" required value={formData.licenceNumber} onChange={(e) => setFormData({ ...formData, licenceNumber: e.target.value })} className="block w-full rounded-xl border border-slate-200 py-3 px-3 text-sm" placeholder="20/MP/123456" />
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

              <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                Your licence details are reviewed by an administrator. Do not upload sensitive documents here; this form does not transfer files.
              </p>
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
