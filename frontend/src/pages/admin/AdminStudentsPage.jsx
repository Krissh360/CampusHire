import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Award,
  ShieldAlert,
  Power
} from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [placedFilter, setPlacedFilter] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchStudents = async () => {
    try {
      const res = await api.get('/admin/students');
      if (res.data.success) {
        setStudents(res.data.students);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      const res = await api.put(`/admin/users/${userId}/status`, { is_active: newStatus });
      if (res.data.success) {
        setActionMsg(res.data.message);
        await fetchStudents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user account state.');
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q) ||
      s.roll_number.toLowerCase().includes(q) ||
      (s.email && s.email.toLowerCase().includes(q));

    const matchesBranch = !branchFilter || s.branch.toUpperCase() === branchFilter.toUpperCase();
    const matchesPlaced =
      placedFilter === '' ||
      (placedFilter === 'placed' && s.is_placed) ||
      (placedFilter === 'unplaced' && !s.is_placed);

    return matchesSearch && matchesBranch && matchesPlaced;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Student Academic Records</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Directory of campus candidates, academic metrics, and portal access management.
          </p>
        </div>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-lg bg-accent border border-border text-xs font-semibold text-primary">
          {actionMsg}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search student by name, USN roll number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-card"
        >
          <option value="">All Branches</option>
          <option value="CSE">CSE</option>
          <option value="IT">IT</option>
          <option value="ECE">ECE</option>
          <option value="MECH">MECH</option>
        </select>

        <select
          value={placedFilter}
          onChange={(e) => setPlacedFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-card"
        >
          <option value="">All Placement Statuses</option>
          <option value="placed">Placed Candidates</option>
          <option value="unplaced">Seeking Placement</option>
        </select>

        <span className="text-muted-foreground font-medium ml-auto">
          {filteredStudents.length} Students Listed
        </span>
      </div>

      {/* Students Directory Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-background text-muted-foreground font-semibold border-b border-border">
                <tr>
                  <th className="p-3.5 pl-6">Student USN & Name</th>
                  <th className="p-3.5">Branch / Sem</th>
                  <th className="p-3.5">CGPA</th>
                  <th className="p-3.5">Backlogs</th>
                  <th className="p-3.5">Placement Status</th>
                  <th className="p-3.5">Highest Offer</th>
                  <th className="p-3.5 text-center">Account State</th>
                  <th className="p-3.5 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.map((s) => (
                  <tr key={s.student_id} className="hover:bg-background/80 transition-all">
                    <td className="p-3.5 pl-6">
                      <div className="font-bold text-foreground">{s.first_name} {s.last_name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{s.roll_number} • {s.email}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-foreground">{s.branch}</span>
                      <div className="text-[11px] text-muted-foreground">Semester {s.semester}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-extrabold text-primary text-sm">{s.cgpa}</span>
                    </td>
                    <td className="p-3.5">
                      <span className={s.active_backlogs > 0 ? 'text-destructive font-bold' : 'text-muted-foreground'}>
                        {s.active_backlogs} Active ({s.total_backlogs || 0} Total)
                      </span>
                    </td>
                    <td className="p-3.5">
                      {s.is_placed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-accent text-primary border border-border">
                          <CheckCircle2 className="w-3 h-3" />
                          Placed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-muted text-muted-foreground">
                          Seeking
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {s.highest_offer ? (
                        <span className="font-bold text-primary">₹ {s.highest_offer} LPA</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.is_active ? 'bg-accent text-primary' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {s.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right pr-6">
                      <button
                        onClick={() => handleToggleStatus(s.user_id, s.is_active)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 ${
                          s.is_active
                            ? 'bg-destructive/10 text-destructive hover:bg-destructive/10'
                            : 'bg-accent text-primary hover:bg-accent'
                        }`}
                        title={s.is_active ? 'Deactivate student account' : 'Reactivate student account'}
                      >
                        <Power className="w-3 h-3" />
                        <span>{s.is_active ? 'Disable' : 'Enable'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
