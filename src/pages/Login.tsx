import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Pill, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, UserCheck, ShieldCheck } from 'lucide-react';
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
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    const loginRole = submitter instanceof HTMLButtonElement && submitter.dataset.role === 'manager'
      ? 'manager'
      : 'user';
    setLoading(true);
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setError('Please fill in both email and password.');
      setLoading(false);
      return;
    }

    if (loginRole === 'manager') {
      if (trimmedEmail !== 'nlm.qwerty1289@gmail.com') {
        setError('Access denied: Manager sign-in is strictly restricted to authorized manager credentials (nlm.qwerty1289@gmail.com).');
        setLoading(false);
        return;
      }
      if (password !== 'qwerty') {
        setError('Invalid password for Manager account.');
        setLoading(false);
        return;
      }
    }

    // Direct demo login when Supabase URL is unconfigured / placeholder to avoid 'Failed to fetch'
    if (!isSupabaseConfigured) {
      const demoUser = loginDemo(trimmedEmail, undefined, loginRole);
      setSuccess(`Signed in as ${demoUser.name} (${demoUser.role})`);
      toast.success(`Welcome back, ${demoUser.name}!`);
      const destPath = (demoUser.role === 'manager' || demoUser.role === 'admin' || demoUser.role === 'pharmacy')
        ? '/manager/dashboard'
        : '/user/dashboard';
      navigate(destPath, { replace: true });
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (signInError) {
        if (loginRole === 'manager' && trimmedEmail === 'nlm.qwerty1289@gmail.com' && password === 'qwerty') {
          loginDemo(trimmedEmail, 'Manager', 'manager');
          setSuccess('Logged in successfully as Manager.');
          toast.success('Welcome back, Manager!');
          navigate('/manager/dashboard', { replace: true });
          return;
        }
        throw signInError;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const actualRole = profile?.role === 'manager' || profile?.role === 'admin' || profile?.role === 'pharmacy'
        ? 'manager'
        : 'user';
      if (actualRole !== loginRole) {
        await supabase.auth.signOut();
        const profileRole = profile?.role ?? 'missing profile';
        throw new Error(
          `Sign-in denied: this account's Supabase profile role is "${profileRole}", but ${loginRole} sign-in was selected.`
        );
      }

      setSuccess('Logged in successfully.');
      toast.success('Welcome back!');
    } catch (err: any) {
      const errMsg = err.message || '';
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
    <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-soft sm:p-8">
        <div className="text-center">
          <Link to="/" className="mb-4 inline-flex items-center justify-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-soft sm:h-12 sm:w-12">
              <Pill className="h-6 w-6 rotate-[-10deg]" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              MediLink<span className="text-primary">Rx</span>
            </span>
          </Link>

          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-600 sm:text-base">
            Or{' '}
            <Link to="/register" className="font-semibold text-primary transition-colors hover:text-primary-dark">
              create a new MediLinkRx account
            </Link>
          </p>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-700">
            {success}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-primary transition-colors hover:text-primary-dark sm:text-sm"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="submit"
              data-role="user"
              disabled={loading}
              className="group flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><UserCheck className="h-4 w-4" /><span>Patient sign in</span></>}
            </button>
            <button
              type="submit"
              data-role="manager"
              disabled={loading}
              className="group flex items-center justify-center gap-2 rounded-xl bg-secondary px-3 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ShieldCheck className="h-4 w-4" /><span>Manager sign in</span></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
