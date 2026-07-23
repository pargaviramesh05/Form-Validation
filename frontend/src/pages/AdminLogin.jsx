import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { admin, loading, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!loading && admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError('Please enter both username and password.');
      return;
    }
    setSubmitting(true);
    try {
      await login(form.username.trim(), form.password);
      toast.success('Welcome back!');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Admin sign in</h1>
          <p className="mt-1 text-sm text-slate-400">Restricted area. Authorized personnel only.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl2 bg-ink-900 p-6 shadow-panel ring-1 ring-white/5">
          <div className="mb-4">
            <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-300">
              Username
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                className="w-full rounded-xl border border-white/10 bg-ink-800 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                placeholder="Enter admin username"
              />
            </div>
          </div>

          <div className="mb-2">
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-ink-800 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2 mt-2 text-sm font-medium text-rose-400"
            >
              {error}
            </motion.p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary mt-4 w-full bg-brand-500 hover:bg-brand-600">
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          This login is for administrators only. General users should use the public form link.
        </p>
      </motion.div>
    </div>
  );
}
