// frontend/src/pages/Settings.jsx
import { useState } from 'react';
import { Settings as SettingsIcon, Shield, Key, Copy, Check, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useThemeStore from '@/store/themeStore';

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-background-border last:border-0">
      <div>
        <p className="text-[13px] font-medium text-text-primary">{label}</p>
        <p className="text-[11px] text-text-secondary">{description}</p>
      </div>
      <button 
        onClick={() => {
          onChange(!checked);
          toast.success(`${label} ${!checked ? 'enabled' : 'disabled'}`);
        }}
        className={`relative inline-flex h-[20px] w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-1 focus-visible:ring-accent ${checked ? 'bg-accent' : 'bg-background-border'}`}
      >
        <span className={`pointer-events-none inline-block h-[14px] w-[14px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const { theme, toggleTheme } = useThemeStore();
  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Production Application', key: 'sk_live_...e92f', created: '2023-11-15' }
  ]);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCreateKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: `New Key ${apiKeys.length + 1}`,
      key: `sk_live_${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toISOString().split('T')[0]
    };
    setApiKeys([...apiKeys, newKey]);
    toast.success('New API Key generated successfully');
  };

  const handleDeleteKey = (id) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
    toast.success('API Key revoked');
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary tracking-tight mb-1">
          Settings
        </h1>
        <p className="text-[13px] text-text-secondary">Manage your account preferences and API access.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-56 shrink-0 space-y-0.5">
          {[
            { id: 'general', label: 'General', icon: SettingsIcon },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'apikeys', label: 'API Keys', icon: Key },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-[13px] rounded-md transition-colors ${
                activeTab === tab.id 
                  ? 'bg-background-elevated text-text-primary font-medium border border-background-border' 
                  : 'text-text-secondary hover:bg-background-hover hover:text-text-primary border border-transparent'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 card p-5 min-h-[400px]">
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in">
              <div>
                <h2 className="text-[15px] font-semibold text-text-primary mb-3 tracking-tight">General Preferences</h2>
                <div className="space-y-1">
                  <Toggle label="Dark Mode" description="Use dark theme across the application" checked={theme === 'dark'} onChange={toggleTheme} />
                  <Toggle label="Email Notifications" description="Receive daily summaries of scanned threats" checked={false} onChange={() => {}} />
                  <Toggle label="Compact View" description="Show denser tables in History view" checked={true} onChange={() => {}} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in">
              <div>
                <h2 className="text-[15px] font-semibold text-text-primary mb-3 tracking-tight">Security Settings</h2>
                <div className="space-y-1">
                  <Toggle label="Two-Factor Authentication" description="Require a security key or app to log in" checked={false} onChange={() => {}} />
                  <Toggle label="Session Timeout" description="Automatically log out after 30 minutes of inactivity" checked={true} onChange={() => {}} />
                </div>
                <div className="mt-8 pt-5 border-t border-background-border">
                  <h3 className="text-[13px] font-medium text-text-primary mb-2">Change Password</h3>
                  <button className="btn-secondary text-[11px] h-8" onClick={() => toast('Password reset link sent to your email.')}>
                    Send Reset Link
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apikeys' && (
            <div className="space-y-6 animate-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[15px] font-semibold text-text-primary tracking-tight">API Keys</h2>
                  <p className="text-[11px] text-text-secondary mt-0.5">Manage API keys for programmatic access to Sentinel.</p>
                </div>
                <button onClick={handleCreateKey} className="btn-primary text-[11px] h-8">
                  <Plus size={14} /> Create Key
                </button>
              </div>

              {apiKeys.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-background-border rounded-lg bg-background-surface">
                  <Key size={20} className="mx-auto text-text-muted mb-2" />
                  <p className="text-[12px] text-text-secondary">No API keys generated yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {apiKeys.map((k) => (
                    <div key={k.id} className="flex items-center justify-between p-3 bg-background-elevated border border-background-border rounded-md hover:border-text-muted transition-colors">
                      <div>
                        <p className="text-[13px] font-medium text-text-primary">{k.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-[11px] text-accent bg-accent-muted px-1.5 py-0.5 rounded font-mono border border-accent/10">
                            {k.key}
                          </code>
                          <button onClick={() => copyToClipboard(k.key, k.id)} className="text-text-muted hover:text-text-primary transition-colors">
                            {copiedKey === k.id ? <Check size={12} className="text-risk-safe" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <p className="text-[10px] text-text-muted mt-1.5">Created on {k.created}</p>
                      </div>
                      <button onClick={() => handleDeleteKey(k.id)} className="p-1.5 text-text-muted hover:text-risk-critical hover:bg-risk-critical/10 rounded transition-colors" title="Revoke Key">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
