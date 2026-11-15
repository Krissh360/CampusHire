import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle2,
  Award,
  Building2,
  TrendingUp
} from 'lucide-react';

export default function AdminReportsPage() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get('/admin/report');
        if (res.data.success) {
          setReport(res.data.report);
        }
      } catch (err) {
        console.error('Error fetching placement report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const exportCSV = () => {
    if (!report || report.length === 0) return;

    const headers = ['Roll Number', 'Student Name', 'Branch', 'CGPA', 'Graduation Year', 'Placed Status', 'Company', 'Job Title', 'Offered CTC (LPA)', 'Offer Status'];
    const rows = report.map((r) => [
      r.roll_number,
      `"${r.student_name}"`,
      r.branch,
      r.cgpa,
      r.graduation_year,
      r.is_placed ? 'Placed' : 'Unplaced',
      `"${r.company_name || 'N/A'}"`,
      `"${r.job_title || 'N/A'}"`,
      r.package_lpa || 'N/A',
      r.offer_status || 'N/A'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CampusHire_Placement_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredReport = report.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.student_name.toLowerCase().includes(q) ||
      r.roll_number.toLowerCase().includes(q) ||
      (r.company_name && r.company_name.toLowerCase().includes(q)) ||
      r.branch.toLowerCase().includes(q)
    );
  });

  const totalStudents = report.length;
  const placedStudents = report.filter(r => r.is_placed).length;
  const placementRate = totalStudents ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Institutional Placement Report</h1>
          <p className="text-sm text-slate-500 mt-1">
            Official academic compilation of student recruitment outcomes, company offers, and compensation analytics.
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={report.length === 0}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Export Official Report (CSV)</span>
        </button>
      </div>

      {/* Highlights Strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase">Total Students</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalStudents}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase">Placed Candidates</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{placedStudents}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase">Placement Success Rate</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{placementRate}%</p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search report by name, roll, branch or recruiter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-slate-400 font-medium">
          {filteredReport.length} Records Shown
        </span>
      </div>

      {/* Report Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3.5 pl-6">USN / Roll</th>
                  <th className="p-3.5">Candidate Name</th>
                  <th className="p-3.5">Branch</th>
                  <th className="p-3.5">CGPA</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Recruiting Company</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5 text-right pr-6">Offered CTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReport.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-3.5 pl-6 font-mono font-bold text-slate-700">{r.roll_number}</td>
                    <td className="p-3.5 font-bold text-slate-900">{r.student_name}</td>
                    <td className="p-3.5 text-slate-700 font-semibold">{r.branch}</td>
                    <td className="p-3.5 font-extrabold text-blue-700">{r.cgpa}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.is_placed ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {r.is_placed ? 'Placed' : 'Seeking'}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">
                      {r.company_name || <span className="text-slate-400 font-normal">—</span>}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {r.job_title || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="p-3.5 text-right pr-6 font-extrabold text-emerald-700 text-sm">
                      {r.package_lpa ? `₹ ${r.package_lpa} LPA` : <span className="text-slate-400 font-normal">—</span>}
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
