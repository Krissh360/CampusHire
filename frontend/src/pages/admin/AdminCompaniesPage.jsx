import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Building2,
  ShieldCheck,
  ShieldAlert,
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Briefcase,
  Users
} from 'lucide-react';

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/admin/companies');
      if (res.data.success) {
        setCompanies(res.data.companies);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleVerify = async (companyId, currentVerified) => {
    const newStatus = !currentVerified;
    try {
      const res = await api.put(`/admin/companies/${companyId}/verify`, { is_verified: newStatus });
      if (res.data.success) {
        setActionMsg(res.data.message);
        await fetchCompanies();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update verification status.');
    }
  };

  const filteredCompanies = companies.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.company_name.toLowerCase().includes(q) ||
      (c.industry && c.industry.toLowerCase().includes(q)) ||
      (c.hr_name && c.hr_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recruiting Partner Organizations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review corporate recruiter registrations, grant verified partner credentials, and inspect hiring activity.
          </p>
        </div>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800">
          {actionMsg}
        </div>
      )}

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search company by name or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-slate-400 font-medium">
          {filteredCompanies.length} Registered Companies
        </span>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((c) => (
            <div key={c.company_id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{c.company_name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{c.industry || 'Technology'}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                    c.is_verified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <ShieldCheck className="w-3 h-3" />
                    {c.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 p-3.5 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                  <div>HR Contact: <strong>{c.hr_name || 'N/A'}</strong></div>
                  <div className="text-slate-500 truncate">Email: {c.hr_email || c.email}</div>
                  {c.location && <div className="text-slate-500">Location: {c.location}</div>}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    <strong>{c.total_jobs || 0}</strong> Drives
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <strong>{c.total_applicants || 0}</strong> Applicants
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {c.website ? (
                  <a
                    href={c.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : <span />}

                <button
                  onClick={() => handleVerify(c.company_id, c.is_verified)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    c.is_verified
                      ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                  }`}
                >
                  {c.is_verified ? 'Revoke Verification' : 'Verify Partner'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
