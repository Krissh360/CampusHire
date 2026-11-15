import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  FileText,
  Calendar,
  Award,
  ArrowRight,
  CheckCircle2,
  Clock,
  Building2,
  GraduationCap,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalApplied: 0, shortlisted: 0, interviewScheduled: 0, selectedOffers: 0 });
  const [recentApps, setRecentApps] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, appsRes, intRes] = await Promise.all([
          api.get('/students/stats'),
          api.get('/students/applications'),
          api.get('/students/interviews')
        ]);
        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (appsRes.data.success) setRecentApps(appsRes.data.applications.slice(0, 5));
        if (intRes.data.success) setInterviews(intRes.data.interviews.slice(0, 3));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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

  return (
    <div className="space-y-8">
      {/* Placement Status Banner */}
      {user?.is_placed ? (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Congratulations! You are officially Placed 🎉</h2>
              <p className="text-sm text-emerald-100 mt-0.5">Your placement offer has been confirmed by the Placement Cell.</p>
            </div>
          </div>
          <Link
            to="/student/applications"
            className="px-4 py-2 rounded-xl bg-white text-emerald-800 text-xs font-bold shadow hover:bg-emerald-50 transition-all flex items-center gap-1.5"
          >
            <span>View Offer Letter</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">Placement Drive Season 2026</span>
            <h2 className="text-2xl font-extrabold tracking-tight mt-1">Hello, {user?.first_name}! Ready for your next career move?</h2>
            <p className="text-sm text-blue-100 mt-1">Explore live recruitment drives matching your CGPA ({user?.cgpa || '8.5'}) and branch ({user?.branch}).</p>
          </div>
          <Link
            to="/student/jobs"
            className="px-5 py-2.5 rounded-xl bg-white text-blue-700 text-xs font-bold shadow hover:bg-blue-50 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span>Explore Open Drives</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Applied</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalApplied}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Shortlisted</p>
            <p className="text-3xl font-extrabold text-indigo-600 mt-1">{stats.shortlisted}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Interviews</p>
            <p className="text-3xl font-extrabold text-amber-600 mt-1">{stats.interviewScheduled}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Offers Awarded</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.selectedOffers}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Recent Applications</h3>
            </div>
            <Link to="/student/applications" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentApps.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No active applications yet. Browse the job board to apply!
              </div>
            ) : (
              recentApps.map((app) => (
                <div key={app.application_id} className="p-4 hover:bg-slate-50/80 transition-all flex items-center justify-between">
                  <div className="min-w-0 pr-4">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{app.title}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{app.company_name}</span>
                      <span>•</span>
                      <span className="font-semibold text-blue-600">₹ {app.package_lpa} LPA</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Interviews & Quick Profile */}
        <div className="space-y-6">
          {/* Upcoming Interviews */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Upcoming Interviews</h3>
              </div>
              <Link to="/student/interviews" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                View All
              </Link>
            </div>

            {interviews.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No scheduled interviews at this time.</p>
            ) : (
              <div className="space-y-3">
                {interviews.map((item) => (
                  <div key={item.interview_id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{item.company_name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-medium">
                        {item.round_name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.scheduled_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    {item.meeting_link && (
                      <a
                        href={item.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline pt-1"
                      >
                        <span>Join Virtual Room</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Academic Snapshot Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Academic Profile</h3>
              <Link to="/student/profile" className="text-xs font-bold text-blue-600 hover:text-blue-700">Edit</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">CGPA</span>
                <span className="text-base font-extrabold text-slate-800">{user?.cgpa || '8.50'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Branch</span>
                <span className="text-base font-extrabold text-slate-800">{user?.branch || 'CSE'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Active Backlogs</span>
                <span className="text-base font-extrabold text-slate-800">{user?.active_backlogs ?? 0}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Graduation</span>
                <span className="text-base font-extrabold text-slate-800">{user?.graduation_year || 2026}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
