import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const STATUS_OPTIONS = ['new', 'reviewed', 'resolved'];

export default function SubmissionModal({ submission, mode = 'view', onClose, onSaved }) {
  const [form, setForm] = useState(submission);
  const [saving, setSaving] = useState(false);
  const isEdit = mode === 'edit';

  useEffect(() => setForm(submission), [submission]);

  if (!submission) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/submissions/${submission.id}`, {
        fullName: form.full_name,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
        status: form.status,
      });
      toast.success('Submission updated.');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-xl2 bg-white shadow-panel"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="font-display text-lg font-semibold text-ink-900">
              {isEdit ? 'Edit submission' : 'Submission details'} <span className="text-slate-400 font-mono text-sm">#{submission.id}</span>
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
            <Field label="Full name" name="full_name" value={form.full_name} onChange={handleChange} editable={isEdit} />
            <Field label="Email" name="email" value={form.email} onChange={handleChange} editable={isEdit} />
            <Field label="Phone" name="phone" value={form.phone || '—'} onChange={handleChange} editable={isEdit} />
            <Field label="Subject" name="subject" value={form.subject || '—'} onChange={handleChange} editable={isEdit} />
            <Field label="Message" name="message" value={form.message} onChange={handleChange} editable={isEdit} multiline />

            <div>
              <p className="field-label">Status</p>
              {isEdit ? (
                <select name="status" value={form.status} onChange={handleChange} className="field-input">
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <StatusBadge status={form.status} />
              )}
            </div>

            <Field label="Submitted at" value={new Date(submission.created_at).toLocaleString()} editable={false} />
          </div>

          {isEdit && (
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={onClose} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, name, value, onChange, editable, multiline }) {
  return (
    <div>
      <p className="field-label">{label}</p>
      {editable ? (
        multiline ? (
          <textarea name={name} value={value} onChange={onChange} rows={4} className="field-input resize-none" />
        ) : (
          <input name={name} value={value} onChange={onChange} className="field-input" />
        )
      ) : (
        <p className="text-sm text-ink-800 whitespace-pre-wrap">{value}</p>
      )}
    </div>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    new: 'bg-amber-400/15 text-amber-600',
    reviewed: 'bg-sky-100 text-sky-700',
    resolved: 'bg-brand-50 text-brand-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}
