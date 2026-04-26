"use client"

import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ImportDialog } from "@/components/lkps/import-dialog";
import { useLKPS } from "@/hooks/use-lkps";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api-client";
import { useRouter } from "next/navigation";

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};

export default function LKPSProdiPage({ params }: { params: Promise<{ prodiId: string }> }) {
  const resolvedParams = React.use(params);
  const prodiId = resolvedParams.prodiId;
  
  const [user, setUser] = useState<any>(null);
  const [activePeriode, setActivePeriode] = useState<string>(new Date().getFullYear().toString());
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        setUser(res.data.data);
      } catch (err) {
        console.error("Failed to fetch user");
      }
    };
    fetchUser();
  }, []);

  // Fetch all versions
  const { versions: allVersions, loading, refresh } = useLKPS(prodiId);
  
  // Filtered versions based on active periode (computed on render)
  const versions = allVersions.filter(v => (v.periode || new Date(v.createdAt).getFullYear().toString()) === activePeriode);

  useEffect(() => {
    const currentYear = new Date().getFullYear().toString();
    const periods = new Set<string>([currentYear]);
    
    if (allVersions.length > 0) {
      allVersions.forEach(v => {
        const p = v.periode || new Date(v.createdAt).getFullYear().toString();
        periods.add(p);
      });
    }
    
    const sortedPeriods = Array.from(periods).sort();
    setAvailablePeriods(sortedPeriods);
    
    // Ensure we have an active period set
    if (!activePeriode) {
        setActivePeriode(currentYear);
    }
  }, [allVersions, activePeriode]);

  useEffect(() => {
    // Set active version to latest in current period if not set or if current period changed
    if (versions.length > 0) {
      if (!activeVersionId || !versions.some(v => v.id === activeVersionId)) {
        setActiveVersionId(versions[0].id);
      }
    } else {
      setActiveVersionId(null);
    }
  }, [versions, activeVersionId]);

  const activeVersion = versions.find(v => v.id === activeVersionId) || (versions.length > 0 ? versions[0] : null);

  const handleExport = async () => {
    if (!activeVersionId) return;
    
    toast({
      title: "Menyiapkan Unduhan",
      description: "Excel sedang digenerate...",
    });

    try {
      const response = await apiClient.get(`/lkps/export/${activeVersionId}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = activeVersion?.originalFilename || `LKPS_${activeVersion?.prodi?.abbreviation || 'Export'}.xlsx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Unduhan Berhasil",
        description: "File LKPS telah berhasil diunduh.",
      });
    } catch (err) {
      console.error("Download Error:", err);
      toast({
        variant: "destructive",
        title: "Unduhan Gagal",
        description: "Terjadi kesalahan saat mengekspor file.",
      });
    }
  };

  const isViewOnly = user?.role === 'PIMPINAN' || user?.role === 'SUPER_ADMIN';
  const prodiName = allVersions[0]?.prodi?.fullname || "Program Studi";

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <header className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">{prodiName}</h1>
        <p className="text-sm text-gray-500 mt-1">Manajemen arsip Laporan Kinerja Program Studi (LKPS)</p>
      </header>

      {/* 2. SELECTION PERIODE & NAVIGASI */}
      <div className="relative flex items-center justify-center py-2 border-b border-gray-200 mb-8 pb-4 min-h-[50px]">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
            <Button variant="ghost" onClick={() => router.push('/dashboard/lkps')} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 -ml-3 gap-2 font-semibold text-sm">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Prodi
            </Button>
        </div>
        <div className="flex items-center">
            <button 
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 mr-4 disabled:opacity-30" 
                disabled={availablePeriods.indexOf(activePeriode) <= 0}
                onClick={() => { const idx = availablePeriods.indexOf(activePeriode); if (idx > 0) setActivePeriode(availablePeriods[idx - 1]); }}
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2 overflow-x-auto px-2">
                {availablePeriods.map((period) => (
                    <button 
                        key={period} 
                        onClick={() => setActivePeriode(period)} 
                        className={cn(
                            "px-5 py-1.5 text-sm font-semibold rounded-full transition-all", 
                            activePeriode === period ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"
                        )}
                    >
                        {period}
                    </button>
                ))}
            </div>
            <button 
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 ml-4 disabled:opacity-30" 
                disabled={availablePeriods.indexOf(activePeriode) >= availablePeriods.length - 1}
                onClick={() => { const idx = availablePeriods.indexOf(activePeriode); if (idx < availablePeriods.length - 1) setActivePeriode(availablePeriods[idx + 1]); }}
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-240px)] min-h-[750px]">
        {/* KOLOM KIRI */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full min-h-0">
          {!isViewOnly && (
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm shrink-0">
                <CardHeader className="px-5 py-4 border-b border-gray-100">
                    <CardTitle className="text-sm font-bold">Impor Dokumen ({activePeriode})</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                    <ImportDialog prodiId={prodiId} onImportSuccess={refresh} defaultPeriode={activePeriode} />
                </CardContent>
            </Card>
          )}

          <Card className="rounded-xl border border-gray-200 bg-white shadow-sm flex-1 flex flex-col min-h-0">
            <CardHeader className="px-5 py-4 border-b border-gray-100 shrink-0">
              <CardTitle className="text-sm font-bold text-gray-900">Riwayat Versi ({activePeriode})</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1 min-h-0">
              {loading ? (
                <div className="p-10 text-center text-sm text-gray-500 animate-pulse flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    Memuat riwayat...
                </div>
              ) : versions.length === 0 ? (
                <div className="p-10 text-center text-sm text-gray-500">Belum ada dokumen untuk periode ini.</div>
              ) : (
                versions.map((v, idx) => {
                  const isLatest = idx === 0;
                  const isSelected = activeVersionId === v.id;
                  return (
                    <div 
                      key={v.id}
                      onClick={() => setActiveVersionId(v.id)}
                      className={cn(
                        "px-5 py-4 border-b border-gray-50 flex items-start gap-3 transition-colors cursor-pointer group",
                        isSelected ? "bg-[#eef2ff] border-l-4 border-l-blue-500" : "bg-white hover:bg-gray-50 opacity-80"
                      )}
                    >
                      <div className="mt-0.5">
                        {isLatest ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className={cn(
                            "text-[13px] font-bold truncate",
                            isLatest ? "text-green-800" : "text-gray-700"
                          )}>
                            Versi {versions.length - idx} {isLatest && "(Terbaru)"}
                          </span>
                          <span className={cn(
                            "text-[11px] font-medium whitespace-nowrap ml-2",
                            isLatest ? "text-green-600" : "text-gray-500"
                          )}>
                            {formatDate(v.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 truncate">
                          {v.originalFilename || v.name}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* KOLOM KANAN (PREVIEW/UNDUH) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col h-full min-h-0">
          <Card className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col h-full min-h-0">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                    <h2 className="text-[15px] font-bold text-gray-900 leading-tight truncate">
                        {activeVersion?.originalFilename || activeVersion?.name || `Preview LKPS (${activePeriode})`}
                    </h2>
                    <p className="text-[12px] text-gray-500 truncate">
                        {activeVersion ? `Versi ${versions.length - versions.findIndex(v => v.id === activeVersionId)} • ${formatDate(activeVersion.createdAt)}` : 'Binary Document (.xlsx)'}
                    </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleExport}
                disabled={!activeVersionId}
                className="rounded-lg h-9 text-xs font-bold text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm gap-2 shrink-0 ml-4"
              >
                <Download className="w-4 h-4 text-gray-500" /> Unduh (.xlsx)
              </Button>
            </div>
            
            <CardContent className="flex-1 bg-gray-100/50 p-6 flex flex-col items-center justify-center text-center overflow-y-auto min-h-0">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Pratinjau Dinonaktifkan</h3>
                <p className="text-gray-500 max-w-md text-sm mb-6">
                  Untuk menjaga integritas data dan performa, pratinjau tabel dinonaktifkan. 
                  Silakan klik tombol <b>Unduh</b> untuk melihat isi file, atau gunakan <b>Mirror Excel</b> untuk entri data langsung.
                </p>
                
                <div className="flex flex-col gap-3 items-center">
                  <div className="flex gap-3 flex-wrap justify-center">
                    <Button 
                      onClick={() => {
                        if (activeVersionId) {
                          router.push(`/dashboard/lkps/${prodiId}/form?documentId=${activeVersionId}`);
                        }
                      }}
                      disabled={!activeVersionId}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-6 h-6" />
                      Isi Form LKPS
                    </Button>
                    <Button 
                      onClick={() => {
                        const url = `/dashboard/lkps/${prodiId}/report${activeVersionId ? `?versionId=${activeVersionId}` : ''}`;
                        router.push(url);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-6 h-6" />
                      Mirror Excel
                    </Button>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    * Form LKPS untuk entri data terstruktur, atau Mirror Excel untuk tampilan spreadsheet tradisional.
                  </p>
                </div>

                {versions.length === 0 && !loading && (
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-700 text-sm max-w-sm">
                        Belum ada dokumen LKPS yang diunggah untuk periode {activePeriode}.
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
