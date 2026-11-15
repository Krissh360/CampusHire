import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Clock, MapPin, Video, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StudentInterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get('/students/interviews');
        if (res.data.success) {
          setInterviews(res.data.interviews);
        }
      } catch (err) {
        console.error('Error fetching interviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Interview Schedules</h1>
        <p className="text-sm text-slate-500 mt-1">
          Stay prepared for upcoming recruitment rounds and review interviewer feedback.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : interviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No interviews scheduled yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Once companies shortlist your application for technical or HR rounds, interview slots will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((item) => (
            <div key={item.interview_id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.company_name}</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">{item.job_title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                      {item.round_name} ({item.round_type})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    item.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs text-slate-600 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Time: <strong>{new Date(item.scheduled_time).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>Mode / Venue: <strong>{item.location || 'Virtual Video Call'}</strong></span>
                </div>
              </div>

              {item.feedback && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-0.5">Interviewer Feedback:</span>
                  <p className="text-slate-600 leading-relaxed">{item.feedback}</p>
                </div>
              )}

              {item.meeting_link && item.status !== 'Completed' && (
                <div className="pt-1 flex justify-end">
                  <a
                    href={item.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition-all flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Video Meeting</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
