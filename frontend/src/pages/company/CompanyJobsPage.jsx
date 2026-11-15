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
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Recruitment Drives & Applicants</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Filter, screen, schedule interviews, and finalize offers for applied students.
          </p>
        </div>
        <Link
          to="/company/post-job"
          className="px-4 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Drive</span>
        </Link>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-lg bg-accent border border-border text-xs font-semibold text-primary">
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Drives List Selector (Left column) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Your Drives</h3>
            {jobs.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-6 text-center text-xs text-muted-foreground">
                No active drives posted.
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.job_id}
                  onClick={() => selectJob(job)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    activeJob?.job_id === job.job_id
                      ? 'bg-accent/60 border-primary shadow-sm'
                      : 'bg-card border-border hover:border-input'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground">{job.title}</h4>
                    <span className="text-xs font-bold text-primary">₹ {job.package_lpa} LPA</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                    <span>Cutoff: CGPA {job.min_cgpa}+</span>
                    <span className="px-2 py-0.5 rounded-full bg-muted text-foreground font-semibold">
                      {job.applicant_count || 0} Applicants
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Applicants Management Panel (Right column) */}
          <div className="lg:col-span-8 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {activeJob ? (
              <div>
                {/* Job Summary Banner */}
                <div className="p-5 border-b border-border bg-background/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground">{activeJob.title} — Applicant Pipeline</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Target Batch: {activeJob.graduation_year} • Allowed Branches: {activeJob.allowed_branches} • Max Backlogs: {activeJob.max_active_backlogs}
                    </p>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="p-4 border-b border-border flex flex-wrap items-center gap-3 bg-card text-xs">
                  <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-semibold text-muted-foreground">Filters:</span>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-ring"
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
                    className="px-2.5 py-1.5 rounded-lg border border-border w-36 focus:outline-none focus:ring-1 focus:ring-ring"
                  />

                  <span className="ml-auto text-muted-foreground font-medium">
                    Showing {filteredApplicants.length} Candidates
                  </span>
                </div>

                {/* Applicants Table */}
                {loadingApplicants ? (
                  <div className="py-16 text-center text-xs text-muted-foreground">Loading applicants...</div>
                ) : filteredApplicants.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground text-xs">
                    No candidates found matching the selected filters.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-background text-muted-foreground font-semibold border-b border-border">
                        <tr>
                          <th className="p-3.5 pl-5">Candidate</th>
                          <th className="p-3.5">Branch / Roll</th>
                          <th className="p-3.5">CGPA</th>
                          <th className="p-3.5">Backlogs</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right pr-5">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredApplicants.map((app) => (
                          <tr key={app.application_id} className="hover:bg-background/80 transition-all">
                            <td className="p-3.5 pl-5">
                              <div className="font-bold text-foreground">{app.first_name} {app.last_name}</div>
                              <div className="text-[11px] text-muted-foreground">{app.email}</div>
                            </td>
                            <td className="p-3.5">
                              <span className="font-semibold text-foreground">{app.branch}</span>
                              <div className="text-[11px] text-muted-foreground font-mono">{app.roll_number}</div>
                            </td>
                            <td className="p-3.5">
                              <span className="font-extrabold text-primary text-sm">{app.cgpa}</span>
                            </td>
                            <td className="p-3.5">
                              <span className={app.active_backlogs > 0 ? 'text-destructive font-bold' : 'text-muted-foreground'}>
                                {app.active_backlogs}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                app.status === 'Selected' ? 'bg-accent text-primary' :
                                app.status === 'Shortlisted' ? 'bg-accent text-primary' :
                                app.status === 'Interview Scheduled' ? 'bg-accent text-primary' :
                                app.status === 'Rejected' ? 'bg-destructive/10 text-destructive' : 'bg-chart-3/10 text-chart-3'
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
                                    className="px-2 py-1 rounded bg-accent text-primary hover:bg-accent font-semibold"
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
                                    className="px-2 py-1 rounded bg-accent text-primary hover:bg-accent font-semibold"
                                    title="Schedule round"
                                  >
                                    Interview
                                  </button>
                                )}

                                {/* Select / Issue Offer */}
                                {app.status !== 'Selected' && (
                                  <button
                                    onClick={() => handleUpdateStatus(app.application_id, 'Selected', activeJob.package_lpa)}
                                    className="px-2 py-1 rounded bg-accent text-primary hover:bg-accent font-semibold"
                                    title="Issue Selection Offer"
                                  >
                                    Select
                                  </button>
                                )}

                                {/* Reject */}
                                {app.status !== 'Rejected' && app.status !== 'Selected' && (
                                  <button
                                    onClick={() => handleUpdateStatus(app.application_id, 'Rejected')}
                                    className="px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/10 font-semibold"
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
              <div className="p-12 text-center text-muted-foreground text-sm">
                Select a recruitment drive from the left panel to manage applicants.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {interviewModal.open && interviewModal.app && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card rounded-xl max-w-lg w-full shadow-2xl border border-border p-6 sm:p-7 space-y-5">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Schedule Interview Session</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Candidate: <strong>{interviewModal.app.first_name} {interviewModal.app.last_name}</strong> ({interviewModal.app.roll_number})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInterviewModal({ open: false, app: null })}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Recruitment Stage</label>
                <select
                  value={roundId}
                  onChange={(e) => setRoundId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-input focus:ring-2 focus:ring-ring focus:outline-none bg-card"
                >
                  <option value={1}>Round 1: Online Coding / Aptitude Assessment</option>
                  <option value={2}>Round 2: Technical Interview (DSA & System Design)</option>
                  <option value={3}>Round 3: HR & Leadership Alignment</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Date & Time Slot *</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input focus:ring-2 focus:ring-ring focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Virtual Meeting Link</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/xyz-abcd"
                  className="w-full px-3 py-2 rounded-lg border border-input focus:ring-2 focus:ring-ring focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Notes / Preparation Guidelines for Student</label>
                <textarea
                  rows={2}
                  value={interviewFeedback}
                  onChange={(e) => setInterviewFeedback(e.target.value)}
                  placeholder="e.g. Please be prepared to share your screen and write live code..."
                  className="w-full px-3 py-2 rounded-lg border border-input focus:ring-2 focus:ring-ring focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setInterviewModal({ open: false, app: null })}
                  className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-background font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-sm"
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
