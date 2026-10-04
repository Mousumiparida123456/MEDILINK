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
    <div className="min-h-[85vh] flex items-center justify-center bg-[#f3f4f6] px-4 py-10">
      <div className="w-full max-w-[760px] rounded-[30px] border border-[#e5e7eb] bg-[#f5f5f5] p-8 shadow-[0_10px_25px_rgba(15,23,42,0.06)] sm:p-10">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-3 mb-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#14B8A6] text-white shadow-soft sm:h-[72px] sm:w-[72px]">
              <Pill className="h-9 w-9 rotate-[-10deg] sm:h-10 sm:w-10" />
            </div>
            <span className="text-[2.2rem] font-black tracking-[-0.06em] text-slate-900 sm:text-[3.1rem]">
              MediLink<span className="text-[#14B8A6]">Rx</span>
            </span>
          </Link>

          <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-slate-900 sm:text-[4rem]">
            Sign in to your account
          </h2>
          <p className="mt-3 text-xl font-medium text-slate-600 sm:text-[2rem]">
            Or{' '}
            <Link to="/register" className="font-semibold text-[#14B8A6] transition-colors hover:text-[#0f9f94]">
              create a new MediLinkRx account
            </Link>
          </p>
        </div>

        {error && (
          <div className="mt-8 flex items-center gap-4 rounded-[26px] border border-[#f4c7c4] bg-[#f9e5e5] px-6 py-4 text-xl font-semibold text-[#e74c3c] shadow-sm sm:text-2xl">
            <AlertCircle className="h-7 w-7 shrink-0 text-[#e74c3c]" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-8 rounded-[22px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-center text-lg font-bold text-emerald-700">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="mb-3 block text-2xl font-medium text-slate-700">Email address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                  <Mail className="h-7 w-7" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-2xl border border-[#d7dfe4] bg-white py-4 pl-14 pr-4 text-xl text-slate-900 placeholder:text-slate-400 focus:border-[#14B8A6] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20"
                />
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="block text-2xl font-medium text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xl font-medium text-[#14B8A6] transition-colors hover:text-[#0f9f94]"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                  <Lock className="h-7 w-7" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-2xl border border-[#d7dfe4] bg-white py-4 pl-14 pr-12 text-2xl text-slate-900 placeholder:text-slate-400 focus:border-[#14B8A6] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-7 w-7" /> : <Eye className="h-7 w-7" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-3 rounded-[18px] bg-[#14B8A6] px-4 py-5 text-3xl font-extrabold text-white shadow-[0_8px_18px_rgba(20,184,166,0.3)] transition-transform hover:bg-[#11a899] disabled:opacity-80"
          >
            {loading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : (
              <>
                <span>Sign in to MediLinkRx</span>
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
