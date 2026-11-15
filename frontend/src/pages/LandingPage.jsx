import React from 'react';
import { Link } from 'react-router-dom';
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
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">Campus<span className="text-blue-600">Hire</span></span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Next-Gen Campus Placement & DBMS Management System
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Digitize Campus Placements with <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Relational Precision</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal">
            A comprehensive, 3NF-normalized platform bridging students, corporate recruiters, and college placement officers. Automate eligibility checks, streamline multi-round interviews, and access placement analytics.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2"
            >
              <span>Launch Demo Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-all"
            >
              Create Account
            </Link>
          </div>

          {/* Key Metrics Banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-3xl font-extrabold text-blue-600">28.5 LPA</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Highest Package Offered</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-3xl font-extrabold text-emerald-600">100%</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Automated Eligibility Check</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-3xl font-extrabold text-indigo-600">3NF</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Strict Relational Schema</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-3xl font-extrabold text-purple-600">12+</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Connected DB Entities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tri-Role Architecture Highlights */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dedicated Portals for Every Stakeholder</h2>
            <p className="text-slate-600 mt-3 text-sm">Role-based authorization and customized workflows designed for smooth recruitment operations.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Student */}
            <div className="bg-slate-50 rounded-2xl p-7 border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Student Dashboard</h3>
                <p className="text-sm text-slate-600 mt-2">Personalized career hub with automated eligibility checks and application pipelines.</p>
                <ul className="mt-5 space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> CGPA & backlog validation</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> One-click job applications</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Multi-stage interview status</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Resume & skill profiling</li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200">
                <span className="text-xs font-semibold text-blue-600">Demo: aarav.sharma@college.edu</span>
              </div>
            </div>

            {/* Recruiter */}
            <div className="bg-slate-50 rounded-2xl p-7 border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Company Portal</h3>
                <p className="text-sm text-slate-600 mt-2">Publish recruitment drives, filter candidates, and manage interview pipelines.</p>
                <ul className="mt-5 space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Post drives with custom cutoffs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Configure multi-round stages</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Filter candidates by CGPA & branch</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Schedule interviews & issue offers</li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200">
                <span className="text-xs font-semibold text-indigo-600">Demo: recruiter@google.com</span>
              </div>
            </div>

            {/* Admin */}
            <div className="bg-slate-50 rounded-2xl p-7 border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Placement Officer</h3>
                <p className="text-sm text-slate-600 mt-2">Institutional oversight, recruiter verification, drive approvals, and analytics.</p>
                <ul className="mt-5 space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Real-time placement percentage</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Branch-wise comparative analytics</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Verify companies & moderate jobs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Exportable placement reports</li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200">
                <span className="text-xs font-semibold text-purple-600">Demo: admin@campushire.edu</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-white font-bold">
            <GraduationCap className="w-4 h-4 text-blue-500" />
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
