import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pill, Mail, Lock, User as UserIcon, ArrowRight, Loader2, Store } from 'lucide-react';

export function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Registration failed');

      setSuccess('Registration successful! Please check your console for the mock email verification link.');
      setTimeout(() => navigate('/login'), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-soft border border-slate-100">
        <div className="text-center">
          <div className="mx-auto bg-primary w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4">
            <Pill className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Create account</h2>
          <p className="mt-2 text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-500 p-3 rounded-xl text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 text-primary p-3 rounded-xl text-sm text-center">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          
          <div className="flex gap-4 p-1 bg-slate-100 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'user' })}
              className={`flex-1 py-2 text-sm font-medium rounded-lg flex justify-center items-center gap-2 transition-all ${formData.role === 'user' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <UserIcon className="h-4 w-4" /> Patient
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'pharmacy' })}
              className={`flex-1 py-2 text-sm font-medium rounded-lg flex justify-center items-center gap-2 transition-all ${formData.role === 'pharmacy' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Store className="h-4 w-4" /> Pharmacy
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-10 block w-full rounded-xl border border-slate-200 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 block w-full rounded-xl border border-slate-200 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 block w-full rounded-xl border border-slate-200 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 shadow-sm mt-6"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
            {!loading && <ArrowRight className="absolute right-4 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />}
          </button>
        </form>
      </div>
    </div>
  );
}
