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
        return 'bg-accent text-primary border-border';
      case 'Interview Scheduled':
        return 'bg-accent text-primary border-border';
      case 'Shortlisted':
        return 'bg-accent text-primary border-border';
      case 'Rejected':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      default:
        return 'bg-chart-3/10 text-chart-3 border-chart-3/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* Placement Status Banner */}
      {user?.is_placed ? (
        <div className="p-6 rounded-xl bg-primary text-primary-foreground shadow-sm shadow-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-foreground/10 backdrop-blur-md flex items-center justify-center text-primary-foreground">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Congratulations! You are officially Placed 🎉</h2>
              <p className="text-sm text-primary-foreground/80 mt-0.5">Your placement offer has been confirmed by the Placement Cell.</p>
            </div>
          </div>
          <Link
            to="/student/applications"
            className="px-4 py-2 rounded-lg bg-card text-primary text-xs font-bold shadow hover:bg-accent transition-all flex items-center gap-1.5"
          >
            <span>View Offer Letter</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-primary text-primary-foreground shadow-sm shadow-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">Placement Drive Season 2026</span>
            <h2 className="text-2xl font-extrabold tracking-tight mt-1">Hello, {user?.first_name}! Ready for your next career move?</h2>
            <p className="text-sm text-primary-foreground/80 mt-1">Explore live recruitment drives matching your CGPA ({user?.cgpa || '8.5'}) and branch ({user?.branch}).</p>
          </div>
          <Link
            to="/student/jobs"
            className="px-5 py-2.5 rounded-lg bg-card text-primary text-xs font-bold shadow hover:bg-accent transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span>Explore Open Drives</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Applied</p>
            <p className="text-3xl font-extrabold text-foreground mt-1">{stats.totalApplied}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-accent text-primary flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Shortlisted</p>
            <p className="text-3xl font-extrabold text-primary mt-1">{stats.shortlisted}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-accent text-primary flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Interviews</p>
            <p className="text-3xl font-extrabold text-chart-3 mt-1">{stats.interviewScheduled}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-chart-3/10 text-chart-3 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Offers Awarded</p>
            <p className="text-3xl font-extrabold text-primary mt-1">{stats.selectedOffers}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-accent text-primary flex items-center justify-center">
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
              <div className="p-8 text-center text-muted-foreground text-sm">
                No active applications yet. Browse the job board to apply!
              </div>
            ) : (
              recentApps.map((app) => (
                <div key={app.application_id} className="p-4 hover:bg-background/80 transition-all flex items-center justify-between">
                  <div className="min-w-0 pr-4">
                    <h4 className="text-sm font-bold text-foreground truncate">{app.title}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>{app.company_name}</span>
                      <span>•</span>
                      <span className="font-semibold text-primary">₹ {app.package_lpa} LPA</span>
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
              <p className="text-xs text-muted-foreground text-center py-6">No scheduled interviews at this time.</p>
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
                <span className="text-base font-extrabold text-foreground">{user?.cgpa || '8.50'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-background border border-border">
                <span className="text-muted-foreground block text-[11px]">Branch</span>
                <span className="text-base font-extrabold text-foreground">{user?.branch || 'CSE'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-background border border-border">
                <span className="text-muted-foreground block text-[11px]">Active Backlogs</span>
                <span className="text-base font-extrabold text-foreground">{user?.active_backlogs ?? 0}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-background border border-border">
                <span className="text-muted-foreground block text-[11px]">Graduation</span>
                <span className="text-base font-extrabold text-foreground">{user?.graduation_year || 2026}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
