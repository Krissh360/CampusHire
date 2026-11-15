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
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 rounded-xl token-primary-surface shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="absolute -right-12 -top-20 h-48 w-48 rounded-full bg-primary-foreground/10" />
        <div className="absolute right-40 -bottom-28 h-56 w-56 rounded-full bg-primary-foreground/10" />
        <div className="relative z-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">Recruiter Management Console</span>
          <h2 className="text-2xl font-extrabold tracking-tight mt-1">{user?.company_name || 'Recruiting Partner'}</h2>
          <p className="text-sm text-primary-foreground/80 mt-1">
            Manage your on-campus talent acquisition pipelines, conduct interviews, and release offers.
          </p>
        </div>
        <Link
          to="/company/post-job"
          className="relative z-10 px-5 py-2.5 rounded-full bg-card hover:bg-accent text-primary text-xs font-bold shadow-sm transition-all flex items-center gap-2 whitespace-nowrap pressable"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Drive</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Active Drives</p>
            <p className="text-3xl font-extrabold text-foreground mt-1">{stats.activeDrives}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-accent text-primary flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Applicants</p>
            <p className="text-3xl font-extrabold text-primary mt-1">{stats.totalApplicants}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-accent text-primary flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Interviews</p>
            <p className="text-3xl font-extrabold text-chart-3 mt-1">{stats.interviewsScheduled}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-chart-3/10 text-chart-3 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Offers Issued</p>
            <p className="text-3xl font-extrabold text-primary mt-1">{stats.selected}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-accent text-primary flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Active Drives List */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">Your Recruitment Drives</h3>
            </div>
            <Link to="/company/jobs" className="text-xs font-bold text-primary hover:text-primary flex items-center gap-1">
              <span>Manage Applicants</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {jobs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No recruitment drives published yet. Click "Publish New Drive" to get started!
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.job_id} className="p-5 hover:bg-background/80 transition-all flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{job.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="font-semibold text-primary">₹ {job.package_lpa} LPA</span>
                      <span>•</span>
                      <span>Cutoff: CGPA {job.min_cgpa}+</span>
                      <span>•</span>
                      <span>Branches: {job.allowed_branches}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-muted text-foreground">
                      {job.applicant_count || 0} Applicants
                    </span>
                    <Link
                      to={`/company/jobs`}
                      className="px-3 py-1.5 rounded-lg border border-border hover:bg-accent hover:text-primary hover:border-border text-xs font-semibold transition-all"
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
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-chart-3" />
              <h3 className="text-base font-bold text-foreground">Upcoming Interviews</h3>
            </div>
            <Link to="/company/interviews" className="text-xs font-bold text-primary hover:text-primary">
              View All
            </Link>
          </div>

          {interviews.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No scheduled interviews pending.</p>
          ) : (
            <div className="space-y-3">
              {interviews.map((item) => (
                <div key={item.interview_id} className="p-3.5 rounded-lg bg-background border border-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{item.first_name} {item.last_name}</span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-secondary text-foreground">
                      {item.roll_number}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{item.round_name}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
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
