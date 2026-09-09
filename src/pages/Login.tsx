import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_USERS, type UserRole, type User } from '../context/AuthContext';
import { Pill, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();


  const handleSuccessLogin = (userObj: User, tokenStr: string) => {
    login(tokenStr, userObj);
    setSuccess(`Logged in successfully as ${userObj.name}!`);
    toast.success(`Welcome back, ${userObj.name}!`);

    setTimeout(() => {
      // Determine redirection path based on role
      if (userObj.role === 'manager' || userObj.role === 'pharmacy' || userObj.role === 'admin') {
        navigate('/manager/dashboard', { replace: true });
      } else {
        navigate('/user/dashboard', { replace: true });
      }
    }, 600);
  };

  const handleQuickDemoLogin = (roleKey: string) => {
    setLoading(true);
    setError('');
    const demo = DEMO_USERS[roleKey];
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.password);
      const mockToken = `token_demo_${demo.role}_${Date.now()}`;
      handleSuccessLogin({
        id: demo.id,
        name: demo.name,
        email: demo.email,
        role: demo.role,
        phone: demo.phone
      }, mockToken);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      setLoading(false);
      return;
    }

    let authenticatedUser: User | null = null;
    let tokenStr = '';

    // 1. Attempt Remote API authentication if configured
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl && apiUrl !== 'undefined') {
      try {
        const res = await fetch(`${apiUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user && data.token) {
            authenticatedUser = data.user;
            tokenStr = data.token;
          }
        }
      } catch (err) {
        console.warn('Backend API unreachable, checking local credentials database.');
      }
    }

    // 2. Local Authentication against DEMO_USERS or registered local users
    if (!authenticatedUser) {
      // Check DEMO_USERS match
      const demoMatch = Object.values(DEMO_USERS).find(
        (d) => d.email.toLowerCase() === email.toLowerCase() && d.password === password
      );

      if (demoMatch) {
        authenticatedUser = {
          id: demoMatch.id,
          name: demoMatch.name,
          email: demoMatch.email,
          role: demoMatch.role as UserRole,
          phone: demoMatch.phone
        };
        tokenStr = `token_demo_${demoMatch.role}_${Date.now()}`;
      } else {
        // Check registered local users in localStorage
        const localUsersStr = localStorage.getItem('medilink_local_users') || '[]';
        let localUsers: any[] = [];
        try { localUsers = JSON.parse(localUsersStr); } catch { localUsers = []; }

        const matchedLocal = localUsers.find(
          (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (matchedLocal) {
          authenticatedUser = {
            id: matchedLocal.id,
            name: matchedLocal.name,
            email: matchedLocal.email,
            role: matchedLocal.role as UserRole,
            phone: matchedLocal.phone || '+1 (555) 019-2834'
          };
          tokenStr = `token_local_${Date.now()}`;
        }
      }
    }

    if (authenticatedUser && tokenStr) {
      handleSuccessLogin(authenticatedUser, tokenStr);
    } else {
      setError('No account found with these credentials. Please check your email & password or click Sign Up to create an account.');
      toast.error('Invalid credentials');
    }

    setLoading(false);
  };

  const handleForgotPassword = () => {
    if (!email) {
      setError('Please enter your email address to receive password reset instructions.');
      return;
    }
    toast.success(`Password reset link sent to ${email}`);
    setSuccess(`Instructions have been sent to ${email}.`);
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
              Medi<span className="text-primary">Link</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">Sign in to your account</h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Or{' '}
            <Link to="/register" className="font-semibold text-primary hover:text-primary-dark transition-colors">
              create a new Medilink account
            </Link>
          </p>
        </div>

        {/* Quick Demo Login Cards */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
            ⚡ Quick Demo Logins
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('user')}
              className="py-2.5 px-3 text-xs font-bold bg-white text-slate-700 hover:text-primary hover:bg-emerald-50 border border-slate-200 hover:border-primary/40 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <UserCheck className="h-4 w-4 text-primary" />
              <span>User Role</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('manager')}
              className="py-2.5 px-3 text-xs font-bold bg-white text-slate-700 hover:text-secondary hover:bg-blue-50 border border-slate-200 hover:border-secondary/40 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <ShieldCheck className="h-4 w-4 text-secondary" />
              <span>Manager Role</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 text-rose-600 p-3.5 rounded-2xl text-sm flex items-center gap-3 border border-rose-100 font-medium animate-shake">
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
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 pr-4 block w-full rounded-xl border border-slate-200 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <button 
                  type="button" 
                  onClick={handleForgotPassword} 
                  className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 block w-full rounded-xl border border-slate-200 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                  placeholder="••••••••"
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 shadow-sm mt-2"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>Sign in to MediLink</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center">
          <p className="text-xs text-slate-500">
            Demo User: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">user@medilink.com</code> / <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">user123</code>
            <br />
            Demo Manager: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">manager@medilink.com</code> / <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">manager123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
