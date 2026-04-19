"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const [form, setForm] = useState({ email: '', password: '' });
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
    if (!form.password) errs.password = 'Password is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      await login(form.email, form.password);
      toast.success('Welcome back to Sentinel.');
      router.push('/app/dashboard');
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
          <h2 className="text-base font-bold text-text-primary">Sign in</h2>
          <p className="text-xs text-text-secondary mt-0.5">Enter your credentials to access Sentinel.</p>
        </div>

        {apiError && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-risk-critical/10 border border-risk-critical/20">
            <AlertCircle size={13} className="text-risk-critical shrink-0"/>
            <p className="text-xs text-risk-critical">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                autoComplete="current-password"
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
          </div>

          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
            Sign in
          </Button>
        </form>

        <p className="text-xs text-text-secondary text-center">
          New to Sentinel?{' '}
          <Link href="/signup" className="text-accent hover:underline">Create account</Link>
        </p>
      </div>
    </>
  );
}
