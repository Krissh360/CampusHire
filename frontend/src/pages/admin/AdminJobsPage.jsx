import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter
} from 'lucide-react';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      if (res.data.success) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleUpdateStatus = async (jobId, status) => {
    try {
      const res = await api.put(`/admin/jobs/${jobId}/status`, { status });
      if (res.data.success) {
        setActionMsg(res.data.message);
        await fetchJobs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update job drive status.');
    }
  };

  const filteredJobs = jobs.filter((j) => {
    return !statusFilter || j.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Recruitment Drives Moderation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Approve company drives before student visibility and manage campus recruitment timelines.
          </p>
        </div>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-lg bg-accent border border-border text-xs font-semibold text-primary">
          {actionMsg}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-ring bg-card"
          >
            <option value="">All Drive Statuses</option>
            <option value="approved">Approved & Active</option>
            <option value="pending_approval">Pending Moderation</option>
            <option value="rejected">Rejected</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <span className="text-muted-foreground font-medium">
          {filteredJobs.length} Recruitment Drives
        </span>
      </div>

      {/* Drives Table */}
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
                  <th className="p-3.5 pl-6">Drive Title & Organization</th>
                  <th className="p-3.5">CTC Package</th>
                  <th className="p-3.5">Cutoff Criteria</th>
                  <th className="p-3.5">Deadline</th>
                  <th className="p-3.5">Current Status</th>
                  <th className="p-3.5 text-right pr-6">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredJobs.map((j) => (
                  <tr key={j.job_id} className="hover:bg-background/80 transition-all">
                    <td className="p-3.5 pl-6">
                      <div className="font-bold text-foreground">{j.title}</div>
                      <div className="text-[11px] text-muted-foreground font-semibold">{j.company_name} • {j.role_type}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-extrabold text-primary text-sm">₹ {j.package_lpa} LPA</span>
                    </td>
                    <td className="p-3.5">
                      <div className="text-foreground font-medium">CGPA: {j.min_cgpa}+</div>
                      <div className="text-[11px] text-muted-foreground">Branches: {j.allowed_branches}</div>
                    </td>
                    <td className="p-3.5 text-muted-foreground font-medium">
                      {new Date(j.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        j.status === 'approved' ? 'bg-accent text-primary' :
                        j.status === 'pending_approval' ? 'bg-chart-3/10 text-chart-3' :
                        j.status === 'closed' ? 'bg-muted text-muted-foreground' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        {j.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(j.job_id, 'approved')}
                            className="px-2.5 py-1 rounded bg-accent text-primary hover:bg-accent font-semibold"
                            title="Approve Drive"
                          >
                            Approve
                          </button>
                        )}
                        {j.status !== 'rejected' && j.status !== 'closed' && (
                          <button
                            onClick={() => handleUpdateStatus(j.job_id, 'rejected')}
                            className="px-2.5 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/10 font-semibold"
                            title="Reject Drive"
                          >
                            Reject
                          </button>
                        )}
                        {j.status === 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(j.job_id, 'closed')}
                            className="px-2.5 py-1 rounded bg-muted text-foreground hover:bg-secondary font-semibold"
                            title="Close Drive"
                          >
                            Close
                          </button>
                        )}
                      </div>
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
