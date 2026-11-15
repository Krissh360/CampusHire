import React, { useState, useEffect } from 'react';
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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Interview Scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Shortlisted':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const stages = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Job Applications</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor your recruitment progress, interview schedules, and status transitions.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No applications submitted yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You haven't applied for any recruitment drives yet. Browse the open drives to apply.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const currentStageIdx = stages.indexOf(app.status);
            const isRejected = app.status === 'Rejected';

            return (
              <div key={app.application_id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{app.company_name}</span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">{app.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Package: <strong className="text-slate-800">₹ {app.package_lpa} LPA</strong></span>
                      <span>•</span>
                      <span>Applied on: {new Date(app.applied_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => openHistory(app)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-blue-600 text-xs font-medium flex items-center gap-1.5 transition-all"
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
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                      {stages.map((stage, idx) => (
                        <span
                          key={stage}
                          className={idx <= currentStageIdx ? 'text-blue-600 font-bold' : ''}
                        >
                          {stage}
                        </span>
                      ))}
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                      {stages.map((stage, idx) => (
                        <div
                          key={stage}
                          className={`flex-1 transition-all ${
                            idx <= currentStageIdx ? 'bg-blue-600' : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Offer Letter Box if Selected */}
                {app.status === 'Selected' && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Award className="w-6 h-6 text-emerald-600" />
                      <div>
                        <h4 className="text-xs font-bold text-emerald-900">Official Placement Offer Issued!</h4>
                        <p className="text-[11px] text-emerald-700">Compensation: ₹ {app.package_offered || app.package_lpa} LPA</p>
                      </div>
                    </div>
                    <a
                      href="#download-offer"
                      onClick={(e) => { e.preventDefault(); alert(`Downloading Provisional Offer Letter for ${app.title} - ${app.company_name}`); }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-sm hover:bg-emerald-700 transition-all flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Application Status Audit Trail</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedAppHistory.title} • {selectedAppHistory.company_name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppHistory(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingHistory ? (
              <div className="py-10 text-center text-xs text-slate-400">Loading timeline...</div>
            ) : historyTimeline.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No transition logs found for this application.</div>
            ) : (
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {historyTimeline.map((item, idx) => (
                  <div key={item.history_id || idx} className="flex gap-3 text-xs">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-600 mt-1"></div>
                      {idx !== historyTimeline.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 my-1"></div>}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{item.new_status}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(item.changed_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">{item.remarks || 'Status updated.'}</p>
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
