import { LogOut, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out.');
    navigate('/admin/login');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-brand-300">
            <ShieldCheck className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="font-display text-sm font-semibold leading-tight text-ink-900">Admin Dashboard</p>
            <p className="text-xs text-slate-400 leading-tight">FormApp</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-slate-500 sm:inline">
            {admin?.fullName || admin?.username}
          </span>
          <button onClick={handleLogout} className="btn-secondary py-2 text-sm">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
