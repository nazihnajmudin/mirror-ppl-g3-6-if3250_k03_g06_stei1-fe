'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useReportStore } from './_store/useReportStore';
import { exportToExcel } from './_utils/exportUtils';
import { Download, FileSpreadsheet, RefreshCw, ArrowLeft, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api-client';
import 'handsontable/styles/handsontable.min.css';

// Dynamically import DataGrid with SSR disabled
const DataGrid = dynamic(() => import('./_components/DataGrid'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 bg-gray-50 border border-dashed rounded-md">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-500 font-medium">Memuat Spreadsheet...</span>
    </div>
  )
});

const SHEETS = [
  'PS', 'PSPPI', '1', '2a1', '2a2', '2a3', '2b', '3a1', '3a2', '3a3', '3a4', '3a5', '3b', '3c', 
  '4a', '4b', '4c', '4d', '4e', '4f-1', '4f-2', '4f-3', '4f-4', '4g', '4h', '4i', '4j', '4k', 
  '5a', '5b', '5c', '6a', '6b', '6c1', '6c2', '6d', '6e1', '6e2', '6e3-1', '6e3-2', '6e3-3', 
  '6e3-4', '6e4', '6f1', '6f2', '6g1', '6g2', '6h1', '6h2', '6i', '7a', '7b'
];

function AccreditationReportContent() {
  const [activeSheet, setActiveSheet] = useState('2a1');
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { data, setData, resetData } = useReportStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const versionId = searchParams.get('versionId');

  useEffect(() => {
    const fetchData = async () => {
      console.log(`[AccreditationReport] versionId from URL:`, versionId);
      if (!versionId) {
        console.warn("[AccreditationReport] No versionId found in URL");
        return;
      }
      
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const apiUrl = `/lkps/${versionId}`;
        console.log(`[AccreditationReport] Calling API: ${apiUrl}`);
        const res = await apiClient.get(apiUrl);
        const docContent = res.data.data.content;
        
        console.log(`[AccreditationReport] Data fetched:`, {
          hasContent: !!docContent,
          keys: docContent ? Object.keys(docContent).length : 0
        });

        // Ensure docContent is an object and not empty before setting data
        if (docContent && typeof docContent === 'object') {
          setData(docContent);
          
          // Set active sheet to the first sheet that actually has data, if any
          const firstSheetWithData = SHEETS.find(s => Array.isArray(docContent[s]) && docContent[s].length > 0);
          if (firstSheetWithData) {
             setActiveSheet(firstSheetWithData);
          }
        } else {
          console.warn("[AccreditationReport] Document found but content is empty/invalid");
        }
      } catch (err: any) {
        console.error("Failed to fetch LKPS version data:", err.message);
        if (err.response?.status === 404) {
          setErrorMsg("Dokumen tidak ditemukan di database. Pastikan file telah diunggah dengan benar.");
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
    await exportToExcel(data);
    setIsExporting(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm shrink-0">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 font-medium text-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="w-8 h-8 text-green-600" />
            <h1 className="text-xl font-bold text-gray-800">LKPS Accreditation Mirror</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin menghapus semua data?')) {
                resetData();
              }
            }}
            className="flex items-center px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </button>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-400"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export to XLSX'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 flex flex-col border-r bg-white shrink-0 overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Daftar Tabel</h3>
          </div>
          <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {SHEETS.map((sheet) => (
              <button
                key={sheet}
                onClick={() => setActiveSheet(sheet)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  activeSheet === sheet 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Tabel {sheet}
              </button>
            ))}
          </nav>
        </aside>

        {/* Data Grid Section */}
        <main className="flex-1 p-6 overflow-hidden flex flex-col bg-white">
          <div className="flex-1 overflow-hidden relative">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Memuat data LKPS...</p>
              </div>
            ) : errorMsg ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 p-8 text-center">
                <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 max-w-md">
                   <h3 className="text-lg font-bold mb-2">Oops! Ada Masalah</h3>
                   <p className="text-sm">{errorMsg}</p>
                   <button 
                      onClick={() => window.location.reload()}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
                   >
                      Coba Lagi
                   </button>
                </div>
              </div>
            ) : null}
            <DataGrid key={`${activeSheet}-${versionId}`} sheetName={activeSheet} />
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}

export default function AccreditationReportPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Memuat Mirror Excel...</p>
      </div>
    }>
      <AccreditationReportContent />
    </Suspense>
  );
}
