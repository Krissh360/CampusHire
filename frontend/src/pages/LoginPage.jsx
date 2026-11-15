import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import BackgroundPaths from '../components/BackgroundPaths';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await login(email, password);
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'company') navigate('/company/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const autofill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="relative overflow-hidden min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <BackgroundPaths opacity={0.35} count={16} />
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="app-logo w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-foreground tracking-tight">Campus<span className="text-primary">Hire</span></span>
        </Link>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Sign in to your account</h2>
        <p className="mt-1 text-sm text-muted-foreground">Access your placement dashboard and job opportunities</p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-6 sm:px-10 shadow-sm rounded-xl border border-border">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-xs text-destructive font-medium leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu or recruiter@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">One-Click Academic Demo Logins</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => autofill('aarav.sharma@college.edu')}
                className="p-2 text-left rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all text-xs"
              >
                <div className="font-semibold text-foreground">Student</div>
                <div className="text-[11px] text-muted-foreground truncate">Aarav (9.4 CGPA)</div>
              </button>
              <button
                type="button"
                onClick={() => autofill('recruiter@google.com')}
                className="p-2 text-left rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all text-xs"
              >
                <div className="font-semibold text-foreground">Company</div>
                <div className="text-[11px] text-muted-foreground truncate">Google Recruiter</div>
              </button>
              <button
                type="button"
                onClick={() => autofill('admin@campushire.edu')}
                className="p-2 text-left rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all text-xs"
              >
                <div className="font-semibold text-foreground">Admin</div>
                <div className="text-[11px] text-muted-foreground truncate">Placement Head</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
