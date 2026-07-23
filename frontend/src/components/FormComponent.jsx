import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Send, CheckCircle2, RotateCcw } from 'lucide-react';
import api from '../services/api';

const initialForm = { fullName: '', email: '', phone: '', subject: '', message: '' };

function validate(form) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = 'Please enter your name.';
  if (!form.email.trim()) {
    errors.email = 'Please enter your email.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (form.phone && !/^[0-9+\-\s()]{7,20}$/.test(form.phone)) {
    errors.phone = 'Enter a valid phone number.';
  }
  if (!form.message.trim()) {
    errors.message = 'Please enter a message.';
  } else if (form.message.trim().length < 10) {
    errors.message = 'Message should be at least 10 characters.';
  }
  return errors;
}

function TicketConfirmation({ referenceId, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative mx-auto max-w-md"
    >
      <div className="card overflow-hidden">
        <div className="bg-ink-900 px-6 py-6 text-white">
          <div className="flex items-center gap-2 text-brand-300">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-wide">SUBMISSION CONFIRMED</span>
          </div>
          <p className="mt-3 text-lg font-display font-semibold">Your request is in the queue.</p>
          <p className="mt-1 text-sm text-slate-300">Our team reviews new requests daily.</p>
        </div>

        {/* perforated divider */}
        <div className="relative h-0 border-t-2 border-dashed border-slate-200">
          <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-paper" />
          <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-paper" />
        </div>

        <div className="px-6 py-6">
          <p className="text-xs uppercase tracking-wider text-slate-400">Reference number</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-ink-900">#{String(referenceId).padStart(6, '0')}</p>
          <p className="mt-3 text-sm text-slate-500">
            Keep this number for your records. You'll need it if you follow up about your request.
          </p>

          <button onClick={onReset} className="btn-secondary mt-6 w-full">
            <RotateCcw className="h-4 w-4" />
            Submit another request
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function FormComponent() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/submissions', form);
      setReferenceId(data.submissionId);
      toast.success('Submitted successfully!');
    } catch (err) {
      toast.error(err.message || 'Could not submit the form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setReferenceId(null);
  };

  return (
    <AnimatePresence mode="wait">
      {referenceId ? (
        <TicketConfirmation key="confirmation" referenceId={referenceId} onReset={handleReset} />
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          noValidate
          className="card mx-auto max-w-lg p-6 sm:p-8"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="fullName" className="field-label">Full name</label>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="field-input"
                placeholder="Jordan Lee"
                autoComplete="name"
              />
              {errors.fullName && <p className="field-error">{errors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="email" className="field-label">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="field-input"
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="field-label">Phone <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="field-input"
                placeholder="+91 98765 43210"
                autoComplete="tel"
              />
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="subject" className="field-label">Subject <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                id="subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="field-input"
                placeholder="What's this about?"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="message" className="field-label">Message</label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                className="field-input resize-none"
                placeholder="Tell us what you need…"
              />
              {errors.message && <p className="field-error">{errors.message}</p>}
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full">
            {submitting ? (
              <>
                <motion.span
                  className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                />
                Submitting…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit request
              </>
            )}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
