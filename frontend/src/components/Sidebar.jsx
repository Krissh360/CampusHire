import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Calendar,
  User,
  Building2,
  Users,
  CheckCircle,
  BarChart3,
  FileSpreadsheet,
  PlusCircle,
  GraduationCap
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/jobs', label: 'Explore Drives', icon: Briefcase },
    { to: '/student/applications', label: 'My Applications', icon: FileText },
    { to: '/student/interviews', label: 'Interview Schedules', icon: Calendar },
    { to: '/student/profile', label: 'Academic Profile', icon: User },
  ];

  const companyLinks = [
    { to: '/company/dashboard', label: 'Recruitment Hub', icon: LayoutDashboard },
    { to: '/company/jobs', label: 'Our Drives & Applicants', icon: Briefcase },
    { to: '/company/post-job', label: 'Publish New Drive', icon: PlusCircle },
    { to: '/company/interviews', label: 'Candidate Interviews', icon: Calendar },
    { to: '/company/profile', label: 'Company Profile', icon: Building2 },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Placement Analytics', icon: BarChart3 },
    { to: '/admin/students', label: 'Student Directory', icon: Users },
    { to: '/admin/companies', label: 'Company Approvals', icon: Building2 },
    { to: '/admin/jobs', label: 'Drive Moderation', icon: Briefcase },
    { to: '/admin/reports', label: 'Placement Reports', icon: FileSpreadsheet },
  ];

  let links = [];
  let roleTitle = '';
  let badgeColor = '';

  if (user?.role === 'student') {
    links = studentLinks;
    roleTitle = 'Student Portal';
    badgeColor = 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
  } else if (user?.role === 'company') {
    links = companyLinks;
    roleTitle = 'Corporate Recruiter';
    badgeColor = 'bg-blue-500/10 text-blue-600 border-blue-200';
  } else if (user?.role === 'admin') {
    links = adminLinks;
    roleTitle = 'Placement Cell (Admin)';
    badgeColor = 'bg-purple-500/10 text-purple-600 border-purple-200';
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">CampusHire</h1>
            <p className="text-xs text-slate-400">Recruitment Portal</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${badgeColor}`}>
            {roleTitle}
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        DBMS Academic Project © 2026
      </div>
    </aside>
  );
}
