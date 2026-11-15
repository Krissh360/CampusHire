import React from 'react';
import { Link } from 'react-router-dom';
import BackgroundPaths from '../components/BackgroundPaths';
import {
  GraduationCap,
  Zap,
  ShieldCheck,
  ArrowRight,
  CalendarClock,
  BarChart3,
  Building2,
  Users,
} from 'lucide-react';
import { APP_FULL_NAME, APP_NAME } from '../config/brand';

export default function LandingPage() {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Instant eligibility checks',
      description: 'CGPA, backlogs, branch, and batch criteria are verified the moment you apply, so you only see drives you can actually join.',
    },
    {
      icon: CalendarClock,
      title: 'Multi-round interview tracking',
      description: 'Follow every round from shortlist to final offer, with schedules and status updates in one timeline.',
    },
    {
      icon: BarChart3,
      title: 'Placement analytics',
      description: 'Branch-wise placement rates, top recruiters, and package trends for officers, updated live.',
    },
  ];

  const roles = [
    { icon: GraduationCap, name: 'Students', description: 'Apply, track, and get hired.' },
    { icon: Building2, name: 'Recruiters', description: 'Post drives and shortlist the right candidates.' },
    { icon: Users, name: 'Placement officers', description: 'Manage the whole season with live data.' },
  ];

  const statsCards = [
    { value: '28.5 LPA', label: 'Highest Package Offered' },
    { value: '100%', label: 'Automated Eligibility Check' },
    { value: '3NF', label: 'Strict Relational Schema' },
    { value: '12+', label: 'Connected DB Entities' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-accent selection:text-primary-foreground">
      {/* Top Navbar */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="app-logo w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <Zap className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-xl font-extrabold text-foreground tracking-tight"><span>{APP_NAME.slice(0, 3)}</span><span className="text-primary">{APP_NAME.slice(3)}</span></span>
          </div>

          <nav aria-label="Primary navigation" className="flex items-center gap-3">
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
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-16 pb-20 lg:pt-24 lg:pb-32">
        <BackgroundPaths opacity={0.3} count={16} colorClass="text-primary" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="mb-10 text-center">
            <p className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
              {APP_NAME}
            </p>
            <p className="mt-2 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-normal">
              {APP_FULL_NAME.toUpperCase()}
            </p>
          </div>

          <h1 className="text-balance text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight max-w-4xl mx-auto leading-tight">
            Every placement, <span className="text-primary">one platform.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-normal">
            {APP_NAME} connects students, recruiters, and placement officers in a single place. Eligibility is checked automatically, interviews are scheduled without clashes, and results show up in real time.
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

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {statsCards.map((stat) => (
              <div key={stat.label} className="bg-card p-5 rounded-xl border border-border shadow-sm">
                <p className="text-3xl font-extrabold text-primary font-mono">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Everything your placement season needs</h2>
            <p className="text-muted-foreground mt-3 text-sm">Clear workflows for every stage, from eligibility to final offer.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="bg-card rounded-xl p-7 border border-border shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none"
              >
                <div className="w-11 h-11 rounded-lg bg-accent text-accent-foreground flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground tracking-tight text-center mb-10">Built for every role</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {roles.map(({ icon: Icon, name, description }) => (
              <div key={name} className="flex items-start gap-3">
                <Icon className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="font-bold text-foreground">{name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-card text-muted-foreground py-10 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-col items-center sm:items-start text-foreground font-bold">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" aria-hidden="true" />
              <span>{APP_NAME}</span>
            </div>
            <span className="mt-1 text-xs font-normal text-muted-foreground">{APP_FULL_NAME}</span>
          </div>
          <div className="text-center sm:text-right">
            <p>Built on a normalized relational schema with trigger-enforced eligibility rules, transactional offer handling, and indexed analytics queries.</p>
            <p className="mt-1">DBMS Academic Project © 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
