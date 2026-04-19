"use client";

import React, { useState } from 'react';
import { Key, Copy, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

export default function ApiKeysPage() {
  const [showKey, setShowKey] = useState(false);
  const dummyKey = "sk_live_51P2...9xZ";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(dummyKey);
    toast.success("API Key copied to clipboard");
  };

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12 animate-in">
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
           <div className="space-y-1">
              <h1 className="text-3xl font-bold text-text-primary tracking-tight">API Keys</h1>
              <p className="text-text-muted font-medium">Use these keys to authenticate your requests to the Sentinel API.</p>
           </div>
           <Button variant="primary" className="bg-accent text-white font-bold h-10 px-6 rounded-lg flex items-center gap-2">
              <Plus size={16} /> Create New Key
           </Button>
        </div>

        <div className="p-8 rounded-2xl border border-border/40 glass space-y-8">
           <div className="overflow-x-auto">
              <table className="w-full">
                 <thead>
                    <tr className="border-b border-border/20 text-left">
                       <th className="pb-4 text-[11px] font-bold text-text-muted uppercase tracking-widest">Name</th>
                       <th className="pb-4 text-[11px] font-bold text-text-muted uppercase tracking-widest">Key</th>
                       <th className="pb-4 text-[11px] font-bold text-text-muted uppercase tracking-widest">Last Used</th>
                       <th className="pb-4 text-[11px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody>
                    <tr className="group">
                       <td className="py-6">
                          <p className="text-[14px] font-bold text-text-primary">Production Engine</p>
                          <p className="text-[12px] text-text-muted">Created Apr 2026</p>
                       </td>
                       <td className="py-6">
                          <div className="flex items-center gap-3">
                             <code className="text-[13px] bg-bg/50 px-2 py-1 rounded border border-border/20 text-accent font-mono">
                                {showKey ? dummyKey : "••••••••••••••••"}
                             </code>
                             <button onClick={() => setShowKey(!showKey)} className="text-text-muted hover:text-text-primary transition-colors">
                                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                             </button>
                             <button onClick={copyToClipboard} className="text-text-muted hover:text-text-primary transition-colors">
                                <Copy size={14} />
                             </button>
                          </div>
                       </td>
                       <td className="py-6 text-[13px] text-text-secondary font-medium">
                          2 minutes ago
                       </td>
                       <td className="py-6 text-right">
                          <button className="text-text-muted hover:text-risk-critical transition-colors opacity-0 group-hover:opacity-100">
                             <Trash2 size={16} />
                          </button>
                       </td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>

        <div className="p-8 rounded-2xl border border-border/40 bg-panel/30 flex items-start gap-4">
           <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
              <Key size={20} />
           </div>
           <div className="space-y-1">
              <h4 className="text-[15px] font-bold text-text-primary">Keep your keys safe</h4>
              <p className="text-[13px] text-text-secondary leading-relaxed font-medium">
                 Your secret API keys are sensitive. Never share them or expose them in client-side code. We recommend using environment variables to store them securely on your server.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
