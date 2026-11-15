import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Search,
  Filter,
  Briefcase,
  Building2,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  X,
  Layers,
  Send,
  Sparkles
} from 'lucide-react';

export default function StudentJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterMinPackage, setFilterMinPackage] = useState('');
  const [filterEligibleOnly, setFilterEligibleOnly] = useState(false);

  // Selected job for detail modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applyNotes, setApplyNotes] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

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

  const handleApply = async () => {
    if (!selectedJob) return;
    setApplying(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await api.post('/applications/apply', {
        job_id: selectedJob.job_id,
        notes: applyNotes
      });

      if (res.data.success) {
        setMessage({ text: res.data.message || 'Application submitted successfully!', type: 'success' });
        // Refresh jobs list to update is_applied flag
        await fetchJobs();
        setSelectedJob({ ...selectedJob, is_applied: true });
      }
    } catch (err) {
      const errReason = err.response?.data?.reasons ? err.response.data.reasons.join(' | ') : err.response?.data?.message || err.message;
      setMessage({ text: errReason, type: 'error' });
    } finally {
      setApplying(false);
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !filterRole || job.role_type.toLowerCase() === filterRole.toLowerCase();
    const matchesPackage = !filterMinPackage || Number(job.package_lpa) >= Number(filterMinPackage);
    const matchesEligible = !filterEligibleOnly || (job.eligibility_check && job.eligibility_check.is_eligible);

    return matchesSearch && matchesRole && matchesPackage && matchesEligible;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active Recruitment Drives</h1>
        <p className="text-sm text-slate-500 mt-1">
          Browse verified company postings with automatic academic eligibility verification.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by role title, company name, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Employment Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={filterMinPackage}
              onChange={(e) => setFilterMinPackage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Any CTC Package</option>
              <option value="5">₹ 5+ LPA</option>
              <option value="10">₹ 10+ LPA</option>
              <option value="15">₹ 15+ LPA</option>
              <option value="20">₹ 20+ LPA</option>
            </select>
          </div>
        </div>

        {/* Eligibility Checkbox */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 select-none">
            <input
              type="checkbox"
              checked={filterEligibleOnly}
              onChange={(e) => setFilterEligibleOnly(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span>Show Only Eligible Drives (Match My CGPA, Branch & Backlogs)</span>
          </label>
          <span className="text-slate-400 font-medium">Found {filteredJobs.length} opportunities</span>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No recruitment drives found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search filters or uncheck the eligibility filter to view all campus opportunities.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const isEligible = job.eligibility_check ? job.eligibility_check.is_eligible : true;
            return (
              <div
                key={job.job_id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{job.company_name}</span>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5 leading-snug">{job.title}</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 whitespace-nowrap">
                      ₹ {job.package_lpa} LPA
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Deadline: {new Date(job.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Automated Eligibility Indicator */}
                  <div className="mb-4">
                    {job.is_applied ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                        Application Submitted
                      </span>
                    ) : isEligible ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Eligible to Apply
                      </span>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Not Eligible</span>
                        </div>
                        <p className="text-[11px] text-amber-700 mt-1 line-clamp-1">
                          {job.eligibility_check?.reasons[0]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedJob(job);
                    setMessage({ text: '', type: '' });
                    setApplyNotes('');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-blue-600 hover:text-white border border-slate-200 hover:border-transparent transition-all flex items-center justify-center gap-1.5"
                >
                  <span>View Details & Criteria</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Job Details & Application Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">{selectedJob.company_name}</span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">{selectedJob.title}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">{selectedJob.role_type}</span>
                  <span>Package: <strong className="text-slate-800">₹ {selectedJob.package_lpa} LPA</strong></span>
                  <span>Location: <strong className="text-slate-800">{selectedJob.location}</strong></span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alert Message */}
            {message.text && (
              <div className={`p-4 rounded-xl text-xs font-medium ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Role Overview</h4>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
            </div>

            {/* Academic Eligibility Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Eligibility Requirements Checklist
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Minimum CGPA</span>
                  <span className="font-bold text-slate-800">{selectedJob.min_cgpa ?? '6.00'} / 10.00</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Active Backlog Limit</span>
                  <span className="font-bold text-slate-800">Max {selectedJob.max_active_backlogs ?? 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Allowed Branches</span>
                  <span className="font-bold text-slate-800">{selectedJob.allowed_branches || 'All Engineering Branches'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Graduation Batch</span>
                  <span className="font-bold text-slate-800">{selectedJob.graduation_year || 2026}</span>
                </div>
              </div>

              {/* Status Note */}
              {selectedJob.eligibility_check && !selectedJob.eligibility_check.is_eligible && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-xs text-red-600 font-semibold mb-1">Reason for Ineligibility:</p>
                  <ul className="list-disc pl-5 text-xs text-red-500 space-y-0.5">
                    {selectedJob.eligibility_check.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Application Section */}
            {selectedJob.is_applied ? (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
                <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-blue-800">You have already submitted an application for this drive.</p>
                <p className="text-[11px] text-blue-600 mt-0.5">Track status updates in the "My Applications" tab.</p>
              </div>
            ) : selectedJob.eligibility_check && !selectedJob.eligibility_check.is_eligible ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <XCircle className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-amber-800">Application Locked</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Your academic records do not meet the minimum eligibility cutoffs set by {selectedJob.company_name}.
                </p>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Application Pitch / Candidate Remarks (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={applyNotes}
                    onChange={(e) => setApplyNotes(e.target.value)}
                    placeholder="Briefly state your key technical strengths or project highlights..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={applying}
                  onClick={handleApply}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {applying ? (
                    'Submitting Application to Recruitment Portal...'
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Confirm & Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
