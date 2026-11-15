import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Briefcase,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Calendar,
  Award,
  FileText,
  Clock,
  ArrowRight,
  PlusCircle,
  ExternalLink,
  X
} from 'lucide-react';

export default function CompanyJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected job for reviewing applicants
  const [activeJob, setActiveJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [minCgpaFilter, setMinCgpaFilter] = useState('');

  // Schedule Interview Modal State
  const [interviewModal, setInterviewModal] = useState({ open: false, app: null });
  const [scheduledTime, setScheduledTime] = useState('');
  const [roundId, setRoundId] = useState(1);
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/recruitment-session');
  const [interviewLocation, setInterviewLocation] = useState('Google Meet (Virtual)');
  const [interviewFeedback, setInterviewFeedback] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchJobs = async () => {
    try {
      const res = await api.get('/companies/jobs');
      if (res.data.success) {
        setJobs(res.data.jobs);
        if (res.data.jobs.length > 0 && !activeJob) {
          selectJob(res.data.jobs[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching company jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const selectJob = async (job) => {
    setActiveJob(job);
    setLoadingApplicants(true);
    setActionMessage('');
    try {
      const res = await api.get(`/companies/jobs/${job.job_id}/applicants`);
      if (res.data.success) {
        setApplicants(res.data.applicants);
      }
    } catch (err) {
      console.error('Error fetching applicants:', err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleUpdateStatus = async (applicationId, status, packageOffered = null) => {
    try {
      const res = await api.put(`/companies/applications/${applicationId}/status`, {
        status,
        remarks: `Updated candidate status to ${status} via recruitment dashboard`,
        package_offered: packageOffered
      });

      if (res.data.success) {
        setActionMessage(`Candidate status updated to '${status}'.`);
        // Refresh applicants
        if (activeJob) selectJob(activeJob);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleScheduleInterviewSubmit = async (e) => {
    e.preventDefault();
    if (!interviewModal.app || !scheduledTime) return;

    try {
      const res = await api.post('/companies/interviews', {
        application_id: interviewModal.app.application_id,
        round_id: roundId,
        scheduled_time: scheduledTime,
        meeting_link: meetingLink,
        location: interviewLocation,
        feedback: interviewFeedback
      });

      if (res.data.success) {
        setInterviewModal({ open: false, app: null });
        setActionMessage('Interview successfully scheduled and email invite sent to candidate.');
        if (activeJob) selectJob(activeJob);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule interview.');
    }
  };

  // Filtered applicants
  const filteredApplicants = applicants.filter((app) => {
    const matchesStatus = !statusFilter || app.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCgpa = !minCgpaFilter || Number(app.cgpa) >= Number(minCgpaFilter);
    return matchesStatus && matchesCgpa;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recruitment Drives & Applicants</h1>
          <p className="text-sm text-slate-500 mt-1">
            Filter, screen, schedule interviews, and finalize offers for applied students.
          </p>
        </div>
        <Link
          to="/company/post-job"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Drive</span>
        </Link>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Drives List Selector (Left column) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Your Drives</h3>
            {jobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-400">
                No active drives posted.
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.job_id}
                  onClick={() => selectJob(job)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    activeJob?.job_id === job.job_id
                      ? 'bg-blue-50/60 border-blue-400 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                    <span className="text-xs font-bold text-blue-700">₹ {job.package_lpa} LPA</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                    <span>Cutoff: CGPA {job.min_cgpa}+</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                      {job.applicant_count || 0} Applicants
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Applicants Management Panel (Right column) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {activeJob ? (
              <div>
                {/* Job Summary Banner */}
                <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{activeJob.title} — Applicant Pipeline</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Target Batch: {activeJob.graduation_year} • Allowed Branches: {activeJob.allowed_branches} • Max Backlogs: {activeJob.max_active_backlogs}
                    </p>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3 bg-white text-xs">
                  <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-600">Filters:</span>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="Applied">Applied</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="Min CGPA (e.g. 8.0)"
                    value={minCgpaFilter}
                    onChange={(e) => setMinCgpaFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 w-36 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />

                  <span className="ml-auto text-slate-400 font-medium">
                    Showing {filteredApplicants.length} Candidates
                  </span>
                </div>

                {/* Applicants Table */}
                {loadingApplicants ? (
                  <div className="py-16 text-center text-xs text-slate-400">Loading applicants...</div>
                ) : filteredApplicants.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    No candidates found matching the selected filters.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                        <tr>
                          <th className="p-3.5 pl-5">Candidate</th>
                          <th className="p-3.5">Branch / Roll</th>
                          <th className="p-3.5">CGPA</th>
                          <th className="p-3.5">Backlogs</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right pr-5">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredApplicants.map((app) => (
                          <tr key={app.application_id} className="hover:bg-slate-50/80 transition-all">
                            <td className="p-3.5 pl-5">
                              <div className="font-bold text-slate-900">{app.first_name} {app.last_name}</div>
                              <div className="text-[11px] text-slate-400">{app.email}</div>
                            </td>
                            <td className="p-3.5">
                              <span className="font-semibold text-slate-800">{app.branch}</span>
                              <div className="text-[11px] text-slate-400 font-mono">{app.roll_number}</div>
                            </td>
                            <td className="p-3.5">
                              <span className="font-extrabold text-blue-700 text-sm">{app.cgpa}</span>
                            </td>
                            <td className="p-3.5">
                              <span className={app.active_backlogs > 0 ? 'text-red-600 font-bold' : 'text-slate-500'}>
                                {app.active_backlogs}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                app.status === 'Selected' ? 'bg-emerald-50 text-emerald-700' :
                                app.status === 'Shortlisted' ? 'bg-indigo-50 text-indigo-700' :
                                app.status === 'Interview Scheduled' ? 'bg-blue-50 text-blue-700' :
                                app.status === 'Rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right pr-5">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Shortlist */}
                                {app.status !== 'Shortlisted' && app.status !== 'Selected' && app.status !== 'Rejected' && (
                                  <button
                                    onClick={() => handleUpdateStatus(app.application_id, 'Shortlisted')}
                                    className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold"
                                    title="Shortlist for rounds"
                                  >
                                    Shortlist
                                  </button>
                                )}

                                {/* Schedule Interview */}
                                {app.status !== 'Selected' && app.status !== 'Rejected' && (
                                  <button
                                    onClick={() => {
                                      setInterviewModal({ open: true, app });
                                      setScheduledTime(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16));
                                    }}
                                    className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold"
                                    title="Schedule round"
                                  >
                                    Interview
                                  </button>
                                )}

                                {/* Select / Issue Offer */}
                                {app.status !== 'Selected' && (
                                  <button
                                    onClick={() => handleUpdateStatus(app.application_id, 'Selected', activeJob.package_lpa)}
                                    className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold"
                                    title="Issue Selection Offer"
                                  >
                                    Select
                                  </button>
                                )}

                                {/* Reject */}
                                {app.status !== 'Rejected' && app.status !== 'Selected' && (
                                  <button
                                    onClick={() => handleUpdateStatus(app.application_id, 'Rejected')}
                                    className="px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 font-semibold"
                                    title="Reject candidate"
                                  >
                                    Reject
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 text-sm">
                Select a recruitment drive from the left panel to manage applicants.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {interviewModal.open && interviewModal.app && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Schedule Interview Session</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Candidate: <strong>{interviewModal.app.first_name} {interviewModal.app.last_name}</strong> ({interviewModal.app.roll_number})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInterviewModal({ open: false, app: null })}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recruitment Stage</label>
                <select
                  value={roundId}
                  onChange={(e) => setRoundId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value={1}>Round 1: Online Coding / Aptitude Assessment</option>
                  <option value={2}>Round 2: Technical Interview (DSA & System Design)</option>
                  <option value={3}>Round 3: HR & Leadership Alignment</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date & Time Slot *</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Virtual Meeting Link</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/xyz-abcd"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Preparation Guidelines for Student</label>
                <textarea
                  rows={2}
                  value={interviewFeedback}
                  onChange={(e) => setInterviewFeedback(e.target.value)}
                  placeholder="e.g. Please be prepared to share your screen and write live code..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setInterviewModal({ open: false, app: null })}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20"
                >
                  Confirm & Schedule Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
