import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Clock, MapPin, Video, ExternalLink, User, CheckCircle2 } from 'lucide-react';

export default function CompanyInterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get('/companies/interviews');
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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Scheduled Candidate Interviews</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review candidate interview rosters, stages, and meeting session coordinates.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : interviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No scheduled candidate interviews</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Go to "Our Drives & Applicants" and click "Interview" on shortlisted students to create interview slots.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {interviews.map((item) => (
            <div key={item.interview_id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{item.first_name} {item.last_name}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="font-mono">{item.roll_number}</span>
                    <span>•</span>
                    <span>{item.branch} (CGPA: {item.cgpa})</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {item.status}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                <div className="font-semibold text-slate-800">{item.job_title}</div>
                <div className="text-slate-600 font-medium">Stage: {item.round_name} ({item.round_type})</div>
                <div className="text-slate-500 flex items-center gap-1.5 pt-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{new Date(item.scheduled_time).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</span>
                </div>
              </div>

              {item.meeting_link && (
                <div className="flex justify-end pt-1">
                  <a
                    href={item.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Launch Interview Session</span>
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
