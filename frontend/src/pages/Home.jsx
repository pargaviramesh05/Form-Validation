import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';
import FormComponent from '../components/FormComponent';

export default function Home() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 text-center"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-brand-300">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-display font-bold text-ink-900 sm:text-4xl">
            Submit your request
          </h1>
          <p className="mx-auto mt-3 max-w-md text-slate-500">
            Fill in the details below. You'll get a reference number the moment it's submitted.
          </p>
        </motion.div>

        <FormComponent />

        <p className="mt-10 text-center text-xs text-slate-400">
          Your information is submitted securely and reviewed by our team only.
        </p>
      </div>
    </div>
  );
}
