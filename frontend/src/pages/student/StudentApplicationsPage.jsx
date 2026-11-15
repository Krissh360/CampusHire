import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Award,
  Download,
  History,
  X
} from 'lucide-react';

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppHistory, setSelectedAppHistory] = useState(null);
  const [historyTimeline, setHistoryTimeline] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.get('/students/applications');
        if (res.data.success) {
          setApplications(res.data.applications);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const openHistory = async (app) => {
    setSelectedAppHistory(app);
    setLoadingHistory(true);
    try {
      const res = await api.get(`/applications/${app.application_id}/history`);
      if (res.data.success) {
        setHistoryTimeline(res.data.history);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
        return 'bg-chart-1/10 text-chart-1 border-chart-1/30';
      case 'Interview Scheduled':
        return 'bg-chart-3/10 text-chart-3 border-chart-3/30';
      case 'Shortlisted':
        return 'bg-chart-4/10 text-chart-4 border-chart-4/30';
      case 'Rejected':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      default:
        return 'bg-chart-2/10 text-chart-2 border-chart-2/30';
    }
  };

  const getStatusDot = (status) => {
    if (status === 'Selected') return 'bg-chart-1';
    if (status === 'Interview Scheduled') return 'bg-chart-3';
    if (status === 'Shortlisted') return 'bg-chart-4';
    if (status === 'Rejected') return 'bg-destructive';
    return 'bg-chart-2';
  };

  const stages = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">My Job Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your recruitment progress, interview schedules, and status transitions.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">No applications submitted yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            You haven't applied for any recruitment drives yet. Browse the open drives to apply.
          </p>
          <Link to="/student/jobs" className="mt-4 inline-flex px-3 py-1.5 rounded-full border border-border text-xs font-semibold text-foreground hover:bg-accent pressable">
            Browse drives
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const currentStageIdx = stages.indexOf(app.status);
            const isRejected = app.status === 'Rejected';

            return (
              <div key={app.application_id} className="interactive-card bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{app.company_name}</span>
                    <h3 className="text-lg font-bold text-foreground mt-0.5">{app.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>Package: <strong className="text-foreground">₹ {app.package_lpa} LPA</strong></span>
                      <span>•</span>
                      <span>Applied on: {new Date(app.applied_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(app.status)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(app.status)}`} />
                      {app.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => openHistory(app)}
                      className="p-2 rounded-lg border border-border hover:bg-background text-muted-foreground hover:text-primary text-xs font-medium flex items-center gap-1.5 transition-all"
                      title="View Status History"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Timeline</span>
                    </button>
                  </div>
                </div>

                {/* Visual Pipeline Bar */}
                {!isRejected && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-2">
                      {stages.map((stage, idx) => (
                        <span
                          key={stage}
                          className={idx <= currentStageIdx ? 'text-primary font-bold' : ''}
                        >
                          {stage}
                        </span>
                      ))}
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                      {stages.map((stage, idx) => (
                        <div
                          key={stage}
                          className={`flex-1 transition-all ${
                            idx <= currentStageIdx ? 'token-primary-surface' : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Offer Letter Box if Selected */}
                {app.status === 'Selected' && (
                  <div className="p-4 rounded-lg bg-accent border border-border flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Award className="w-6 h-6 text-primary" />
                      <div>
                        <h4 className="text-xs font-bold text-primary">Official Placement Offer Issued!</h4>
                        <p className="text-[11px] text-primary">Compensation: ₹ {app.package_offered || app.package_lpa} LPA</p>
                      </div>
                    </div>
                    <a
                      href="#download-offer"
                      onClick={(e) => { e.preventDefault(); alert(`Downloading Provisional Offer Letter for ${app.title} - ${app.company_name}`); }}
                      className="px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:bg-primary/90 transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Offer</span>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* History Audit Trail Modal */}
      {selectedAppHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card rounded-xl max-w-lg w-full shadow-2xl border border-border p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Application Status Audit Trail</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedAppHistory.title} • {selectedAppHistory.company_name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppHistory(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingHistory ? (
              <div className="py-10 text-center text-xs text-muted-foreground">Loading timeline...</div>
            ) : historyTimeline.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">No transition logs found for this application.</div>
            ) : (
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {historyTimeline.map((item, idx) => (
                  <div key={item.history_id || idx} className="flex gap-3 text-xs">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary mt-1"></div>
                      {idx !== historyTimeline.length - 1 && <div className="w-0.5 flex-1 bg-secondary my-1"></div>}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">{item.new_status}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(item.changed_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px] mt-0.5">{item.remarks || 'Status updated.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
