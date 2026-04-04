import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';

export interface LKPSVersion {
  id: string;
  name: string;
  createdAt: string;
  originalFilename?: string;
  periode?: string;
  prodi: { 
    fullname: string;
    abbreviation?: string;
  };
  content: any;
}

export function useLKPS(prodiId?: string) {
  const [versions, setVersions] = useState<LKPSVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVersions = useCallback(async () => {
    if (!prodiId) return;
    setLoading(true);
    try {
      const response = await apiClient.get(`/lkps/history/${prodiId}`);
      setVersions(response.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [prodiId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  return { versions, loading, error, refresh: fetchVersions };
}
