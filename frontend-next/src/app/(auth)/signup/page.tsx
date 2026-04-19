"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SignupPage() {
  const { register: signup, isLoading } = useAuthStore();
  const router = useRouter();

  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
    setApiError('');
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.username) errs.username = 'Username is required.';
    else if (form.username.length < 3) errs.username = 'Username must be at least 3 chars.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 chars.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      await signup(form.email, form.username, form.password);
      toast.success('Account created. Please sign in.');
      router.push('/login');
    } catch (err: any) {
      setApiError(err.message);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2.5 mb-8 justify-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent-muted border border-accent/20">
          <ShieldAlert size={20} className="text-accent"/>
        </div>
        <div>
          <p className="text-base font-bold text-text-primary leading-none tracking-tight">SENTINEL</p>
          <p className="text-[10px] text-text-muted tracking-widest uppercase">Fraud Detection Engine</p>
        </div>
      </div>

      <div className="bg-panel border border-border rounded-lg p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-text-primary">Create account</h2>
          <p className="text-xs text-text-secondary mt-0.5">Start your 14-day free trial today.</p>
        </div>

        {apiError && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-risk-critical/10 border border-risk-critical/20">
            <AlertCircle size={13} className="text-risk-critical shrink-0"/>
            <p className="text-xs text-risk-critical">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Username</label>
            <Input 
              type="text" 
              placeholder="johndoe" 
              value={form.username}
              error={errors.username}
              onChange={handleChange('username')}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Email address</label>
            <Input 
              type="email" 
              placeholder="you@example.com" 
              value={form.email}
              error={errors.email}
              onChange={handleChange('email')}
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Password</label>
            <div className="relative">
              <Input 
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••" 
                value={form.password}
                error={errors.password}
                onChange={handleChange('password')}
                disabled={isLoading}
              />
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors h-9 flex items-center justify-center"
              >
                {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
            <div className="flex gap-3 mt-1.5">
              <div className="flex items-center gap-1">
                <CheckCircle2 size={10} className={form.password.length >= 8 ? 'text-risk-safe' : 'text-text-muted'}/>
                <span className="text-[10px] text-text-muted">8+ chars</span>
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
            Create account
          </Button>
        </form>

        <p className="text-xs text-text-secondary text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </>
  );
}
