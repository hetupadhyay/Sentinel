// frontend/src/pages/Register.jsx
// Sentinel — Enhanced registration with full name, confirm password, 2-col layout
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { label: '8+ chars',  pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Number',    pass: /\d/.test(password) },
  ];
  return (
    <div className="flex gap-3 mt-1.5">
      {checks.map(({ label, pass }) => (
        <div key={label} className="flex items-center gap-1">
          <CheckCircle2 size={10} className={pass ? 'text-risk-safe' : 'text-text-muted'}/>
          <span className={`text-[10px] ${pass ? 'text-risk-safe' : 'text-text-muted'}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function validate({ email, username, password, confirmPassword }) {
  const e = {};
  if (!email)                            e.email    = 'Email is required.';
  else if (!/\S+@\S+\.\S+/.test(email)) e.email    = 'Enter a valid email.';
  if (!username)                         e.username = 'Username is required.';
  else if (!/^[a-zA-Z0-9_]{3,64}$/.test(username))
    e.username = '3–64 chars, letters / numbers / underscores only.';
  if (!password)                         e.password = 'Password is required.';
  else if (password.length < 8)         e.password = 'Minimum 8 characters.';
  if (!confirmPassword)                  e.confirmPassword = 'Please confirm your password.';
  else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match.';
  return e;
}

export default function Register() {
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const [form,     setForm]     = useState({ fullName: '', email: '', username: '', password: '', confirmPassword: '' });
  const [errors,   setErrors]   = useState({});
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      await register(form.email, form.username, form.password, form.fullName);
      toast.success('Account created — please sign in.');
      navigate('/login');
    } catch (err) {
      setApiError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
           style={{ backgroundImage:`linear-gradient(var(--border) 1px,transparent 1px),
                                     linear-gradient(90deg,var(--border) 1px,transparent 1px)`,
                    backgroundSize:'40px 40px' }}/>
                    
      <div className="w-full max-w-md relative z-10 animate-in">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent-muted border border-accent/20">
            <ShieldAlert size={20} className="text-accent"/>
          </div>
          <div>
            <p className="text-base font-bold text-text-primary leading-none tracking-tight">SENTINEL</p>
            <p className="text-[10px] text-text-muted tracking-widest uppercase">Fraud Detection Engine</p>
          </div>
        </div>

        <Card className="p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-text-primary">
              Create account
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">Fill in your details to get started.</p>
          </div>

          {apiError && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-risk-critical/10 border border-risk-critical/20">
              <AlertCircle size={13} className="text-risk-critical shrink-0"/>
              <p className="text-xs text-risk-critical">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name + Username — side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Full Name</label>
                <Input type="text" placeholder="John Doe" value={form.fullName}
                       onChange={set('fullName')} autoComplete="name" disabled={isLoading}/>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Username</label>
                <Input type="text" placeholder="your_username" value={form.username}
                       error={errors.username} onChange={set('username')} autoComplete="username" disabled={isLoading}/>
              </div>
            </div>

            {/* Email — full width */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Email address</label>
              <Input type="email" placeholder="you@example.com" value={form.email}
                     error={errors.email} onChange={set('email')} autoComplete="email" disabled={isLoading}/>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <Input type={showPass ? 'text' : 'password'}
                       placeholder="••••••••" value={form.password}
                       error={errors.password} onChange={set('password')} autoComplete="new-password" disabled={isLoading}/>
                <button type="button" onClick={() => setShowPass((s) => !s)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted
                                   hover:text-text-secondary transition-colors h-9 flex items-center justify-center">
                  {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
              <PasswordStrength password={form.password}/>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Confirm Password</label>
              <Input type="password"
                     placeholder="Repeat password" value={form.confirmPassword}
                     error={errors.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" disabled={isLoading}/>
            </div>

            <Button type="submit" variant="primary" disabled={isLoading} className="w-full justify-center">
              {isLoading
                ? <><Loader2 size={14} className="animate-spin"/> Creating…</>
                : 'Create account'}
            </Button>
          </form>

          <p className="text-xs text-text-secondary text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
