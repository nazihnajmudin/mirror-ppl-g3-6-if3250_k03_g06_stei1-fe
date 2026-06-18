import { useState, useCallback, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { getErrorMessage } from "@/lib/errors"
import apiClient from "@/lib/api-client"
import { getMyProdi } from "@/lib/api-prodi"
import type { Prodi } from "@/types/api.types"

type SheetRows = Array<Record<string, any>>

const INSTITUSI_SHEETS_MAPPING: Record<string, { key: string; title: string; description: string }[]> = {
  INFOKOM: [
    { key: '4a', title: 'Tabel 4.a: Keuangan', description: 'Data penggunaan dana tingkat UPPS' },
    { key: '3c', title: 'Tabel 3.c: Tenaga Kependidikan', description: 'Data tenaga kependidikan tingkat UPPS' },
    { key: '2b', title: 'Tabel 2.b: Mahasiswa Asing', description: 'Data mahasiswa asing tingkat UPPS' },
  ],
  TEKNIK: [
    { key: '4a', title: 'Tabel 4.a: Keuangan', description: 'Data penggunaan dana tingkat UPPS' },
    { key: '3c', title: 'Tabel 3.c: Tenaga Kependidikan', description: 'Data tenaga kependidikan tingkat UPPS' },
    { key: '2b', title: 'Tabel 2.b: Jumlah Mahasiswa', description: 'Data jumlah mahasiswa tingkat UPPS' },
  ]
};

import { useLKPSConfig } from "@/features/lkps/hooks/useLKPSConfig"

export function useDataInstitusi() {
  const { toast } = useToast()
  const { getFormatFromProdiName } = useLKPSConfig()

  const [periode, setPeriode] = useState("")
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([])
  const [prodis, setProdis] = useState<Prodi[]>([])
  const [selectedProdiId, setSelectedProdiId] = useState<string>("")
  const [selectedSheetKey, setSelectedSheetKey] = useState<string>("")
  
  const [sheetConfig, setSheetConfig] = useState<any>(null)
  const [sheetData, setSheetData] = useState<SheetRows>([])

  const [loadingProdi, setLoadingProdi] = useState(true)
  const [loadingSheet, setLoadingSheet] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedProdi = prodis.find(p => p.id === selectedProdiId);
  const selectedProdiCategory = selectedProdi ? getFormatFromProdiName(selectedProdi.fullname) : 'TEKNIK';
  const availableSheets = INSTITUSI_SHEETS_MAPPING[selectedProdiCategory] || INSTITUSI_SHEETS_MAPPING.TEKNIK;
  const currentSheetMetadata = availableSheets.find(s => s.key === selectedSheetKey) || availableSheets[0];

  const loadProdi = useCallback(async () => {
    setLoadingProdi(true)
    try {
      const list = await getMyProdi()
      setProdis(list)
      setSelectedProdiId((current) => current || list[0]?.id || "")
    } catch (err: unknown) {
      const message = getErrorMessage(err) || "Gagal memuat daftar program studi."
      setError(message)
    } finally {
      setLoadingProdi(false)
    }
  }, [])

  const loadSheet = useCallback(async () => {
    if (!selectedProdiId || !periode || !selectedSheetKey) return;
    
    setLoadingSheet(true)
    setError(null)
    setSheetConfig(null);
    setSheetData([]);

    try {
      // 1. Fetch config from LKPS
      const configRes = await apiClient.get(`/lkps/config/${selectedSheetKey}?format=${selectedProdiCategory}`);
      const config = configRes.data?.data;
      setSheetConfig(config);

      // 2. Fetch data from Institusi
      const response = await apiClient.get(
        `/institusi?periode=${periode}&sheetName=${selectedSheetKey}&prodiId=${selectedProdiId}`
      )
      const fetchedData = response.data?.data
      
      if (fetchedData && fetchedData.length > 0 && fetchedData[0].data) {
        setSheetData(fetchedData[0].data);
      } else {
        // Init empty data based on config
        if (config.rowType === 'fixed' && config.fixedRows) {
           setSheetData(config.fixedRows.map((label: string, idx: number) => ({
             no: idx + 1,
             [config.columns[1]?.key || 'jenis']: label
           })));
        } else {
           setSheetData([{ no: 1 }]);
        }
      }
    } catch (err: unknown) {
      const message = getErrorMessage(err) || "Gagal memuat data pusat institusi."
      setError(message)
    } finally {
      setLoadingSheet(false)
    }
  }, [periode, selectedProdiId, selectedSheetKey])

  useEffect(() => {
    void loadProdi()
  }, [loadProdi])

  useEffect(() => {
    if (!selectedProdiId) return
    
    const fetchPeriods = async () => {
      try {
        const res = await apiClient.get(`/lkps/available-periods/${selectedProdiId}`);
        const periods = res.data?.data || [];
        setAvailablePeriods(periods);
        if (periods.length > 0 && !periods.includes(periode)) {
          setPeriode(periods[0]);
        } else if (periods.length === 0) {
          setPeriode("");
        }
      } catch (err) {
        console.error("Gagal load available periods", err);
      }
    };
    fetchPeriods();
  }, [selectedProdiId])

  // Reset selectedSheetKey when prodi category changes
  useEffect(() => {
    if (!availableSheets.find(s => s.key === selectedSheetKey)) {
      setSelectedSheetKey(availableSheets[0].key);
    }
  }, [selectedProdiId, availableSheets, selectedSheetKey])

  useEffect(() => {
    if (selectedProdiId && periode && selectedSheetKey) {
      void loadSheet();
    }
  }, [selectedProdiId, periode, selectedSheetKey, loadSheet])

  const handleSync = async () => {
    setSaving(true)
    setError(null)

    try {
      if (!selectedProdiId) throw new Error("Program studi wajib dipilih sebelum sinkronisasi.")
      if (!periode) throw new Error("Periode tidak valid.")

      await apiClient.post('/institusi/sync', {
        prodiId: selectedProdiId,
        periode,
        sheetName: selectedSheetKey,
        data: sheetData,
      });

      toast({
        title: "Sinkronisasi Berhasil",
        description: `Data ${currentSheetMetadata.title} berhasil disinkronkan ke LKPS.`,
        variant: "default",
      })
    } catch (err: unknown) {
      const message = getErrorMessage(err) || "Gagal menyinkronisasi data ke program studi."
      setError(message)
      toast({
        title: "Sinkronisasi Gagal",
        description: message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return {
    periode, setPeriode, availablePeriods, prodis, selectedProdiId, setSelectedProdiId, selectedSheetKey, setSelectedSheetKey,
    loadingProdi, loadingSheet, saving, error, 
    sheetConfig, sheetData, setSheetData, availableSheets, currentSheetMetadata,
    loadSheet, handleSync
  }
}