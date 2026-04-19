// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-[11px] text-risk-critical mt-1">
      <AlertCircle size={11}/> {msg}
    </p>
  );
}

function validate({ email, password }) {
  const e = {};
  if (!email)                          e.email    = 'Email is required.';
  else if (!/\S+@\S+\.\S+/.test(email)) e.email  = 'Enter a valid email.';
  if (!password)                       e.password = 'Password is required.';
  return e;
}

export default function Login() {
  const { login, isLoading }  = useAuthStore();
  const navigate              = useNavigate();
  const location              = useLocation();
  const from                  = location.state?.from?.pathname ?? '/app';

  const [form,     setForm]     = useState({ email: '', password: '' });
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
      await login(form.email, form.password);
      toast.success('Welcome back.');
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Subtle grid background using CSS variables */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
           style={{ backgroundImage:`linear-gradient(var(--border) 1px,transparent 1px),
                                     linear-gradient(90deg,var(--border) 1px,transparent 1px)`,
                    backgroundSize:'40px 40px' }}/>
      
      <div className="w-full max-w-sm relative z-10 animate-in">
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
              Sign in
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">Enter your credentials to access Sentinel.</p>
          </div>

          {apiError && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-risk-critical/10 border border-risk-critical/20">
              <AlertCircle size={13} className="text-risk-critical shrink-0"/>
              <p className="text-xs text-risk-critical">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Email address</label>
              <Input type="email" placeholder="you@example.com" value={form.email}
                     error={errors.email} onChange={set('email')} autoComplete="email" disabled={isLoading}/>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <Input type={showPass ? 'text' : 'password'}
                       placeholder="••••••••" value={form.password}
                       error={errors.password} onChange={set('password')} autoComplete="current-password" disabled={isLoading}/>
                <button type="button" onClick={() => setShowPass((s) => !s)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted
                                   hover:text-text-secondary transition-colors h-9 flex items-center justify-center">
                  {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" disabled={isLoading} className="w-full justify-center">
              {isLoading
                ? <><Loader2 size={14} className="animate-spin"/> Signing in…</>
                : 'Sign in'}
            </Button>
          </form>

          <p className="text-xs text-text-secondary text-center">
            No account?{' '}
            <Link to="/register" className="text-accent hover:underline">Create one</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
