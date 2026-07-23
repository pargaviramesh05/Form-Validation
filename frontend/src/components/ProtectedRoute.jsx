import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

/**
 * Wraps any route that only the logged-in admin should reach.
 * Redirects to /admin/login if there's no valid session.
 */
export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader label="Checking your session…" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
