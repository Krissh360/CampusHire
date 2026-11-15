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
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
    switch (status) {
      case 'Selected':
        return 'bg-chart-1';
      case 'Interview Scheduled':
        return 'bg-chart-3';
      case 'Shortlisted':
        return 'bg-chart-4';
      case 'Rejected':
        return 'bg-destructive';
      default:
        return 'bg-chart-2';
    }
  };

  const getProgressStep = (status) => {
    if (status === 'Selected') return 4;
    if (status === 'Interview Scheduled') return 3;
    if (status === 'Shortlisted') return 2;
    return 1;
  };

  const formatAppliedDate = (application) => {
    const date = application.applied_at || application.created_at;
    return date ? new Date(date).toLocaleDateString([], { dateStyle: 'medium' }) : 'Date pending';
  };

  const cgpa = Number(user?.cgpa || 8.5);
  const activeBacklogs = user?.active_backlogs ?? 0;

  return (
    <div className="space-y-8">
      {/* Placement Status Banner */}
      {user?.is_placed ? (
        <div className="relative overflow-hidden p-6 rounded-xl bg-primary text-primary-foreground shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-primary-foreground/10" />
          <div className="absolute right-24 -bottom-24 h-52 w-52 rounded-full bg-primary-foreground/10" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-foreground/10 backdrop-blur-md flex items-center justify-center text-primary-foreground">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Congratulations! You are officially Placed 🎉</h2>
              <p className="text-sm text-primary-foreground/80 mt-0.5">Your placement offer has been confirmed by the Placement Cell.</p>
            </div>
          </div>
          <Link
            to="/student/applications"
            className="relative z-10 px-4 py-2 rounded-full bg-card text-primary text-xs font-bold shadow hover:bg-accent transition-all flex items-center gap-1.5 pressable"
          >
            <span>View Offer Letter</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="relative overflow-hidden p-6 rounded-xl bg-primary text-primary-foreground shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="absolute -right-12 -top-20 h-48 w-48 rounded-full bg-primary-foreground/10" />
          <div className="absolute right-40 -bottom-28 h-56 w-56 rounded-full bg-primary-foreground/10" />
          <div className="relative z-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">Placement Drive Season 2026</span>
            <h2 className="text-2xl font-extrabold tracking-tight mt-1">Hello, {user?.first_name}! Ready for your next career move?</h2>
            <p className="text-sm text-primary-foreground/80 mt-1">Explore live recruitment drives matching your CGPA ({user?.cgpa || '8.5'}) and branch ({user?.branch}).</p>
          </div>
          <Link
            to="/student/jobs"
            className="relative z-10 px-5 py-2.5 rounded-full bg-card text-primary text-xs font-bold shadow hover:bg-accent transition-all flex items-center gap-2 whitespace-nowrap pressable"
          >
            <span>Explore Open Drives</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="interactive-card bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Applied</p>
            <p className="text-3xl font-extrabold text-foreground mt-1 tracking-tight">{stats.totalApplied}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Across all drives</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="interactive-card bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Shortlisted</p>
            <p className="text-3xl font-extrabold text-primary mt-1 tracking-tight">{stats.shortlisted}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Drives in review</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="interactive-card bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Interviews</p>
            <p className="text-3xl font-extrabold text-primary mt-1 tracking-tight">{stats.interviewScheduled}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Scheduled next</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="interactive-card bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Offers Awarded</p>
            <p className="text-3xl font-extrabold text-primary mt-1 tracking-tight">{stats.selectedOffers}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Offers accepted</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">Recent Applications</h3>
            </div>
            <Link to="/student/applications" className="text-xs font-bold text-primary hover:text-primary flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {recentApps.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">No active applications yet.</p>
                <Link to="/student/jobs" className="mt-3 inline-flex px-3 py-1.5 rounded-full border border-border text-xs font-semibold text-foreground hover:bg-accent pressable">
                  Browse drives
                </Link>
              </div>
            ) : (
              recentApps.map((app) => (
                <div key={app.application_id} className="p-4 hover:bg-accent/50 transition-all flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 shrink-0 rounded-lg bg-accent text-accent-foreground flex items-center justify-center font-bold">
                      {(app.company_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 pr-2">
                      <h4 className="text-sm font-bold text-foreground truncate">{app.title}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 truncate">
                        <span className="truncate">{app.company_name}</span>
                        <span>•</span>
                        <span className="font-semibold text-primary whitespace-nowrap">₹ {app.package_lpa} LPA</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">Applied {formatAppliedDate(app)}</p>
                      <div className="flex items-center gap-1 mt-2" aria-label={`Application progress: ${app.status}`}>
                        {['Applied', 'Shortlisted', 'Interview', 'Offer'].map((step, index) => (
                          <React.Fragment key={step}>
                            <span className={`h-1.5 w-6 rounded-full ${index < getProgressStep(app.status) ? 'bg-primary' : 'bg-muted'}`} />
                            {index < 3 && <span className="text-[9px] text-muted-foreground">{step === 'Interview' ? 'I' : ''}</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(app.status)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(app.status)}`} />
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
          <div className="bg-card rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-chart-3" />
                <h3 className="text-base font-bold text-foreground">Upcoming Interviews</h3>
              </div>
              <Link to="/student/interviews" className="text-xs font-bold text-primary hover:text-primary">
                View All
              </Link>
            </div>

            {interviews.length === 0 ? (
              <div className="text-center py-5">
                <div className="mx-auto w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">No scheduled interviews yet.</p>
                <Link to="/student/jobs" className="mt-3 inline-flex px-3 py-1.5 rounded-full border border-border text-xs font-semibold text-foreground hover:bg-accent pressable">
                  Explore drives
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {interviews.map((item) => (
                  <div key={item.interview_id} className="p-3.5 rounded-lg bg-background border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{item.company_name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-accent text-primary font-medium">
                        {item.round_name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {new Date(item.scheduled_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    {item.meeting_link && (
                      <a
                        href={item.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-1"
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
          <div className="bg-card rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">Academic Profile</h3>
              <Link to="/student/profile" className="text-xs font-bold text-primary hover:text-primary">Edit</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-background border border-border">
                <span className="text-muted-foreground block text-[11px]">CGPA</span>
                <span className="text-base font-extrabold font-mono text-foreground">{cgpa.toFixed(2)}</span>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(Math.max(cgpa * 10, 0), 100)}%` }} />
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-background border border-border">
                <span className="text-muted-foreground block text-[11px]">Branch</span>
                <span className="text-base font-extrabold font-mono text-foreground">{user?.branch || 'CSE'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-background border border-border">
                <span className="text-muted-foreground block text-[11px]">Active Backlogs</span>
                <span className={`inline-flex items-center gap-1 text-base font-extrabold font-mono ${activeBacklogs === 0 ? 'text-primary' : 'text-destructive'}`}>
                  {activeBacklogs}
                  {activeBacklogs === 0 && <span className="text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">Clear</span>}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-background border border-border">
                <span className="text-muted-foreground block text-[11px]">Graduation</span>
                <span className="text-base font-extrabold font-mono text-foreground">{user?.graduation_year || 2026}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
