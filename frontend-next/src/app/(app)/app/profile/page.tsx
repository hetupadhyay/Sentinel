"use client";

import React, { useEffect, useState } from 'react';
import { User as UserIcon, Shield, Camera, Globe, Key, Mail, Phone, Users, Save, Lock, AlertTriangle, Loader2, CheckCircle2, XCircle, LogOut, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import client from '@/store/authStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

function PasswordStrength({ password }: { password?: string }) {
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
          {pass ? <CheckCircle2 size={10} className="text-risk-safe" /> : <XCircle size={10} className="text-text-muted" />}
          <span className={`text-[10px] ${pass ? 'text-risk-safe' : 'text-text-muted'}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateProfile, changePassword, deleteAccount, logout } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    country: '',
    gender: '',
  });

  const [pwForm, setPwForm] = useState({
    current: '',
    new_password: '',
    confirm: '',
  });

  const [deletePw, setDeletePw] = useState('');

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
      .finally(() => setLoadingStats(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated successfully.');
    } catch (err: any) {
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
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setChangingPw(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePw) return toast.error('Password required to delete account.');
    if (!confirm('Are you absolutely sure? This action cannot be undone.')) return;
    
    setDeleting(true);
    try {
      await deleteAccount(deletePw);
      toast.success('Account deleted.');
      window.location.href = '/login';
    } catch (err: any) {
      toast.error(err.message);
      setDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12">
      <div className="space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
           <div className="relative group shrink-0">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center text-accent overflow-hidden shadow-lg shadow-accent/5">
                 <span className="text-4xl font-mono font-bold uppercase">{user.username[0]}</span>
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-accent text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-95 duration-200">
                 <Camera size={16} />
              </button>
           </div>

           <div className="space-y-4 flex-1">
              <div className="space-y-1">
                 <h1 className="text-3xl font-bold text-text-primary tracking-tight">{user.full_name || user.username}</h1>
                 <p className="text-text-muted font-medium text-[13px]">@{user.username}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                 <Badge variant="outline" className="bg-accent/5 border-accent/20 text-accent font-bold uppercase tracking-widest text-[9px]">
                    {stats?.security_level ? `Security: ${stats.security_level}` : 'Loading...'}
                 </Badge>
                 <Badge variant="outline" className="bg-risk-safe/5 border-risk-safe/20 text-risk-safe font-bold uppercase tracking-widest text-[9px]">Active Account</Badge>
              </div>
           </div>

           <Button variant="ghost" onClick={logout} className="border border-border/60 hover:bg-risk-critical/10 hover:text-risk-critical h-10 px-6 font-bold text-[13px] transition-colors">
              <LogOut size={14} className="mr-2" /> Sign Out
           </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column - Stats */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-border/40 glass space-y-6 hover:border-border/80 transition-colors">
                <h3 className="text-[11px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                  <Shield size={14} className="text-accent" />
                  Account Details
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/20">
                      <span className="text-[13px] text-text-secondary font-medium">Username</span>
                      <span className="text-[13px] text-text-primary font-bold">{user.username}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/20">
                      <span className="text-[13px] text-text-secondary font-medium">Email Address</span>
                      <span className="text-[13px] text-text-primary font-bold truncate max-w-[120px]" title={user.email}>{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                      <span className="text-[13px] text-text-secondary font-medium">Total Scans</span>
                      <span className="text-[13px] text-accent font-bold">{loadingStats ? '...' : stats?.total_scans ?? 0}</span>
                  </div>
                </div>
            </div>
            
            <div className="p-6 rounded-2xl border border-border/40 glass space-y-6 hover:border-border/80 transition-colors">
                <h3 className="text-[11px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                  <Key size={14} className="text-accent" />
                  Threat Intelligence
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/20">
                      <span className="text-[13px] text-text-secondary font-medium">Threats Detected</span>
                      <span className="text-[13px] text-risk-high font-bold">{loadingStats ? '...' : stats?.threats_detected ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                      <span className="text-[13px] text-text-secondary font-medium">Detection Rate</span>
                      <span className="text-[13px] text-text-primary font-bold">{loadingStats ? '...' : `${stats?.threat_detection_rate ?? 0}%`}</span>
                  </div>
                </div>
            </div>
          </div>

          {/* Right Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Info */}
            <div className="p-6 rounded-2xl border border-border/40 glass space-y-6 hover:border-border/80 transition-colors">
              <h3 className="text-[13px] font-bold text-text-primary flex items-center gap-2 mb-4">
                <UserIcon size={16} className="text-accent" /> Personal Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-text-secondary">Full Name</label>
                  <input type="text" className="w-full h-10 px-3 rounded-lg border border-border/60 bg-bg text-[13px] focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                         value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-text-secondary">Phone Number</label>
                  <input type="tel" className="w-full h-10 px-3 rounded-lg border border-border/60 bg-bg text-[13px] focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                         value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+1 234 567 890" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-text-secondary">Country</label>
                  <input type="text" className="w-full h-10 px-3 rounded-lg border border-border/60 bg-bg text-[13px] focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                         value={form.country} onChange={e => setForm(f => ({...f, country: e.target.value}))} placeholder="United States" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-text-secondary">Gender</label>
                  <select className="w-full h-10 px-3 rounded-lg border border-border/60 bg-bg text-[13px] focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all appearance-none"
                          value={form.gender} onChange={e => setForm(f => ({...f, gender: e.target.value}))}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveProfile} disabled={saving} className="bg-accent hover:bg-accent-hover text-white min-w-[120px] transition-transform active:scale-95">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} className="mr-2" /> Save</>}
                </Button>
              </div>
            </div>

            {/* Change Password */}
            <div className="p-6 rounded-2xl border border-border/40 glass space-y-6 hover:border-border/80 transition-colors">
              <h3 className="text-[13px] font-bold text-text-primary flex items-center gap-2 mb-4">
                <Lock size={16} className="text-accent" /> Change Password
              </h3>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-text-secondary">Current Password</label>
                  <input type="password" className="w-full h-10 px-3 rounded-lg border border-border/60 bg-bg text-[13px] focus:border-accent outline-none transition-all"
                         value={pwForm.current} onChange={e => setPwForm(f => ({...f, current: e.target.value}))} placeholder="••••••••" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-text-secondary">New Password</label>
                    <input type="password" className="w-full h-10 px-3 rounded-lg border border-border/60 bg-bg text-[13px] focus:border-accent outline-none transition-all"
                           value={pwForm.new_password} onChange={e => setPwForm(f => ({...f, new_password: e.target.value}))} placeholder="Min 8 characters" />
                    <PasswordStrength password={pwForm.new_password} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-text-secondary">Confirm Password</label>
                    <input type="password" className="w-full h-10 px-3 rounded-lg border border-border/60 bg-bg text-[13px] focus:border-accent outline-none transition-all"
                           value={pwForm.confirm} onChange={e => setPwForm(f => ({...f, confirm: e.target.value}))} placeholder="Repeat new password" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button onClick={handleChangePassword} disabled={changingPw || !pwForm.current || !pwForm.new_password || !pwForm.confirm} 
                        className="bg-accent hover:bg-accent-hover text-white min-w-[160px] transition-transform active:scale-95">
                  {changingPw ? <Loader2 size={14} className="animate-spin" /> : <><Lock size={14} className="mr-2" /> Update Password</>}
                </Button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-6 rounded-2xl border border-risk-critical/30 bg-risk-critical/5 space-y-4">
              <h3 className="text-[13px] font-bold text-risk-critical flex items-center gap-2">
                <AlertTriangle size={16} /> Danger Zone
              </h3>
              <p className="text-[12px] text-text-secondary">
                Once you delete your account, there is no going back. All your scan history, custom rules, and personal information will be permanently removed from our servers.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <input type="password" placeholder="Confirm with password" value={deletePw} onChange={e => setDeletePw(e.target.value)}
                       className="w-full sm:w-64 h-10 px-3 rounded-lg border border-risk-critical/30 bg-bg text-[13px] focus:border-risk-critical outline-none transition-all" />
                <Button onClick={handleDeleteAccount} disabled={deleting || !deletePw} variant="ghost" 
                        className="w-full sm:w-auto bg-risk-critical hover:bg-red-600 text-white h-10 px-6 font-bold text-[12px] transition-transform active:scale-95">
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <><Trash2 size={14} className="mr-2" /> Delete Account</>}
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
