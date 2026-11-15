import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  Award,
  PlusCircle,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeDrives: 0,
    totalDrives: 0,
    totalApplicants: 0,
    shortlisted: 0,
    interviewsScheduled: 0,
    selected: 0
  });
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, jobsRes, intRes] = await Promise.all([
          api.get('/companies/stats'),
          api.get('/companies/jobs'),
          api.get('/companies/interviews')
        ]);
        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (jobsRes.data.success) setJobs(jobsRes.data.jobs);
        if (intRes.data.success) setInterviews(intRes.data.interviews.slice(0, 4));
      } catch (err) {
        console.error('Error fetching company dashboard data:', err);
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

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-xl shadow-slate-900/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Recruiter Management Console</span>
          <h2 className="text-2xl font-extrabold tracking-tight mt-1">{user?.company_name || 'Recruiting Partner'}</h2>
          <p className="text-sm text-slate-300 mt-1">
            Manage your on-campus talent acquisition pipelines, conduct interviews, and release offers.
          </p>
        </div>
        <Link
          to="/company/post-job"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Drive</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Drives</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.activeDrives}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Applicants</p>
            <p className="text-3xl font-extrabold text-indigo-600 mt-1">{stats.totalApplicants}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Interviews</p>
            <p className="text-3xl font-extrabold text-amber-600 mt-1">{stats.interviewsScheduled}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Offers Issued</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.selected}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Active Drives List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Your Recruitment Drives</h3>
            </div>
            <Link to="/company/jobs" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>Manage Applicants</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {jobs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No recruitment drives published yet. Click "Publish New Drive" to get started!
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.job_id} className="p-5 hover:bg-slate-50/80 transition-all flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="font-semibold text-blue-600">₹ {job.package_lpa} LPA</span>
                      <span>•</span>
                      <span>Cutoff: CGPA {job.min_cgpa}+</span>
                      <span>•</span>
                      <span>Branches: {job.allowed_branches}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                      {job.applicant_count || 0} Applicants
                    </span>
                    <Link
                      to={`/company/jobs`}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-xs font-semibold transition-all"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Interview Slots */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Upcoming Interviews</h3>
            </div>
            <Link to="/company/interviews" className="text-xs font-bold text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>

          {interviews.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No scheduled interviews pending.</p>
          ) : (
            <div className="space-y-3">
              {interviews.map((item) => (
                <div key={item.interview_id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{item.first_name} {item.last_name}</span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {item.roll_number}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{item.round_name}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.scheduled_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
