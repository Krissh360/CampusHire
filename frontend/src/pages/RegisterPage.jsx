import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Building2, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import BackgroundPaths from '../components/BackgroundPaths';

export default function RegisterPage() {
  const [role, setRole] = useState('student'); // 'student' or 'company'
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Student State
  const [studentForm, setStudentForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    roll_number: '',
    branch: 'CSE',
    semester: 8,
    cgpa: '',
    graduation_year: 2026,
    active_backlogs: 0,
    total_backlogs: 0,
    phone: ''
  });

  // Company State
  const [companyForm, setCompanyForm] = useState({
    company_name: '',
    email: '',
    password: '',
    industry: 'Software & Technology',
    website: '',
    description: '',
    hr_name: '',
    hr_email: '',
    hr_phone: '',
    location: ''
  });

  const { registerStudent, registerCompany } = useAuth();
  const navigate = useNavigate();

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await registerStudent({
        ...studentForm,
        cgpa: parseFloat(studentForm.cgpa),
        semester: parseInt(studentForm.semester, 10),
        graduation_year: parseInt(studentForm.graduation_year, 10),
        active_backlogs: parseInt(studentForm.active_backlogs, 10),
        total_backlogs: parseInt(studentForm.total_backlogs, 10)
      });
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await registerCompany(companyForm);
      navigate('/company/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <BackgroundPaths opacity={0.35} />
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-foreground tracking-tight">Campus<span className="text-primary">Hire</span></span>
        </Link>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Create your account</h2>
        <p className="mt-1 text-sm text-muted-foreground">Register as a student or recruiting organization</p>

        {/* Role Toggle Selector */}
        <div className="mt-6 p-1 bg-secondary/80 rounded-lg flex max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => { setRole('student'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
              role === 'student' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Student Registration</span>
          </button>
          <button
            type="button"
            onClick={() => { setRole('company'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
              role === 'company' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Recruiter Portal</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-card py-8 px-6 sm:px-10 shadow-sm rounded-xl border border-border">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-xs text-destructive font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {/* Student Form */}
          {role === 'student' ? (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={studentForm.first_name}
                    onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    placeholder="Rahul"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={studentForm.last_name}
                    onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    placeholder="Kumar"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">College Email *</label>
                  <input
                    type="email"
                    required
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    placeholder="rahul.k@college.edu"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Roll / USN Number *</label>
                  <input
                    type="text"
                    required
                    value={studentForm.roll_number}
                    onChange={(e) => setStudentForm({ ...studentForm, roll_number: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    placeholder="2023CS0199"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Academic Branch *</label>
                  <select
                    value={studentForm.branch}
                    onChange={(e) => setStudentForm({ ...studentForm, branch: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none bg-card"
                  >
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="IT">Information Tech (IT)</option>
                    <option value="ECE">Electronics (ECE)</option>
                    <option value="EEE">Electrical (EEE)</option>
                    <option value="MECH">Mechanical (MECH)</option>
                    <option value="CIVIL">Civil Eng (CIVIL)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Semester *</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={studentForm.semester}
                    onChange={(e) => setStudentForm({ ...studentForm, semester: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">CGPA (0 - 10) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={studentForm.cgpa}
                    onChange={(e) => setStudentForm({ ...studentForm, cgpa: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    placeholder="8.50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Passout Year *</label>
                  <input
                    type="number"
                    required
                    value={studentForm.graduation_year}
                    onChange={(e) => setStudentForm({ ...studentForm, graduation_year: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Active Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    value={studentForm.active_backlogs}
                    onChange={(e) => setStudentForm({ ...studentForm, active_backlogs: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 px-4 rounded-lg text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting ? 'Creating Profile...' : 'Complete Student Registration'}
              </button>
            </form>
          ) : (
            /* Company Form */
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Company / Organization Name *</label>
                <input
                  type="text"
                  required
                  value={companyForm.company_name}
                  onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                  placeholder="Acme Technologies Inc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Account Work Email *</label>
                  <input
                    type="email"
                    required
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    placeholder="recruiter@acme.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={companyForm.password}
                    onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">HR Lead Name *</label>
                  <input
                    type="text"
                    required
                    value={companyForm.hr_name}
                    onChange={(e) => setCompanyForm({ ...companyForm, hr_name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    placeholder="Pooja Mehta"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">HR Official Email *</label>
                  <input
                    type="email"
                    required
                    value={companyForm.hr_email}
                    onChange={(e) => setCompanyForm({ ...companyForm, hr_email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    placeholder="hr@acme.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Industry Sector</label>
                  <input
                    type="text"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    placeholder="Fintech, SaaS, AI"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Office Location</label>
                  <input
                    type="text"
                    value={companyForm.location}
                    onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    placeholder="Bangalore / Hyderabad"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 px-4 rounded-lg text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting ? 'Submitting Application...' : 'Register Recruitment Partner'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
