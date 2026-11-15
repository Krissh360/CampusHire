import React from 'react';
import { Link } from 'react-router-dom';
import BackgroundPaths from '../components/BackgroundPaths';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
  Users2,
  Layers,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-accent selection:text-primary-foreground">
      {/* Top Navbar */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-foreground tracking-tight">Campus<span className="text-primary">Hire</span></span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-foreground hover:text-primary hover:bg-muted transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        <BackgroundPaths opacity={0.35} count={16} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent border border-border text-primary text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Next-Gen Campus Placement & DBMS Management System
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight max-w-4xl mx-auto leading-tight">
            Digitize Campus Placements with <span className=" text-primary   ">Relational Precision</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-normal">
            A comprehensive, 3NF-normalized platform bridging students, corporate recruiters, and college placement officers. Automate eligibility checks, streamline multi-round interviews, and access placement analytics.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-lg text-base font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-sm transition-all flex items-center gap-2"
            >
              <span>Launch Demo Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-lg text-base font-semibold text-foreground bg-card hover:bg-background border border-input shadow-sm transition-all"
            >
              Create Account
            </Link>
          </div>

          {/* Key Metrics Banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
              <p className="text-3xl font-extrabold text-primary">28.5 LPA</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Highest Package Offered</p>
            </div>
            <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
              <p className="text-3xl font-extrabold text-primary">100%</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Automated Eligibility Check</p>
            </div>
            <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
              <p className="text-3xl font-extrabold text-primary">3NF</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Strict Relational Schema</p>
            </div>
            <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
              <p className="text-3xl font-extrabold text-primary">12+</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Connected DB Entities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tri-Role Architecture Highlights */}
      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Dedicated Portals for Every Stakeholder</h2>
            <p className="text-muted-foreground mt-3 text-sm">Role-based authorization and customized workflows designed for smooth recruitment operations.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Student */}
            <div className="bg-background rounded-xl p-7 border border-border hover:border-border transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-accent text-primary flex items-center justify-center mb-5">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Student Dashboard</h3>
                <p className="text-sm text-muted-foreground mt-2">Personalized career hub with automated eligibility checks and application pipelines.</p>
                <ul className="mt-5 space-y-2 text-xs text-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> CGPA & backlog validation</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> One-click job applications</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Multi-stage interview status</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Resume & skill profiling</li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <span className="text-xs font-semibold text-primary">Demo: aarav.sharma@college.edu</span>
              </div>
            </div>

            {/* Recruiter */}
            <div className="bg-background rounded-xl p-7 border border-border hover:border-border transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-accent text-primary flex items-center justify-center mb-5">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Company Portal</h3>
                <p className="text-sm text-muted-foreground mt-2">Publish recruitment drives, filter candidates, and manage interview pipelines.</p>
                <ul className="mt-5 space-y-2 text-xs text-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Post drives with custom cutoffs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Configure multi-round stages</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Filter candidates by CGPA & branch</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Schedule interviews & issue offers</li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <span className="text-xs font-semibold text-primary">Demo: recruiter@google.com</span>
              </div>
            </div>

            {/* Admin */}
            <div className="bg-background rounded-xl p-7 border border-border hover:border-border transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-accent text-primary flex items-center justify-center mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Placement Officer</h3>
                <p className="text-sm text-muted-foreground mt-2">Institutional oversight, recruiter verification, drive approvals, and analytics.</p>
                <ul className="mt-5 space-y-2 text-xs text-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Real-time placement percentage</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Branch-wise comparative analytics</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Verify companies & moderate jobs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Exportable placement reports</li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <span className="text-xs font-semibold text-primary">Demo: admin@campushire.edu</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-card text-muted-foreground py-10 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-primary-foreground font-bold">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span>CampusHire Management System</span>
          </div>
          <div>
            Built with React, Vite, Node.js, Express, and MySQL (3NF).
          </div>
        </div>
      </footer>
    </div>
  );
}
