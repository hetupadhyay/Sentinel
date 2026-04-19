// frontend/src/hooks/useAnalyze.js
import { useState } from 'react';
import client from '@/api/client';

export function useAnalyze() {
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const analyze = async ({ scanType, text, url }) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = scanType === 'url'
        ? { scan_type: scanType, url }
        : { scan_type: scanType, text };
      const { data } = await client.post('/api/v1/analyze', payload);
      setResult(data);
      return data;
    } catch (err) {
      const msg =
        err.response?.status === 429
          ? 'Rate limit reached — wait before retrying.'
          : err.response?.data?.detail || 'Analysis failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setResult(null); setError(null); };

  return { analyze, result, loading, error, reset };
}
