// frontend/src/pages/Analyze.jsx
// Sentinel — Clean, minimal analysis input interface (no card-heavy design)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MessageSquare, Newspaper, Link2, ScanSearch, AlertCircle, Loader2, UserX } from 'lucide-react';
import client from '@/api/client';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const TABS = [
  { id: 'job_posting',   label: 'Job Posting',   icon: Briefcase,     placeholder: 'Paste the full job posting — title, description, salary, contact info…' },
  { id: 'message',       label: 'Message',       icon: MessageSquare, placeholder: 'Paste the suspicious message, email, or SMS — include headers if available…' },
  { id: 'impersonation', label: 'Impersonation', icon: UserX,         placeholder: 'Paste the suspected profile details, bio, or correspondence…' },
  { id: 'news',          label: 'News Article',  icon: Newspaper,     placeholder: 'Paste the full article text or headline to verify credibility…' },
  { id: 'url',           label: 'URL',           icon: Link2,         placeholder: 'https://suspicious-domain.com/path' },
];

const TIPS = {
  job_posting:   'Include the company name, salary, contact email, and any links for best results.',
  message:       'Paste raw message including From/Reply-To headers for higher accuracy.',
  impersonation: 'Upload a suspect image and an optional reference image to detect facial impersonation or celebrity spoofing.',
  news:          'Full article body gives more accurate results than headline only.',
  url:           'Enter the full URL with protocol (https://). Do not modify or shorten it.',
};

function CharCount({ value, max = 10000 }) {
  const pct = (value.length / max) * 100;
  return (
    <span className={`text-[11px] font-mono ${pct > 90 ? 'text-risk-critical' : pct > 70 ? 'text-risk-high' : 'text-text-muted'}`}>
      {value.length.toLocaleString()} / {max.toLocaleString()}
    </span>
  );
}

export default function Analyze() {
  const navigate = useNavigate();
  const [activeTab,    setActiveTab]    = useState('job_posting');
  const [inputs,       setInputs]       = useState({ job_posting: '', message: '', impersonation: '', news: '', url: '' });
  const [jobDetails,   setJobDetails]   = useState({ email: '', company: '', title: '', salary: '', info: '' });
  const [images,       setImages]       = useState({ suspect: null, reference: null });
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  const currentInput = inputs[activeTab] ?? '';

  const handleInput = (val) => {
    setInputs((p) => ({ ...p, [activeTab]: val }));
    if (error) setError(null);
  };

  const handleJobDetail = (key, val) => {
    setJobDetails((p) => ({ ...p, [key]: val }));
    if (error) setError(null);
  };

  const handleImageUpload = (type, file) => {
    if (file && !file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    setError(null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => ({ ...prev, [type]: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setImages(prev => ({ ...prev, [type]: null }));
    }
  };

  const handleSubmit = async () => {
    const val = currentInput.trim();
    let finalPayload = { scan_type: activeTab };

    if (activeTab === 'job_posting') {
      const hasDetails = Object.values(jobDetails).some(v => v.trim());
      if (!hasDetails && !val) {
        setError('Please fill in at least one job detail or use the text box below.');
        return;
      }
      let concatenated = '';
      if (jobDetails.company) concatenated += `Company: ${jobDetails.company}\n`;
      if (jobDetails.title)   concatenated += `Job Title: ${jobDetails.title}\n`;
      if (jobDetails.email)   concatenated += `Contact Email: ${jobDetails.email}\n`;
      if (jobDetails.salary)  concatenated += `Salary Info: ${jobDetails.salary}\n`;
      if (jobDetails.info)    concatenated += `Additional Details: ${jobDetails.info}\n`;
      if (val)                concatenated += `\nFull Description/Dump:\n${val}`;
      finalPayload.text = concatenated.trim();
    } else if (activeTab === 'impersonation') {
      if (!images.suspect) {
        setError('Please upload a Suspect Image to analyze.');
        return;
      }
      finalPayload.image1_base64 = images.suspect;
      if (images.reference) finalPayload.image2_base64 = images.reference;
    } else if (activeTab === 'url') {
      if (!val) { setError('URL cannot be empty.'); return; }
      finalPayload.url = val;
    } else {
      if (!val) { setError('Input cannot be empty.'); return; }
      if (val.length < 20) {
        setError('Input too short for meaningful analysis (minimum 20 characters).');
        return;
      }
      finalPayload.text = val;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.post('/api/v1/analyze', finalPayload);
      toast.success('Analysis complete.');
      navigate(`/app/results/${data.scan_id}`, { state: { result: data, inputText: activeTab === 'impersonation' ? 'Image Analysis' : (activeTab === 'job_posting' ? finalPayload.text : val) } });
    } catch (err) {
      const msg = err.response?.status === 429
        ? 'Rate limit reached. Wait a moment before retrying.'
        : err.response?.data?.detail || 'Analysis failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-6 py-8 animate-in">
      {/* Page header */}
      <div className="mb-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <h1 className="text-[16px] font-semibold text-text-primary tracking-tight">New Scan</h1>
        <p className="text-[13px] text-text-secondary mt-0.5">Select a scan type and provide the content to analyze.</p>
      </div>

      {/* Tab bar — horizontal pill toggles */}
      <div className="flex flex-wrap gap-1.5 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); setError(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors duration-100
              ${activeTab === id
                ? 'bg-accent-muted text-accent border border-accent/20'
                : 'text-text-secondary hover:text-text-primary hover:bg-background-hover border border-transparent'
              }`}
          >
            <Icon size={13} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-medium text-text-secondary">
              {TABS.find((t) => t.id === activeTab)?.label}
            </label>
            {activeTab !== 'url' && activeTab !== 'impersonation' && activeTab !== 'job_posting' && <CharCount value={currentInput}/>}
          </div>

          {activeTab === 'url' ? (
            <Input type="url"
                   placeholder={TABS.find((t) => t.id === 'url')?.placeholder}
                   value={currentInput}
                   onChange={(e) => handleInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                   disabled={loading}/>
          ) : activeTab === 'job_posting' ? (
            <div className="space-y-3 animate-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-text-muted font-medium">Company Name</label>
                  <Input type="text" placeholder="e.g. Google" value={jobDetails.company} onChange={(e) => handleJobDetail('company', e.target.value)} disabled={loading}/>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-text-muted font-medium">Job Title</label>
                  <Input type="text" placeholder="e.g. Software Engineer" value={jobDetails.title} onChange={(e) => handleJobDetail('title', e.target.value)} disabled={loading}/>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-text-muted font-medium">Recruiter Email</label>
                  <Input type="email" placeholder="e.g. jobs@company.com" value={jobDetails.email} onChange={(e) => handleJobDetail('email', e.target.value)} disabled={loading}/>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-text-muted font-medium">Salary Range</label>
                  <Input type="text" placeholder="e.g. $120k - $150k" value={jobDetails.salary} onChange={(e) => handleJobDetail('salary', e.target.value)} disabled={loading}/>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-text-muted font-medium">Job Description / Dump Area</label>
                <textarea className="input-base min-h-[120px] resize-none" rows={5}
                          placeholder="Paste the full job description here, or just dump all the info you have..."
                          value={currentInput}
                          onChange={(e) => handleInput(e.target.value)}
                          disabled={loading}/>
              </div>
            </div>
          ) : activeTab === 'impersonation' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border border-dashed border-background-border rounded-lg p-4 flex flex-col items-center justify-center text-center bg-background-hover/50 hover:bg-background-hover transition-colors relative h-44">
                {images.suspect ? (
                  <>
                    <img src={images.suspect} alt="Suspect" className="h-28 object-contain mb-2 rounded" />
                    <button onClick={() => handleImageUpload('suspect', null)} className="text-[11px] text-risk-critical hover:underline z-10">Remove</button>
                  </>
                ) : (
                  <>
                    <UserX className="text-text-muted mb-2" size={22} />
                    <p className="text-[11px] text-text-primary font-medium">Upload Suspect Image</p>
                    <p className="text-[10px] text-text-muted mt-0.5">Required</p>
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleImageUpload('suspect', e.target.files[0])} />
                  </>
                )}
              </div>
              <div className="border border-dashed border-background-border rounded-lg p-4 flex flex-col items-center justify-center text-center bg-background-hover/50 hover:bg-background-hover transition-colors relative h-44">
                {images.reference ? (
                  <>
                    <img src={images.reference} alt="Reference" className="h-28 object-contain mb-2 rounded" />
                    <button onClick={() => handleImageUpload('reference', null)} className="text-[11px] text-risk-critical hover:underline z-10">Remove</button>
                  </>
                ) : (
                  <>
                    <ScanSearch className="text-text-muted mb-2" size={22} />
                    <p className="text-[11px] text-text-primary font-medium">Upload Genuine Reference</p>
                    <p className="text-[10px] text-text-muted mt-0.5">Optional</p>
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleImageUpload('reference', e.target.files[0])} />
                  </>
                )}
              </div>
            </div>
          ) : (
            <textarea className="input-base resize-none" rows={10}
                      placeholder={TABS.find((t) => t.id === activeTab)?.placeholder}
                      value={currentInput}
                      onChange={(e) => handleInput(e.target.value)}
                      maxLength={10000} disabled={loading}/>
          )}
        </div>

        {/* Tip */}
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-accent-muted/50 border border-accent/10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <AlertCircle size={13} className="text-accent shrink-0 mt-0.5"/>
          <p className="text-[11px] text-text-secondary leading-relaxed">{TIPS[activeTab]}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-risk-critical/10 border border-risk-critical/15">
            <AlertCircle size={13} className="text-risk-critical shrink-0 mt-0.5"/>
            <p className="text-[11px] text-risk-critical">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between pt-1 animate-fade-up" style={{ animationDelay: '0.25s' }}>
          <p className="text-[11px] text-text-muted">Rate limited: 6 analyses / minute</p>
          <Button variant="primary" onClick={handleSubmit}
                  disabled={loading || (activeTab === 'impersonation' ? !images.suspect : (activeTab === 'job_posting' ? (!Object.values(jobDetails).some(v => v.trim()) && !currentInput.trim()) : !currentInput.trim()))}
                  className="min-w-[120px] transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg">
            {loading
              ? <><Loader2 size={14} className="animate-spin"/> Analyzing…</>
              : <><ScanSearch size={14}/> Analyze</>
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
