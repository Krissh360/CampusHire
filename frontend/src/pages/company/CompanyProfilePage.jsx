import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building2, Save, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/companies/profile');
        if (res.data.success) {
          setProfile(res.data.company);
        }
      } catch (err) {
        console.error('Error fetching company profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await api.put('/companies/profile', profile);
      if (res.data.success) {
        setMessage({ text: 'Company profile updated successfully.', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Recruiting Partner Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your organizational branding, HR contact point, and official corporate details.
        </p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg text-xs font-semibold ${
          message.type === 'success' ? 'bg-accent text-primary border border-border' : 'bg-destructive/10 text-destructive border border-destructive/30'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-base font-bold text-foreground">{profile?.company_name}</h2>
              <p className="text-xs text-muted-foreground">Account login: {profile?.email}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
            profile?.is_verified ? 'bg-accent text-primary border-border' : 'bg-chart-3/10 text-chart-3 border-chart-3/30'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            {profile?.is_verified ? 'Verified Employer' : 'Pending Verification'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Company Name</label>
              <input
                type="text"
                required
                value={profile?.company_name || ''}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Industry Sector</label>
              <input
                type="text"
                value={profile?.industry || ''}
                onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Company Website</label>
              <input
                type="url"
                value={profile?.website || ''}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                placeholder="https://company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Office Location</label>
              <input
                type="text"
                value={profile?.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                placeholder="Bangalore, Karnataka"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">HR Lead Name</label>
              <input
                type="text"
                value={profile?.hr_name || ''}
                onChange={(e) => setProfile({ ...profile, hr_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">HR Official Email</label>
              <input
                type="email"
                value={profile?.hr_email || ''}
                onChange={(e) => setProfile({ ...profile, hr_email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">HR Contact Phone</label>
              <input
                type="tel"
                value={profile?.hr_phone || ''}
                onChange={(e) => setProfile({ ...profile, hr_phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Company Description</label>
            <textarea
              rows={3}
              value={profile?.description || ''}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
