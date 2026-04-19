// frontend/src/hooks/useHistory.js
import { useState, useEffect, useCallback } from 'react';
import client from '@/api/client';

export function useHistory({ page = 1, pageSize = 15, riskLevel, scanType, dateFrom, dateTo } = {}) {
  const [items,   setItems]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, page_size: pageSize });
      if (riskLevel) params.set('risk_level', riskLevel);
      if (scanType)  params.set('scan_type',  scanType);
      if (dateFrom)  params.set('date_from',  dateFrom);
      if (dateTo)    params.set('date_to',    dateTo);
      const { data } = await client.get(`/api/v1/history?${params}`);
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError('Failed to load history.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, riskLevel, scanType, dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { items, total, loading, error, refetch: fetchData };
}
