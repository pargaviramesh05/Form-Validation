import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Inbox, CalendarDays, CalendarRange, CalendarClock, Search, Download,
  FileSpreadsheet, FileText, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, ArrowUpDown,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import SubmissionModal, { StatusBadge } from '../components/SubmissionModal';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../services/api';

const STATUS_COLORS = { new: '#F4A83C', reviewed: '#0EA5E9', resolved: '#1BAA7C' };
const PAGE_SIZE = 10;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [loadingRows, setLoadingRows] = useState(true);

  const [modal, setModal] = useState(null); // { submission, mode }
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.stats);
    } catch (err) {
      toast.error(err.message || 'Could not load statistics.');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchRows = useCallback(async () => {
    setLoadingRows(true);
    try {
      const { data } = await api.get('/admin/submissions', {
        params: { page, limit: PAGE_SIZE, search, status, sortBy, sortOrder },
      });
      setRows(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error(err.message || 'Could not load submissions.');
    } finally {
      setLoadingRows(false);
    }
  }, [page, search, status, sortBy, sortOrder]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchRows(); }, [fetchRows]);

  // Debounce search input
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(col);
      setSortOrder('DESC');
    }
  };

  const handleExport = async (type) => {
    try {
      const res = await api.get(`/admin/export/${type}`, {
        params: { search, status },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `submissions.${type === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Exported as ${type === 'excel' ? 'Excel' : 'PDF'}.`);
    } catch (err) {
      toast.error(err.message || 'Export failed.');
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/submissions/${pendingDelete.id}`);
      toast.success('Submission deleted.');
      setPendingDelete(null);
      fetchRows();
      fetchStats();
    } catch (err) {
      toast.error(err.message || 'Could not delete submission.');
    } finally {
      setDeleting(false);
    }
  };

  const pieData = stats?.byStatus?.map((s) => ({ name: s.status, value: s.count })) || [];
  const areaData = stats?.dailyLast14?.map((d) => ({
    date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    count: d.count,
  })) || [];

  return (
    <div className="min-h-screen bg-paper pb-16">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total submissions" value={loadingStats ? '—' : stats.total} icon={Inbox} accent="ink" delay={0} />
          <StatCard label="Today" value={loadingStats ? '—' : stats.today} icon={CalendarDays} accent="brand" delay={0.05} />
          <StatCard label="Last 7 days" value={loadingStats ? '—' : stats.last7Days} icon={CalendarRange} accent="amber" delay={0.1} />
          <StatCard label="This month" value={loadingStats ? '—' : stats.thisMonth} icon={CalendarClock} accent="rose" delay={0.15} />
        </div>

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="card p-5 lg:col-span-2">
            <h3 className="mb-4 font-display text-sm font-semibold text-ink-900">Submissions — last 14 days</h3>
            {loadingStats ? (
              <div className="flex h-56 items-center justify-center"><Loader size="sm" label="" /></div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1BAA7C" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#1BAA7C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1F6" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#1BAA7C" strokeWidth={2} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card p-5">
            <h3 className="mb-4 font-display text-sm font-semibold text-ink-900">By status</h3>
            {loadingStats ? (
              <div className="flex h-56 items-center justify-center"><Loader size="sm" label="" /></div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94A3B8'} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name, email, subject…"
              className="field-input pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="field-input w-auto"
            >
              <option value="">All statuses</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
            </select>

            <button onClick={() => handleExport('excel')} className="btn-secondary">
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </button>
            <button onClick={() => handleExport('pdf')} className="btn-secondary">
              <FileText className="h-4 w-4" />
              PDF
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <SortableTh label="Name" col="full_name" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                  <SortableTh label="Email" col="email" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                  <th className="px-4 py-3">Subject</th>
                  <SortableTh label="Status" col="status" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                  <SortableTh label="Submitted" col="created_at" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingRows ? (
                  <tr><td colSpan={6} className="px-4 py-10"><Loader label="Loading submissions…" /></td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No submissions found.</td></tr>
                ) : (
                  rows.map((row) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-3 font-medium text-ink-900">{row.full_name}</td>
                      <td className="px-4 py-3 text-slate-500">{row.email}</td>
                      <td className="px-4 py-3 text-slate-500">{row.subject || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                      <td className="px-4 py-3 text-slate-500">{new Date(row.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <IconButton title="View" onClick={() => setModal({ submission: row, mode: 'view' })}><Eye className="h-4 w-4" /></IconButton>
                          <IconButton title="Edit" onClick={() => setModal({ submission: row, mode: 'edit' })}><Pencil className="h-4 w-4" /></IconButton>
                          <IconButton title="Delete" danger onClick={() => setPendingDelete(row)}><Trash2 className="h-4 w-4" /></IconButton>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
            <span>{total} total &middot; page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <IconButton title="Previous page" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                <ChevronLeft className="h-4 w-4" />
              </IconButton>
              <IconButton title="Next page" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                <ChevronRight className="h-4 w-4" />
              </IconButton>
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <SubmissionModal
          submission={modal.submission}
          mode={modal.mode}
          onClose={() => setModal(null)}
          onSaved={() => { fetchRows(); fetchStats(); }}
        />
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this submission?"
        description={pendingDelete ? `This will permanently remove the submission from ${pendingDelete.full_name}. This cannot be undone.` : ''}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
        loading={deleting}
      />
    </div>
  );
}

function SortableTh({ label, col, sortBy, sortOrder, onSort }) {
  const active = sortBy === col;
  return (
    <th className="px-4 py-3">
      <button onClick={() => onSort(col)} className={`flex items-center gap-1 ${active ? 'text-ink-900' : ''}`}>
        {label}
        <ArrowUpDown className={`h-3.5 w-3.5 ${active ? 'text-brand-600' : 'text-slate-300'}`} />
        {active && <span className="text-[10px] text-slate-400">{sortOrder}</span>}
      </button>
    </th>
  );
}

function IconButton({ children, onClick, title, danger, disabled }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 transition-colors
        disabled:opacity-40 disabled:pointer-events-none
        ${danger ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-600 hover:bg-slate-100'}`}
    >
      {children}
    </button>
  );
}
