'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useReportStore } from './_store/useReportStore';
import { getTableConfig } from './_config/tableConfigs';
import { exportToExcel } from './_utils/exportUtils';
import { Download, FileSpreadsheet, RefreshCw, ArrowLeft, Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import apiClient from '@/lib/api-client';
import SimpleGrid from './_components/SimpleGrid';

const SHEETS = [
  'PS', 'PSPPI', '1', '2a1', '2a2', '2a3', '2b', '3a1', '3a2', '3a3', '3a4', '3a5', '3b', '3c', 
  '4a', '4b', '4c', '4d', '4e', '4f-1', '4f-2', '4f-3', '4f-4', '4g', '4h', '4i', '4j', '4k', 
  '5a', '5b', '5c', '6a', '6b', '6c1', '6c2', '6d', '6e1', '6e2', '6e3-1', '6e3-2', '6e3-3', 
  '6e3-4', '6e4', '6f1', '6f2', '6g1', '6g2', '6h1', '6h2', '6i', '7a', '7b'
];

function AccreditationReportContent() {
  const [activeSheet, setActiveSheet] = useState('2a1');
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { data, setData, resetData, updateSheetData } = useReportStore();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const versionId = searchParams.get('versionId');

  useEffect(() => {
    const fetchData = async () => {
      if (!versionId) return;
      
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await apiClient.get(`/lkps/${versionId}`);
        const docContent = res.data.data.content;

        if (docContent && typeof docContent === 'object') {
          setData(docContent);
          const firstSheetWithData = SHEETS.find(s => Array.isArray(docContent[s]) && docContent[s].length > 0);
          if (firstSheetWithData) {
             setActiveSheet(firstSheetWithData);
          }
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setErrorMsg("Dokumen tidak ditemukan di database.");
        } else {
          setErrorMsg("Gagal memuat data dari server.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [versionId, setData]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToExcel(data, activeSheet);
      toast({ title: "Export Berhasil", description: "File Excel telah diunduh." });
    } catch (err) {
      toast({ variant: "destructive", title: "Export Gagal", description: "Terjadi kesalahan saat mengekspor file." });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = async () => {
    if (!versionId) return;
    setIsSaving(true);
    try {
      // Backend needs to support PUT /api/lkps/:id
      await apiClient.put(`/lkps/${versionId}`, { content: data });
      toast({ title: "Berhasil Disimpan", description: "Perubahan data telah disimpan ke database." });
    } catch (err) {
      toast({ variant: "destructive", title: "Gagal Menyimpan", description: "Terjadi kesalahan saat menyimpan data." });
    } finally {
      setIsSaving(false);
    }
  };

  const addRow = () => {
    const currentData = data[activeSheet] || [];
    const config = getTableConfig(activeSheet);
    const newRow = Array(config.columns.length).fill('');
    updateSheetData(activeSheet, [...currentData, newRow]);
  };

  const deleteRow = () => {
    const currentData = data[activeSheet] || [];
    if (currentData.length === 0) return;
    updateSheetData(activeSheet, currentData.slice(0, -1));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm shrink-0">
        <div className="flex items-center space-x-6">
          <button onClick={() => window.history.back()} className="flex items-center text-gray-600 hover:text-gray-900 font-medium text-sm gap-2">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="w-8 h-8 text-green-600" />
            <h1 className="text-xl font-bold text-gray-800">LKPS Mirror Entry</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button onClick={() => resetData()} className="flex items-center px-3 py-2 text-xs font-medium text-gray-600 hover:text-red-600 transition-colors">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reset
          </button>
          
          <button onClick={handleSave} disabled={isSaving || isLoading} className="flex items-center px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 shadow-sm transition-all">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Simpan Perubahan
          </button>

          <button onClick={handleExport} disabled={isExporting || isLoading} className="flex items-center px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-400 shadow-sm transition-all">
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Export to XLSX
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 flex flex-col border-r bg-white shrink-0 overflow-hidden shadow-sm">
          <div className="p-4 border-b bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Daftar Tabel</h3>
          </div>
          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
            {SHEETS.map((sheet) => (
              <button key={sheet} onClick={() => setActiveSheet(sheet)} className={`w-full text-left px-3 py-2.5 text-xs rounded-lg transition-all ${activeSheet === sheet ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                Tabel {sheet}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6 overflow-hidden flex flex-col bg-white">
          <div className="flex items-center justify-between mb-4 shrink-0">
             <h2 className="text-lg font-bold text-gray-800">
               {getTableConfig(activeSheet).title}
             </h2>
             <div className="flex gap-2">
               <button onClick={addRow} className="flex items-center px-3 py-1.5 text-xs font-bold bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-all border border-gray-200">
                 <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Baris
               </button>
               <button onClick={deleteRow} className="flex items-center px-3 py-1.5 text-xs font-bold bg-white text-red-600 rounded-md hover:bg-red-50 transition-all border border-red-100">
                 <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus Baris
               </button>
             </div>
          </div>

          <div className="flex-1 overflow-hidden relative border border-gray-100 rounded-xl shadow-inner bg-gray-50/30 p-1">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20 backdrop-blur-[1px]">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium animate-pulse">Sinkronisasi data...</p>
              </div>
            ) : errorMsg ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20 p-8 text-center">
                <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 max-w-md shadow-sm">
                   <h3 className="text-lg font-bold mb-2">Oops! Ada Masalah</h3>
                   <p className="text-sm">{errorMsg}</p>
                   <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all">
                      Coba Lagi
                   </button>
                </div>
              </div>
            ) : null}
            
            <SimpleGrid 
              key={`${activeSheet}-${versionId}`} 
              data={data[activeSheet] || []}
              config={getTableConfig(activeSheet)}
              onDataChange={(newData) => {
                updateSheetData(activeSheet, newData);
              }}
            />
          </div>
          
          <p className="mt-3 text-[10px] text-gray-400 italic">
            * Data di atas adalah mirror dari file Excel yang diunggah. Perubahan akan disimpan ke database saat menekan tombol "Simpan".
          </p>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}

export default function AccreditationReportPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>}>
      <AccreditationReportContent />
    </Suspense>
  );
}
