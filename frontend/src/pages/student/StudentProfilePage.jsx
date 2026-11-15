import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  GraduationCap,
  FileText,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  Download
} from 'lucide-react';

export default function StudentProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skillsCatalog, setSkillsCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Add skill form state
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [skillProficiency, setSkillProficiency] = useState('Intermediate');

  const fetchProfileAndSkills = async () => {
    try {
      const [profRes, catalogRes] = await Promise.all([
        api.get('/students/profile'),
        api.get('/students/skills/catalog')
      ]);

      if (profRes.data.success) {
        setProfile(profRes.data.student);
      }
      if (catalogRes.data.success) {
        setSkillsCatalog(catalogRes.data.skills);
        if (catalogRes.data.skills.length > 0) {
          setSelectedSkillId(catalogRes.data.skills[0].skill_id);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndSkills();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await api.put('/students/profile', {
        phone: profile.phone,
        branch: profile.branch,
        semester: Number(profile.semester),
        cgpa: parseFloat(profile.cgpa),
        graduation_year: Number(profile.graduation_year),
        active_backlogs: Number(profile.active_backlogs),
        total_backlogs: Number(profile.total_backlogs)
      });

      if (res.data.success) {
        setMessage({ text: 'Academic profile updated successfully.', type: 'success' });
        await refreshProfile();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkillId) return;

    try {
      const res = await api.post('/students/skills', {
        skill_id: selectedSkillId,
        proficiency: skillProficiency
      });

      if (res.data.success) {
        await fetchProfileAndSkills();
      }
    } catch (err) {
      console.error('Error adding skill:', err);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      const res = await api.delete(`/students/skills/${skillId}`);
      if (res.data.success) {
        await fetchProfileAndSkills();
      }
    } catch (err) {
      console.error('Error removing skill:', err);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF format resume.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploadingResume(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await api.post('/students/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setMessage({ text: 'Resume uploaded successfully!', type: 'success' });
        await fetchProfileAndSkills();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to upload resume.', type: 'error' });
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic Profile & Credentials</h1>
        <p className="text-sm text-slate-500 mt-1">
          Maintain your verified CGPA, branch, technical skills catalog, and uploaded resume.
        </p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-xs font-semibold ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Academic Details Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Academic & Personal Details</h2>
              <p className="text-xs text-slate-400">Used by company algorithms to compute drive eligibility</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={`${profile?.first_name} ${profile?.last_name}`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Roll / USN Number</label>
                <input
                  type="text"
                  disabled
                  value={profile?.roll_number || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm font-mono cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Branch</label>
                <select
                  value={profile?.branch || 'CSE'}
                  onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="CSE">Computer Science & Engineering (CSE)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="ECE">Electronics & Communication (ECE)</option>
                  <option value="EEE">Electrical & Electronics (EEE)</option>
                  <option value="MECH">Mechanical Engineering (MECH)</option>
                  <option value="CIVIL">Civil Engineering (CIVIL)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Semester (1-8)</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={profile?.semester || 8}
                  onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CGPA (0 - 10)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={profile?.cgpa || ''}
                  onChange={(e) => setProfile({ ...profile, cgpa: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-blue-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Passout Year</label>
                <input
                  type="number"
                  value={profile?.graduation_year || 2026}
                  onChange={(e) => setProfile({ ...profile, graduation_year: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Active Backlogs</label>
                <input
                  type="number"
                  min="0"
                  value={profile?.active_backlogs ?? 0}
                  onChange={(e) => setProfile({ ...profile, active_backlogs: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Backlogs</label>
                <input
                  type="number"
                  min="0"
                  value={profile?.total_backlogs ?? 0}
                  onChange={(e) => setProfile({ ...profile, total_backlogs: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={profile?.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 rounded-xl bg-blue-600 text-white text-xs font-bold shadow hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Update Academic Profile'}</span>
            </button>
          </form>
        </div>

        {/* Sidebar: Resume & Skills */}
        <div className="space-y-6">
          {/* Resume Upload Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Official Resume (PDF)</h3>
            </div>

            {profile?.resume_url ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Uploaded Resume</span>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified PDF
                  </span>
                </div>
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Preview / Download Resume</span>
                </a>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mb-3">No resume uploaded. Recruiters evaluate candidate resumes during shortlisting.</p>
            )}

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {profile?.resume_url ? 'Replace Resume (PDF)' : 'Upload New Resume (PDF)'}
              </label>
              <input
                type="file"
                accept=".pdf"
                disabled={uploadingResume}
                onChange={handleResumeUpload}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {uploadingResume && <p className="text-xs text-blue-600 mt-2 font-medium">Uploading document...</p>}
            </div>
          </div>

          {/* Technical Skills Catalog */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Technical Skills</h3>
              <span className="text-xs text-slate-400 font-medium">{profile?.skills?.length || 0} Listed</span>
            </div>

            {/* Existing Skills List */}
            <div className="flex flex-wrap gap-2">
              {profile?.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill) => (
                  <span
                    key={skill.skill_id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    <span>{skill.skill_name}</span>
                    <span className="text-[10px] text-blue-600 font-bold">({skill.proficiency})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.skill_id)}
                      className="text-slate-400 hover:text-red-500 ml-0.5"
                      title="Remove skill"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-400">No skills added yet.</p>
              )}
            </div>

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="pt-3 border-t border-slate-100 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Skill from Catalog</label>
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  {skillsCatalog.map((sk) => (
                    <option key={sk.skill_id} value={sk.skill_id}>
                      {sk.skill_name} ({sk.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Proficiency Level</label>
                <select
                  value={skillProficiency}
                  onChange={(e) => setSkillProficiency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill to Profile</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
