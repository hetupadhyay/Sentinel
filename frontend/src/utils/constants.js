// frontend/src/utils/constants.js
// Sentinel — Shared constants for attack types, colors, and labels

/**
 * Color map for each of the 17 supported attack classifications.
 * These are used in badges, bar charts, and attack classification cards.
 */
export const ATTACK_COLORS = {
  'Phishing':                  '#f97316',
  'Spear Phishing':            '#ea580c',
  'Vishing':                   '#d97706',
  'Smishing':                  '#ca8a04',
  'Ransomware':                '#ef4444',
  'Social Engineering':        '#a855f7',
  'Impersonation':             '#8b5cf6',
  'Job Scam':                  '#eab308',
  'Advance Fee Fraud':         '#f59e0b',
  'MITM (Man-in-the-Middle)':  '#ec4899',
  'SQL Injection':             '#f43f5e',
  'XSS (Cross-Site Scripting)':'#e11d48',
  'DDoS Indicators':           '#dc2626',
  'Credential Stuffing':       '#b91c1c',
  'Fake News / Disinformation':'#14b8a6',
  'AI-Generated Content':      '#3b82f6',
  'Unknown / Other':           '#6b7280',
};


/**
 * Lucide icon name map for attack type cards.
 * Maps each attack type to a lucide-react icon component name.
 */
export const ATTACK_ICONS = {
  'Phishing':                  'Fishing',
  'Spear Phishing':            'Target',
  'Vishing':                   'PhoneCall',
  'Smishing':                  'MessageSquareWarning',
  'Ransomware':                'Lock',
  'Social Engineering':        'Brain',
  'Impersonation':             'UserX',
  'Job Scam':                  'Briefcase',
  'Advance Fee Fraud':         'DollarSign',
  'MITM (Man-in-the-Middle)':  'Unplug',
  'SQL Injection':             'Database',
  'XSS (Cross-Site Scripting)':'Code',
  'DDoS Indicators':           'Wifi',
  'Credential Stuffing':       'KeyRound',
  'Fake News / Disinformation':'Newspaper',
  'AI-Generated Content':      'Bot',
  'Unknown / Other':           'HelpCircle',
};


/**
 * Human-readable labels for scan type identifiers.
 */
export const SCAN_TYPE_LABELS = {
  job_posting:   'Job Posting',
  message:       'Message',
  news:          'News Article',
  url:           'URL',
  impersonation: 'Impersonation',
};
