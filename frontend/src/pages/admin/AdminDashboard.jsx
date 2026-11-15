import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  Award,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  CheckCircle,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        if (res.data.success) {
          setAnalytics(res.data.analytics);
        }
      } catch (err) {
        console.error('Error fetching admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const branchChartData = (analytics?.branchStats || []).map((b) => ({
    name: b.branch,
    Total: Number(b.total || 0),
    Placed: Number(b.placed || 0),
    Rate: Number(b.rate || 0)
  }));

  const companyChartData = (analytics?.topCompanies || []).map((c) => ({
    name: c.company_name.split(' ')[0], // short name
    Offers: Number(c.offers_made || 0),
    AvgPackage: Number(c.avg_package || 0)
  }));

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="p-6 rounded-xl bg-primary text-primary-foreground shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">Institutional Placement Cell</span>
          <h2 className="text-2xl font-extrabold tracking-tight mt-1">Campus Placement Intelligence Center</h2>
          <p className="text-sm text-primary-foreground/80 mt-1">
            Real-time DBMS relational metrics for student recruitments, company approvals, and compensation benchmarks.
          </p>
        </div>
        <Link
          to="/admin/reports"
          className="px-5 py-2.5 rounded-lg bg-card text-primary-foreground text-xs font-bold shadow hover:bg-accent transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Generate Placement Report</span>
        </Link>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Students</p>
            <p className="text-3xl font-extrabold text-foreground mt-1">{analytics?.total_students || 0}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{analytics?.placed_students || 0} Placed</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-accent text-primary flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Placement Rate</p>
            <p className="text-3xl font-extrabold text-primary mt-1">{analytics?.placement_rate || 0}%</p>
            <p className="text-[11px] text-primary mt-0.5">Batch 2026</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-accent text-primary flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Average Package</p>
            <p className="text-3xl font-extrabold text-primary mt-1">₹ {analytics?.avg_package || 0} <span className="text-base font-semibold">LPA</span></p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Peak: ₹ {analytics?.highest_package || 0} LPA</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-accent text-primary flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recruiting Partners</p>
            <p className="text-3xl font-extrabold text-primary mt-1">{analytics?.total_companies || 0}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{analytics?.active_jobs || 0} Active Drives</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-accent text-primary flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Branch-wise placement comparison chart */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Branch-wise Placement Statistics</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Total eligible students vs placed candidates per engineering discipline</p>
            </div>
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', color: 'hsl(var(--foreground))', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Total" fill="hsl(var(--secondary-foreground))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Placed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Company Package & Offer Distribution */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Top Recruiting Partners & CTC Benchmark</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Average salary offered per corporate recruiter (in LPA)</p>
            </div>
            <Award className="w-5 h-5 text-primary" />
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', color: 'hsl(var(--foreground))', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="AvgPackage" name="Avg CTC (LPA)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Access Action Cards */}
      <div className="grid md:grid-cols-3 gap-5">
        <Link
          to="/admin/companies"
          className="p-5 rounded-xl bg-card border border-border hover:border-border hover:shadow-sm transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Verify Companies</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Review corporate recruiter verification requests</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/admin/jobs"
          className="p-5 rounded-xl bg-card border border-border hover:border-border hover:shadow-sm transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Moderate Job Drives</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Approve or reject on-campus job drives</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/admin/students"
          className="p-5 rounded-xl bg-card border border-border hover:border-border hover:shadow-sm transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Student Directory</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Inspect academic records & toggle account states</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
