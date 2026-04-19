// frontend/src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import { User as UserIcon, Mail, Calendar, ShieldCheck, Activity, Loader2 } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import client from '@/api/client';
import { formatDate } from '@/utils/formatters';

export default function Profile() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/api/v1/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => console.error('Failed to load profile stats'))
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in">
      <div className="flex items-center gap-5 mb-6 bg-background-surface border border-background-border p-5 rounded-lg">
        <div className="w-16 h-16 rounded-full bg-background-elevated border border-background-border 
                        flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-accent uppercase font-mono">
            {user.username?.[0] || '?'}
          </span>
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-text-primary tracking-tight mb-1">
            {user.username}
          </h1>
          <p className="text-[13px] text-text-secondary flex items-center gap-2">
            <Mail size={14} /> {user.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Account Details */}
        <div className="card p-4 space-y-4">
          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest border-b border-background-border pb-2">
            Account Details
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-secondary text-[13px]">
                <UserIcon size={14} /> Username
              </div>
              <span className="text-text-primary text-[13px] font-medium">{user.username}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-secondary text-[13px]">
                <Mail size={14} /> Email Address
              </div>
              <span className="text-text-primary text-[13px] font-medium">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-secondary text-[13px]">
                <Calendar size={14} /> Member Since
              </div>
              <span className="text-text-primary text-[13px] font-medium">
                {user.created_at ? formatDate(user.created_at) : 'Recently'}
              </span>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="card p-4 space-y-4">
          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest border-b border-background-border pb-2">
            Activity Overview
          </p>
          {loading ? (
             <div className="flex justify-center py-6"><Loader2 className="animate-spin text-accent" /></div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-background-elevated rounded-md border border-background-border flex flex-col items-center justify-center text-center">
                <Activity size={18} className="text-accent mb-2" />
                <span className="text-xl font-bold text-text-primary">{stats?.total_scans || 0}</span>
                <span className="text-[11px] text-text-secondary mt-1">Total Scans</span>
              </div>
              <div className="p-3 bg-background-elevated rounded-md border border-background-border flex flex-col items-center justify-center text-center">
                <ShieldCheck size={18} className="text-risk-safe mb-2" />
                <span className="text-xl font-bold text-text-primary">{stats?.safe_count || 0}</span>
                <span className="text-[11px] text-text-secondary mt-1">Safe Scans</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
