"use client"

import { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '@/lib/api-client';

export interface LKPSGlobalConfig {
  formats: {
    INFOKOM: string[];
    TEKNIK: string[];
  };
  tableConfigs: Record<string, any>;
  criteria: Record<string, any>;
}

export function useLKPSConfig() {
  const [config, setConfig] = useState<LKPSGlobalConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/lkps/config-all');
      setConfig(res.data?.data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch global LKPS config:', err);
      setError('Gagal memuat konfigurasi LKPS');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const getSheetNamesByFormat = useCallback((format: 'INFOKOM' | 'TEKNIK') => {
    if (!config) return [];
    return config.formats[format] || [];
  }, [config]);

  const getFormatFromProdiName = useCallback((prodiName: string): 'INFOKOM' | 'TEKNIK' => {
    const name = prodiName.toLowerCase().replace(/[^a-z0-9]/g, ' ');
    const infokomKeywords = [
      'informatika',
      'sistem teknologi informasi',
      's1 sti',
      'sarjana informatika',
      'teknik informatika',
    ];
    for (const kw of infokomKeywords) {
      if (name.includes(kw)) return 'INFOKOM';
    }
    return 'TEKNIK';
  }, []);

  return {
    config,
    loading,
    error,
    fetchConfig,
    getSheetNamesByFormat,
    getFormatFromProdiName
  };
}
