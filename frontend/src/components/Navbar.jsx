import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Bell, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user
    ? user.first_name
      ? `${user.first_name} ${user.last_name || ''}`
      : user.company_name || 'Placement Officer'
    : 'User';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-slate-800">
          Welcome, <span className="text-blue-600 font-bold">{displayName}</span>
        </h2>
        {user?.roll_number && (
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-medium">
            {user.roll_number}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-slate-700">{user?.email}</p>
          <p className="text-[11px] text-slate-400 capitalize">Role: {user?.role}</p>
        </div>

        <button
          onClick={handleLogout}
          title="Sign out of CampusHire"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-xs font-medium transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
