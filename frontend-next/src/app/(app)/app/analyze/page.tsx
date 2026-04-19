"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ScanSearch, 
  Globe, 
  Mail, 
  FileText, 
  UserCircle,
  Loader2,
  AlertCircle,
  Zap,
  ShieldCheck,
  Cpu,
  Image as ImageIcon,
  X,
  Upload
} from 'lucide-react';
import client from '@/store/authStore';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

const scanTypes = [
  { id: 'job_posting', label: 'Job Posting', icon: FileText, desc: 'Analyze job descriptions for scam signals.' },
  { id: 'url', label: 'URL / Link', icon: Globe, desc: 'Scan URLs for phishing or malicious intent.' },
  { id: 'message', label: 'Message', icon: Mail, desc: 'Detect fraud in emails or private messages.' },
  { id: 'impersonation', label: 'Impersonation', icon: UserCircle, desc: 'Check for spoofed identities or entities.' },
];

export default function AnalyzePage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState('job_posting');
  
  // Generic Inputs
  const [inputText, setInputText] = useState('');
  
  // Job Posting Specific Inputs
  const [jobDetails, setJobDetails] = useState({ email: '', company: '', title: '', salary: '', info: '' });
  
  // Impersonation Specific Inputs
  const [images, setImages] = useState<{ suspect: string | null; reference: string | null }>({ suspect: null, reference: null });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJobDetail = (key: string, val: string) => {
    setJobDetails((p) => ({ ...p, [key]: val }));
    if (error) setError(null);
  };

  const handleImageUpload = (type: 'suspect' | 'reference', file: File | null) => {
    if (file && !file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    setError(null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setImages(prev => ({ ...prev, [type]: null }));
    }
  };

  const handleAnalyze = async () => {
    let finalPayload: any = { scan_type: selectedType };
    let previewText = inputText;

    if (selectedType === 'job_posting') {
      const hasDetails = Object.values(jobDetails).some(v => v.trim());
      if (!hasDetails && !inputText.trim()) {
        setError('Please fill in at least one job detail or provide a description.');
        return;
      }
      let concatenated = '';
      if (jobDetails.company) concatenated += `Company: ${jobDetails.company}\n`;
      if (jobDetails.title)   concatenated += `Job Title: ${jobDetails.title}\n`;
      if (jobDetails.email)   concatenated += `Contact Email: ${jobDetails.email}\n`;
      if (jobDetails.salary)  concatenated += `Salary Info: ${jobDetails.salary}\n`;
      if (jobDetails.info)    concatenated += `Additional Details: ${jobDetails.info}\n`;
      if (inputText.trim())   concatenated += `\nFull Description:\n${inputText.trim()}`;
      
      finalPayload.input_text = concatenated.trim();
      previewText = finalPayload.input_text;
    } else if (selectedType === 'impersonation') {
      if (!images.suspect) {
        setError('Please upload a Suspect Image to analyze.');
        return;
      }
      finalPayload.image1_base64 = images.suspect;
      if (images.reference) finalPayload.image2_base64 = images.reference;
      finalPayload.input_text = "Image Analysis";
      previewText = "Image Analysis";
    } else if (selectedType === 'url') {
      if (!inputText.trim()) { setError('URL cannot be empty.'); return; }
      finalPayload.input_url = inputText.trim();
      finalPayload.input_text = "URL Scan: " + inputText.trim();
    } else {
      if (!inputText.trim()) { setError('Input cannot be empty.'); return; }
      if (inputText.length < 20) {
        setError('Input too short for meaningful analysis (minimum 20 characters).');
        return;
      }
      finalPayload.input_text = inputText.trim();
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const { data } = await client.post('/api/v1/analyze', {
        scan_type: finalPayload.scan_type,
        text: finalPayload.input_text,
        url: finalPayload.input_url,
        image1_base64: finalPayload.image1_base64,
        image2_base64: finalPayload.image2_base64
      });
      const scanId = data.id || data.scan_id;
      if (!scanId) {
        throw new Error('Analysis completed but no scan ID was returned.');
      }
      toast.success('Analysis complete.');
      router.push(`/app/results/${scanId}`);
    } catch (err: any) {
      let msg = 'Analysis failed. Please try again.';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        msg = typeof detail === 'string' ? detail : JSON.stringify(detail);
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 space-y-12 animate-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-8 animate-fade-up">
        <div className="space-y-2">
          <Badge variant="outline" className="text-accent border-accent/20 bg-accent/5 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">Engine v4.2</Badge>
          <h1 className="text-4xl font-bold text-text-primary tracking-tight">Analyze Content</h1>
          <p className="text-[14px] text-text-secondary font-medium">Multi-signal fraud detection with real-time neural intelligence.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {scanTypes.map((type, i) => (
          <button
            key={type.id}
            onClick={() => {
              setSelectedType(type.id);
              setError(null);
            }}
            className={cn(
              "flex flex-col items-start p-5 rounded-xl border transition-all duration-300 text-left space-y-3 relative overflow-hidden group",
              selectedType === type.id 
                ? "bg-accent/[0.03] border-accent/40 shadow-[0_0_20px_rgba(94,106,210,0.05)]" 
                : "bg-panel/50 border-border/40 hover:border-accent/20 hover:bg-hover"
            )}
          >
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300",
              selectedType === type.id ? "bg-accent text-white shadow-lg shadow-accent/10" : "bg-bg text-text-muted group-hover:text-text-secondary"
            )}>
              <type.icon size={18} />
            </div>
            <div className="space-y-0.5">
              <p className={cn(
                "text-[13px] font-bold transition-colors",
                selectedType === type.id ? "text-text-primary" : "text-text-secondary"
              )}>{type.label}</p>
              <p className="text-[10px] text-text-muted leading-tight font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                {type.desc}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="glass rounded-xl border border-border/40 shadow-xl overflow-hidden flex flex-col min-h-[420px]">
            <div className="px-6 py-3.5 border-b border-border/40 bg-bg/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-accent" />
                <p className="text-[11px] font-bold text-text-primary uppercase tracking-widest">
                  {scanTypes.find(t => t.id === selectedType)?.label} Input
                </p>
              </div>
            </div>
            
            <div className="flex-1 p-6 relative flex flex-col">
              {selectedType === 'job_posting' ? (
                <div className="space-y-6 flex-1 flex flex-col">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Company Name</label>
                      <Input placeholder="e.g. Google" value={jobDetails.company} onChange={(e) => handleJobDetail('company', e.target.value)} disabled={isAnalyzing} className="h-10 bg-bg/50 border-border/50 text-[13px]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Job Title</label>
                      <Input placeholder="e.g. Software Engineer" value={jobDetails.title} onChange={(e) => handleJobDetail('title', e.target.value)} disabled={isAnalyzing} className="h-10 bg-bg/50 border-border/50 text-[13px]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Recruiter Email</label>
                      <Input placeholder="e.g. jobs@company.com" value={jobDetails.email} onChange={(e) => handleJobDetail('email', e.target.value)} disabled={isAnalyzing} className="h-10 bg-bg/50 border-border/50 text-[13px]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Salary Range</label>
                      <Input placeholder="e.g. $120k - $150k" value={jobDetails.salary} onChange={(e) => handleJobDetail('salary', e.target.value)} disabled={isAnalyzing} className="h-10 bg-bg/50 border-border/50 text-[13px]" />
                    </div>
                  </div>
                  <div className="space-y-2 flex-1 flex flex-col">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Job Description</label>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste the full job description or additional details here..."
                      className="flex-1 w-full bg-bg/50 rounded-lg border border-border/50 p-4 text-[13.5px] text-text-primary placeholder:text-text-muted/40 outline-none resize-none leading-relaxed font-medium transition-all focus:border-accent/50"
                      disabled={isAnalyzing}
                    />
                  </div>
                </div>
              ) : selectedType === 'impersonation' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 h-full">
                  <div className="flex flex-col space-y-2">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Suspect Image (Required)</label>
                    <div className="flex-1 min-h-[240px] border-2 border-dashed border-border/50 rounded-xl relative overflow-hidden bg-bg/30 hover:bg-bg/50 transition-colors group flex items-center justify-center">
                      {images.suspect ? (
                        <>
                          <img src={images.suspect} alt="Suspect" className="w-full h-full object-contain p-2" />
                          <button onClick={() => handleImageUpload('suspect', null)} className="absolute top-3 right-3 p-1.5 bg-risk-critical/80 text-white rounded-md hover:bg-risk-critical transition-colors opacity-0 group-hover:opacity-100">
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-3 pointer-events-none">
                          <div className="w-12 h-12 rounded-full bg-panel flex items-center justify-center text-text-muted group-hover:text-accent transition-colors shadow-sm">
                            <Upload size={20} />
                          </div>
                          <p className="text-[13px] font-medium text-text-secondary">Click to upload suspect</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleImageUpload('suspect', e.target.files?.[0] || null)} disabled={isAnalyzing} />
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Genuine Reference (Optional)</label>
                    <div className="flex-1 min-h-[240px] border-2 border-dashed border-border/50 rounded-xl relative overflow-hidden bg-bg/30 hover:bg-bg/50 transition-colors group flex items-center justify-center">
                      {images.reference ? (
                        <>
                          <img src={images.reference} alt="Reference" className="w-full h-full object-contain p-2" />
                          <button onClick={() => handleImageUpload('reference', null)} className="absolute top-3 right-3 p-1.5 bg-risk-critical/80 text-white rounded-md hover:bg-risk-critical transition-colors opacity-0 group-hover:opacity-100">
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-3 pointer-events-none">
                          <div className="w-12 h-12 rounded-full bg-panel flex items-center justify-center text-text-muted group-hover:text-accent transition-colors shadow-sm">
                            <ImageIcon size={20} />
                          </div>
                          <p className="text-[13px] font-medium text-text-secondary">Click to upload reference</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleImageUpload('reference', e.target.files?.[0] || null)} disabled={isAnalyzing} />
                    </div>
                  </div>
                </div>
              ) : selectedType === 'url' ? (
                <div className="space-y-2 flex-1">
                  <Input 
                    type="url"
                    placeholder="e.g. https://suspicious-domain.com" 
                    value={inputText} 
                    onChange={(e) => setInputText(e.target.value)} 
                    disabled={isAnalyzing} 
                    className="h-12 bg-transparent border-0 border-b border-border/50 rounded-none focus:border-accent px-0 text-[16px] placeholder:text-text-muted/40 shadow-none focus-visible:ring-0" 
                  />
                </div>
              ) : (
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste the content here for neural analysis..."
                  className="flex-1 w-full bg-transparent text-[14.5px] text-text-primary placeholder:text-text-muted/30 outline-none resize-none leading-relaxed font-medium"
                  disabled={isAnalyzing}
                />
              )}

              <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-border/40">
                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-risk-critical/5 border border-risk-critical/10 text-risk-critical text-[11px] font-bold animate-in mr-auto">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}
                <Button 
                  variant="primary" 
                  onClick={handleAnalyze} 
                  isLoading={isAnalyzing}
                  className="h-10 px-7 bg-accent text-white font-bold rounded-lg hover:bg-accent-hover shadow-lg shadow-accent/10 transition-all active:scale-95"
                >
                  {isAnalyzing ? 'Analyzing Patterns...' : 'Run Analysis'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="p-6 rounded-xl border border-border/40 glass space-y-4">
            <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-accent" />
              Engine Intelligence
            </h4>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase tracking-tighter">
                  <span>Accuracy</span>
                  <span className="text-text-primary">99.4%</span>
                </div>
                <div className="h-1 w-full bg-border/20 rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-[99.4%]" />
                </div>
              </div>
              <p className="text-[12px] text-text-secondary leading-relaxed font-medium">
                Our neural engine performs sub-second classification using 42+ distinct fraud signals across multiple modules.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-border/40 bg-panel/30 space-y-3">
            <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={14} className="text-risk-safe" />
              Privacy Protocol
            </h4>
            <p className="text-[12px] text-text-secondary leading-relaxed font-medium">
              Data is encrypted in transit and analyzed in a sandboxed environment. Personally identifiable information is automatically redacted by our privacy filter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

