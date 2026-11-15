import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = React.useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('campushire-theme', next ? 'dark' : 'light');
    setIsDark(next);
  };

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
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-foreground">
          Welcome, <span className="text-primary font-bold">{displayName}</span>
        </h2>
        {user?.roll_number && (
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-mono font-medium">
            {user.roll_number}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-foreground">{user?.email}</p>
          <p className="text-[11px] text-muted-foreground capitalize">Role: {user?.role}</p>
        </div>

        <button onClick={toggleTheme} title={isDark ? 'Use light theme' : 'Use dark theme'} className="p-2 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors pressable">
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={handleLogout}
          title="Sign out of CampusHire"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 text-xs font-medium transition-all pressable"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
