import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Pill, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { isAuthenticated, user, loginDemo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const destPath = (user.role === 'manager' || user.role === 'admin' || user.role === 'pharmacy')
        ? '/manager/dashboard'
        : '/user/dashboard';
      navigate(destPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setError('Please fill in both email and password.');
      setLoading(false);
      return;
    }

    // Direct demo login when Supabase URL is unconfigured / placeholder to avoid 'Failed to fetch'
    if (!isSupabaseConfigured) {
      const demoUser = loginDemo(trimmedEmail);
      setSuccess(`Signed in as ${demoUser.name}`);
      toast.success(`Welcome back, ${demoUser.name}!`);
      const destPath = (demoUser.role === 'manager' || demoUser.role === 'admin' || demoUser.role === 'pharmacy')
        ? '/manager/dashboard'
        : '/user/dashboard';
      navigate(destPath, { replace: true });
      setLoading(false);
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (signInError) throw signInError;
      setSuccess('Logged in successfully.');
      toast.success('Welcome back!');
    } catch (err: any) {
      const errMsg = err.message || '';
      
      // Fallback to demo mode if fetch fails
      if (errMsg.includes('Failed to fetch') || errMsg.includes('fetch') || errMsg.includes('NetworkError')) {
        const demoUser = loginDemo(trimmedEmail);
        setSuccess(`Signed in as ${demoUser.name}`);
        toast.success(`Welcome back, ${demoUser.name}!`);
        const destPath = (demoUser.role === 'manager' || demoUser.role === 'admin' || demoUser.role === 'pharmacy')
          ? '/manager/dashboard'
          : '/user/dashboard';
        navigate(destPath, { replace: true });
        return;
      }

      setError(errMsg || 'Unable to sign in. Please check your credentials.');
      toast.error('Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address to receive password reset instructions.');
      return;
    }
    setLoading(true);
    setError('');

    if (!isSupabaseConfigured) {
      toast.success(`Demo password reset request acknowledged for ${email}.`);
      setSuccess(`Instructions have been sent to ${email}.`);
      setLoading(false);
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (resetError) throw resetError;
      toast.success(`Password reset link sent to ${email}`);
      setSuccess(`Instructions have been sent to ${email}.`);
    } catch (err: any) {
      toast.success(`Demo password reset request acknowledged for ${email}.`);
      setSuccess(`Instructions have been sent to ${email}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-[672px] rounded-[30px] border border-slate-100 bg-white p-8 shadow-soft sm:p-10 md:p-[60px]">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-soft sm:h-16 sm:w-16">
              <Pill className="h-8 w-8 rotate-[-10deg]" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              MediLink<span className="text-primary">Rx</span>
            </span>
          </Link>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Sign in to your account
          </h2>
          <p className="mt-2 text-base font-medium text-slate-600 sm:text-lg">
            Or{' '}
            <Link to="/register" className="font-semibold text-primary transition-colors hover:text-primary-dark">
              create a new MediLinkRx account
            </Link>
          </p>
        </div>

        {error && (
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-base font-medium text-rose-600">
            <AlertCircle className="h-6 w-6 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center text-base font-bold text-emerald-700">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-lg font-semibold text-slate-700">Email address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Mail className="h-6 w-6" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-lg font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-semibold text-primary transition-colors hover:text-primary-dark sm:text-base"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Lock className="h-6 w-6" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-12 text-base text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-4 py-4 text-lg font-bold text-white shadow-sm transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 sm:text-xl"
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <span>Sign in to MediLinkRx</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
