import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Delete', onConfirm, onCancel, loading }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-xl2 bg-white p-6 shadow-panel"
        >
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-center font-display text-lg font-semibold text-ink-900">{title}</h3>
          <p className="mt-1.5 text-center text-sm text-slate-500">{description}</p>

          <div className="mt-6 flex gap-3">
            <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
            >
              {loading ? 'Deleting…' : confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
