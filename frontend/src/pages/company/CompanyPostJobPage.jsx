import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Briefcase,
  PlusCircle,
  Save,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle,
  Layers
} from 'lucide-react';

export default function CompanyPostJobPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    role_type: 'Full-time',
    package_lpa: '',
    location: '',
    deadline: '',
    description: '',
    min_cgpa: 7.00,
    max_active_backlogs: 0,
    graduation_year: 2026
  });

  const availableBranches = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];
  const [selectedBranches, setSelectedBranches] = useState(['CSE', 'IT', 'ECE']);

  const [rounds, setRounds] = useState([
    { round_number: 1, round_name: 'Online Coding Assessment', round_type: 'Online Test', description: 'Algorithmic DSA & Problem Solving' },
    { round_number: 2, round_name: 'Technical Interview', round_type: 'Technical', description: 'Core Data Structures, System Design, Live Coding' },
    { round_number: 3, round_name: 'HR & Cultural Alignment', round_type: 'HR', description: 'Behavioral and Leadership Fitment' }
  ]);

  const toggleBranch = (branch) => {
    if (selectedBranches.includes(branch)) {
      if (selectedBranches.length === 1) return; // keep at least 1
      setSelectedBranches(selectedBranches.filter(b => b !== branch));
    } else {
      setSelectedBranches([...selectedBranches, branch]);
    }
  };

  const handleAddRound = () => {
    const nextNum = rounds.length + 1;
    setRounds([
      ...rounds,
      { round_number: nextNum, round_name: `Round ${nextNum}: Technical`, round_type: 'Technical', description: 'Technical assessment' }
    ]);
  };

  const handleRemoveRound = (idx) => {
    if (rounds.length <= 1) return;
    const updated = rounds.filter((_, i) => i !== idx).map((r, i) => ({ ...r, round_number: i + 1 }));
    setRounds(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        package_lpa: parseFloat(formData.package_lpa),
        min_cgpa: parseFloat(formData.min_cgpa),
        max_active_backlogs: parseInt(formData.max_active_backlogs, 10),
        graduation_year: parseInt(formData.graduation_year, 10),
        allowed_branches: selectedBranches.join(','),
        rounds
      };

      const res = await api.post('/companies/jobs', payload);
      if (res.data.success) {
        navigate('/company/jobs');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to publish recruitment drive.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Publish Recruitment Drive</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Define role responsibilities, define strict DBMS eligibility cutoffs, and configure interview stages.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-xs font-semibold text-destructive flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Role Overview */}
        <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">1. Position & Compensation Details</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Software Development Engineer"
                className="w-full px-3.5 py-2.5 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Employment Type *</label>
              <select
                value={formData.role_type}
                onChange={(e) => setFormData({ ...formData, role_type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none bg-card"
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">CTC Package (in LPA) *</label>
              <input
                type="number"
                step="0.1"
                min="1"
                required
                value={formData.package_lpa}
                onChange={(e) => setFormData({ ...formData, package_lpa: e.target.value })}
                placeholder="e.g. 18.5"
                className="w-full px-3.5 py-2.5 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none font-bold text-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Job Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Bangalore, Hyderabad, Remote"
                className="w-full px-3.5 py-2.5 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Application Deadline *</label>
              <input
                type="datetime-local"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Job Role & Responsibilities Description *</label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the candidate responsibilities, day-to-day deliverables, and tech stack..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
        </div>

        {/* Step 2: Academic Eligibility Engine */}
        <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <h3 className="text-base font-bold text-foreground">2. Automated Eligibility Criteria</h3>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Minimum CGPA Cutoff</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                value={formData.min_cgpa}
                onChange={(e) => setFormData({ ...formData, min_cgpa: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Max Active Backlogs Allowed</label>
              <input
                type="number"
                min="0"
                max="5"
                required
                value={formData.max_active_backlogs}
                onChange={(e) => setFormData({ ...formData, max_active_backlogs: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Target Graduation Batch</label>
              <input
                type="number"
                required
                value={formData.graduation_year}
                onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">Allowed Engineering Branches</label>
            <div className="flex flex-wrap gap-2">
              {availableBranches.map((branch) => {
                const isChecked = selectedBranches.includes(branch);
                return (
                  <button
                    key={branch}
                    type="button"
                    onClick={() => toggleBranch(branch)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                      isChecked
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-background text-muted-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {branch}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 3: Recruitment Rounds */}
        <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">3. Recruitment Interview Rounds</h3>
            </div>
            <button
              type="button"
              onClick={handleAddRound}
              className="px-3 py-1.5 rounded-lg bg-muted hover:bg-secondary text-foreground text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Stage</span>
            </button>
          </div>

          <div className="space-y-3">
            {rounds.map((round, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-background border border-border flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-card text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {round.round_number}
                </span>

                <div className="flex-1 grid sm:grid-cols-3 gap-2 w-full">
                  <input
                    type="text"
                    required
                    value={round.round_name}
                    onChange={(e) => {
                      const updated = [...rounds];
                      updated[idx].round_name = e.target.value;
                      setRounds(updated);
                    }}
                    placeholder="Round Name (e.g. Technical Round 1)"
                    className="px-3 py-1.5 rounded-lg border border-border text-xs bg-card focus:outline-none focus:ring-1 focus:ring-ring"
                  />

                  <select
                    value={round.round_type}
                    onChange={(e) => {
                      const updated = [...rounds];
                      updated[idx].round_type = e.target.value;
                      setRounds(updated);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs bg-card focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="Online Test">Online Test / Assessment</option>
                    <option value="Technical">Technical Interview</option>
                    <option value="HR">HR Interview</option>
                    <option value="Group Discussion">Group Discussion</option>
                    <option value="Other">Other Evaluation</option>
                  </select>

                  <input
                    type="text"
                    value={round.description}
                    onChange={(e) => {
                      const updated = [...rounds];
                      updated[idx].description = e.target.value;
                      setRounds(updated);
                    }}
                    placeholder="Brief description"
                    className="px-3 py-1.5 rounded-lg border border-border text-xs bg-card focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {rounds.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRound(idx)}
                    className="text-muted-foreground hover:text-destructive p-1"
                    title="Remove round"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="py-3 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Publishing Drive...' : 'Publish Campus Recruitment Drive'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
