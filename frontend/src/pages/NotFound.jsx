import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-brand-300">
        <Compass className="h-6 w-6" />
      </div>
      <h1 className="font-display text-3xl font-bold text-ink-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-slate-500">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/" className="btn-primary mt-6">Back to the form</Link>
    </div>
  );
}
