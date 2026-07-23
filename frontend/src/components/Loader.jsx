import { motion } from 'framer-motion';

export default function Loader({ label = 'Loading…', size = 'md' }) {
  const dim = size === 'sm' ? 'h-4 w-4 border-2' : 'h-8 w-8 border-[3px]';

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.span
        className={`${dim} rounded-full border-brand-500 border-t-transparent`}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
      />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  );
}
