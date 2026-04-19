"use client";

import React from 'react';
import { User, Mail, Shield, ShieldCheck, MapPin, Camera } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12 animate-in">
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
           <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-panel border border-border flex items-center justify-center text-accent overflow-hidden">
                 {user?.username?.[0].toUpperCase() || <User size={48} />}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-accent text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                 <Camera size={16} />
              </button>
           </div>

           <div className="space-y-4 flex-1">
              <div className="space-y-1">
                 <h1 className="text-3xl font-bold text-text-primary tracking-tight">{user?.username || 'User Profile'}</h1>
                 <p className="text-text-muted font-medium">Manage your personal information and preferences.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                 <Badge variant="outline" className="bg-accent/5 border-accent/20 text-accent font-bold uppercase tracking-widest text-[9px]">Pro Plan</Badge>
                 <Badge variant="outline" className="bg-risk-safe/5 border-risk-safe/20 text-risk-safe font-bold uppercase tracking-widest text-[9px]">Verified Account</Badge>
              </div>
           </div>

           <Button variant="ghost" className="border border-border/60 hover:bg-hover h-10 px-6 font-bold text-[13px]">Edit Profile</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-6 rounded-2xl border border-border/40 glass space-y-6">
              <h3 className="text-[11px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                 <Shield size={14} className="text-accent" />
                 Account Details
              </h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center py-2 border-b border-border/20">
                    <span className="text-[13px] text-text-secondary font-medium">Username</span>
                    <span className="text-[13px] text-text-primary font-bold">{user?.username}</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-border/20">
                    <span className="text-[13px] text-text-secondary font-medium">Email Address</span>
                    <span className="text-[13px] text-text-primary font-bold">{user?.email}</span>
                 </div>
                 <div className="flex justify-between items-center py-2">
                    <span className="text-[13px] text-text-secondary font-medium">Member Since</span>
                    <span className="text-[13px] text-text-primary font-bold">April 2026</span>
                 </div>
              </div>
           </div>

           <div className="p-6 rounded-2xl border border-border/40 glass space-y-6">
              <h3 className="text-[11px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                 <ShieldCheck size={14} className="text-risk-safe" />
                 Security
              </h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center py-2 border-b border-border/20">
                    <span className="text-[13px] text-text-secondary font-medium">Two-Factor Auth</span>
                    <Badge variant="outline" className="text-risk-safe border-risk-safe/20">Enabled</Badge>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-border/20">
                    <span className="text-[13px] text-text-secondary font-medium">Active Sessions</span>
                    <span className="text-[13px] text-text-primary font-bold">1 Active</span>
                 </div>
                 <div className="flex justify-between items-center py-2">
                    <span className="text-[13px] text-text-secondary font-medium">Last Login</span>
                    <span className="text-[13px] text-text-primary font-bold">Just now</span>
                 </div>
              </div>
           </div>

           <div className="p-6 rounded-2xl border border-border/40 glass space-y-6">
              <h3 className="text-[11px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                 <Globe size={14} className="text-accent" />
                 Preferences
              </h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center py-2 border-b border-border/20">
                    <span className="text-[13px] text-text-secondary font-medium">Language</span>
                    <span className="text-[13px] text-text-primary font-bold">English (US)</span>
                 </div>
                 <div className="flex justify-between items-center py-2">
                    <span className="text-[13px] text-text-secondary font-medium">Notifications</span>
                    <span className="text-[13px] text-text-primary font-bold">Enabled</span>
                 </div>
              </div>
           </div>

           <div className="p-6 rounded-2xl border border-border/40 glass space-y-6">
              <h3 className="text-[11px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                 <Key size={14} className="text-accent" />
                 API Access
              </h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center py-2 border-b border-border/20">
                    <span className="text-[13px] text-text-secondary font-medium">API Keys</span>
                    <span className="text-[13px] text-text-primary font-bold">2 Active</span>
                 </div>
                 <div className="flex justify-between items-center py-2">
                    <span className="text-[13px] text-text-secondary font-medium">Webhook URL</span>
                    <span className="text-[13px] text-text-primary font-bold">Not Configured</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
