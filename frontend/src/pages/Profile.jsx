// frontend/src/pages/Profile.jsx
// Sentinel — Rich profile page with sidebar + content layout
// Features: Editable personal info, password change, danger zone, stats sidebar

import { useEffect, useState, useCallback } from 'react';
import {
  User as UserIcon, Mail, Calendar, ShieldCheck, Activity, Loader2,
  Phone, Globe, Users, Save, Lock, Trash2, LogOut, Camera, AlertTriangle,
  CheckCircle2, XCircle, Eye, EyeOff,
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import client from '@/api/client';
import { formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// ── Password Strength Meter ──────────────────────────────────────────────────
function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { label: '8+ chars', pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
  ];
  return (
    <div className="flex gap-3 mt-1.5">
      {checks.map(({ label, pass }) => (
        <div key={label} className="flex items-center gap-1">
          {pass
            ? <CheckCircle2 size={10} className="text-risk-safe" />
            : <XCircle size={10} className="text-text-muted" />}
          <span className={`text-[10px] ${pass ? 'text-risk-safe' : 'text-text-muted'}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Delete Confirmation Modal ────────────────────────────────────────────────
function DeleteModal({ open, onClose, onConfirm, loading }) {
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-risk-critical/10 flex items-center justify-center">
            <AlertTriangle size={20} className="text-risk-critical" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-text-primary">Delete Account</h3>
            <p className="text-[11px] text-text-secondary">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-[12px] text-text-secondary mb-4 leading-relaxed">
          All your scan history, profile data, and settings will be permanently removed.
          Enter your password to confirm.
        </p>

        <div className="relative mb-4">
          <Input
            type={showPass ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPass(s => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
          >
            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <button
            onClick={() => onConfirm(password)}
            disabled={!password || loading}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-[12px] font-semibold
                       bg-risk-critical text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Profile Page ────────────────────────────────────────────────────────
export default function Profile() {
  const { user, updateProfile, changePassword, deleteAccount, logout } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Form state
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    country: '',
    gender: '',
  });

  // Password form
  const [pwForm, setPwForm] = useState({
    current: '',
    new_password: '',
    confirm: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Load stats and populate form
  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        country: user.country || '',
        gender: user.gender || '',
      });
    }
  }, [user]);

  useEffect(() => {
    client.get('/api/v1/profile/stats')
      .then(({ data }) => setStats(data))
      .catch(() => console.error('Failed to load profile stats'))
      .finally(() => setLoading(false));
  }, []);

  const handleFormChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    setChangingPw(true);
    try {
      await changePassword(pwForm.current, pwForm.new_password, pwForm.confirm);
      toast.success('Password changed successfully.');
      setPwForm({ current: '', new_password: '', confirm: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setChangingPw(false);
    }
  };

  const handleDeleteAccount = async (password) => {
    setDeletingAccount(true);
    try {
      await deleteAccount(password);
      toast.success('Account deleted.');
      window.location.href = '/login';
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (!user) return null;

  const securityLevel = stats?.security_level || 'Unknown';
  const securityColor = securityLevel === 'High' ? 'text-risk-safe' : securityLevel === 'Medium' ? 'text-risk-medium' : 'text-text-muted';

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6 animate-in">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ═══════════════════════════════════════════════════════════════════
            LEFT SIDEBAR — Avatar, quick stats, account status, sign out
            ═══════════════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">

          {/* Avatar Card */}
          <div className="profile-section p-6 flex flex-col items-center text-center animate-fade-up stagger-1">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full avatar-gradient flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white uppercase font-mono">
                  {user.username?.[0] || '?'}
                </span>
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-background-elevated border border-background-border flex items-center justify-center hover:bg-background-hover transition-colors"
                      title="Change avatar">
                <Camera size={12} className="text-text-muted" />
              </button>
            </div>

            <h2 className="text-[16px] font-bold text-text-primary tracking-tight">
              {user.full_name || user.username}
            </h2>
            <p className="text-[12px] text-text-muted mt-0.5">@{user.username}</p>

            {/* Quick stat pills */}
            <div className="grid grid-cols-2 gap-2 w-full mt-4">
              <div className="stat-pill">
                <span className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Scans</span>
                <span className="text-[16px] font-bold text-accent">{stats?.total_scans ?? '—'}</span>
              </div>
              <div className="stat-pill">
                <span className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Threats</span>
                <span className="text-[16px] font-bold text-risk-high">{stats?.threats_detected ?? '—'}</span>
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full mt-4 py-2.5 rounded-lg border border-background-border text-[12px] font-medium text-text-secondary hover:text-risk-critical hover:border-risk-critical/30 hover:bg-risk-critical/5 transition-all"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>

          {/* Account Status Card */}
          <div className="profile-section p-4 space-y-3 animate-fade-up stagger-2">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={14} className="text-accent" />
              <span className="text-[12px] font-semibold text-text-primary">Account Status</span>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-text-secondary">Member Since</span>
                <span className="text-[12px] font-medium text-text-primary">
                  {user.created_at ? formatDate(user.created_at) : 'Recently'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-text-secondary">Security Level</span>
                <span className={`text-[12px] font-semibold ${securityColor}`}>
                  {loading ? '...' : securityLevel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-text-secondary">Scans (7d)</span>
                <span className="text-[12px] font-medium text-text-primary">
                  {loading ? '...' : stats?.scans_last_7d ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-text-secondary">Detection Rate</span>
                <span className="text-[12px] font-medium text-text-primary">
                  {loading ? '...' : `${stats?.threat_detection_rate ?? 0}%`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            RIGHT CONTENT — Personal info, password change, danger zone
            ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 space-y-5">

          {/* Personal Information */}
          <div className="profile-section p-5 animate-fade-up stagger-2">
            <h3 className="text-[15px] font-bold text-text-primary tracking-tight mb-4 flex items-center gap-2">
              <UserIcon size={16} className="text-accent" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary">
                  <UserIcon size={12} /> Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Your full name"
                  value={form.full_name}
                  onChange={handleFormChange('full_name')}
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary">
                  <Mail size={12} /> Email
                </label>
                <Input
                  type="email"
                  value={user.email}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary">
                  <Phone size={12} /> Phone
                </label>
                <Input
                  type="tel"
                  placeholder="+1 234 567 890"
                  value={form.phone}
                  onChange={handleFormChange('phone')}
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary">
                  <Globe size={12} /> Country
                </label>
                <Input
                  type="text"
                  placeholder="e.g. United States"
                  value={form.country}
                  onChange={handleFormChange('country')}
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary">
                  <Calendar size={12} /> Username
                </label>
                <Input
                  type="text"
                  value={user.username}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary">
                  <Users size={12} /> Gender
                </label>
                <select
                  value={form.gender}
                  onChange={handleFormChange('gender')}
                  className="input-base h-9 appearance-none cursor-pointer"
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-5 pt-4 border-t border-background-border">
              <Button
                variant="primary"
                onClick={handleSaveProfile}
                disabled={saving}
                className="min-w-[140px] interactive-scale"
              >
                {saving
                  ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                  : <><Save size={14} /> Save Changes</>}
              </Button>
            </div>
          </div>

          {/* Change Password */}
          <div className="profile-section p-5 animate-fade-up stagger-3">
            <h3 className="text-[15px] font-bold text-text-primary tracking-tight mb-1 flex items-center gap-2">
              <Lock size={16} className="text-accent" /> Change Password
            </h3>
            <p className="text-[11px] text-text-muted mb-4">Leave blank if you don't want to change your password.</p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-text-secondary">Current Password</label>
                <div className="relative">
                  <Input
                    type={showCurrentPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={pwForm.current}
                    onChange={(e) => setPwForm(f => ({ ...f, current: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(s => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-text-secondary">New Password</label>
                  <div className="relative">
                    <Input
                      type={showNewPw ? 'text' : 'password'}
                      placeholder="Min 8 characters"
                      value={pwForm.new_password}
                      onChange={(e) => setPwForm(f => ({ ...f, new_password: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(s => !s)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                    >
                      {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <PasswordStrength password={pwForm.new_password} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-text-secondary">Confirm New Password</label>
                  <Input
                    type="password"
                    placeholder="Repeat new password"
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                  />
                  {pwForm.confirm && pwForm.new_password !== pwForm.confirm && (
                    <p className="text-[10px] text-risk-critical flex items-center gap-1 mt-1">
                      <XCircle size={10} /> Passwords do not match
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  onClick={handleChangePassword}
                  disabled={changingPw || !pwForm.current || !pwForm.new_password || !pwForm.confirm}
                  className="min-w-[160px] interactive-scale"
                >
                  {changingPw
                    ? <><Loader2 size={14} className="animate-spin" /> Changing…</>
                    : <><Lock size={14} /> Update Password</>}
                </Button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="danger-zone p-5 animate-fade-up stagger-4">
            <h3 className="text-[15px] font-bold text-risk-critical tracking-tight mb-1 flex items-center gap-2">
              <AlertTriangle size={16} /> Danger Zone
            </h3>
            <p className="text-[12px] text-text-secondary mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-[12px] font-semibold
                         border border-risk-critical/30 text-risk-critical
                         hover:bg-risk-critical hover:text-white transition-all"
            >
              <Trash2 size={14} /> Delete My Account
            </button>
          </div>

        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        loading={deletingAccount}
      />
    </div>
  );
}
