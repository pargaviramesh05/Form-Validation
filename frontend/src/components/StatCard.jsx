import { motion } from 'framer-motion';

export default function StatCard({ label, value, icon: Icon, accent = 'brand', delay = 0 }) {
  const accents = {
    brand: 'bg-brand-50 text-brand-600',
    amber: 'bg-amber-400/15 text-amber-500',
    ink: 'bg-ink-900/5 text-ink-800',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="card p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${accents[accent]}`}>
            <Icon className="h-4.5 w-4.5" />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-display font-bold text-ink-900">{value}</p>
    </motion.div>
  );
}
