"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SheetData, useReportStore } from '@/features/lkps/store/useReportStore'
import { getTableConfig } from '@/features/lkps/config/tableConfigs'
import { exportToExcel } from '@/features/lkps/utils/exportUtils'
import { Download, FileSpreadsheet, RefreshCw, ArrowLeft, Loader2, Save, Plus, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import apiClient from '@/lib/api-client'
import SimpleGrid from '@/features/lkps/components/SimpleGrid'

const SHEETS = ['PS', 'PSPPI', '1', '2a1', '2a2', '2a3', '2b', '3a1', '3a2', '3a3', '3a4', '3a5', '3b', '3c', '4a', '4b', '4c', '4d', '4e', '4f-1', '4f-2', '4f-3', '4f-4', '4g', '4h', '4i', '4j', '4k', '5a', '5b', '5c', '6a', '6b', '6c1', '6c2', '6d', '6e1', '6e2', '6e3-1', '6e3-2', '6e3-3', '6e3-4', '6e4', '6f1', '6f2', '6g1', '6g2', '6h1', '6h2', '6i', '7a', '7b']

function ReportContent({ prodiId }: { prodiId: string }) {
  const [activeSheet, setActiveSheet] = useState('2a1')
  const [isExporting, setIsExporting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [backendConfigs, setBackendConfigs] = useState<Record<string, any>>({})
  const { data, setData, resetData, updateSheetData } = useReportStore()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const versionId = searchParams.get('versionId')

  const getMergedConfig = (sheetName: string) => {
    const frontendConfig = getTableConfig(sheetName)
    const backendConfig = backendConfigs[sheetName]
    if (backendConfig && backendConfig.columns) {
      return { ...frontendConfig, columnLabels: backendConfig.columns.map((col: any) => col.label || col.key), columns: backendConfig.columns }
    }
    return frontendConfig
  }

  const convertToArrayFormat = (sheetData: any[], sheetConfig: any): any[] => {
    if (!Array.isArray(sheetData) || sheetData.length === 0) return []
    if (Array.isArray(sheetData[0])) return sheetData
    return sheetData.map(row => {
      if (typeof row !== 'object' || row === null) return []
      if (sheetConfig?.columns?.length > 0) return sheetConfig.columns.map((column: any) => row[column.key] ?? '')
      return Object.keys(row).map((key) => row[key] ?? '')
    })
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!versionId) return
      setIsLoading(true); setErrorMsg(null)
      try {
        const res = await apiClient.get(`/lkps/${versionId}`)
        const docContent = res.data.data.content
        if (docContent && typeof docContent === 'object') {
          const convertedData: Record<string, any[]> = {}
          for (const sheet of SHEETS) {
            if (Array.isArray(docContent[sheet])) {
              convertedData[sheet] = convertToArrayFormat(docContent[sheet], getTableConfig(sheet))
            }
          }
          setData(convertedData)
          const firstSheetWithData = SHEETS.find(s => Array.isArray(convertedData[s]) && convertedData[s].length > 0)
          if (firstSheetWithData) setActiveSheet(firstSheetWithData)
        }
      } catch (err: any) { setErrorMsg("Gagal memuat data dari server.") } 
      finally { setIsLoading(false) }
    }
    fetchData()
  }, [versionId, setData])

  const handleExport = async () => {
    setIsExporting(true)
    try { await exportToExcel(data, activeSheet); toast({ title: "Export Berhasil", description: "File Excel diunduh." }) } 
    catch { toast({ variant: "destructive", title: "Gagal" }) } 
    finally { setIsExporting(false) }
  }

  const handleSave = async () => {
    if (!versionId) return
    setIsSaving(true)
    try {
      await apiClient.put(`/lkps/${versionId}`, { content: data })
      toast({ title: "Berhasil Disimpan", description: "Perubahan disimpan ke database." })
    } catch { toast({ variant: "destructive", title: "Gagal Menyimpan" }) } 
    finally { setIsSaving(false) }
  }

  const addRow = () => {
    const currentData = data[activeSheet] || []
    const newRow = Array(getMergedConfig(activeSheet).columns.length).fill('')
    updateSheetData(activeSheet, [...currentData, newRow])
  }

  const deleteRow = () => {
    const currentData = data[activeSheet] || []
    if (currentData.length > 0) updateSheetData(activeSheet, currentData.slice(0, -1))
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm shrink-0">
        <div className="flex items-center space-x-6">
          <button onClick={() => window.history.back()} className="flex items-center text-gray-500 hover:text-gray-900 font-bold text-xs gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> KEMBALI
          </button>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-green-50 text-green-600 rounded-md border border-green-100"><FileSpreadsheet className="w-5 h-5" /></div>
            <h1 className="text-[16px] font-bold text-gray-900">LKPS Mirror Excel</h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => resetData()} className="flex items-center px-3 py-2 text-xs font-bold text-gray-500 hover:text-red-600 transition-colors"><RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reset</button>
          <Button onClick={handleSave} disabled={isSaving || isLoading} className="h-9 px-4 text-xs font-bold bg-black hover:bg-gray-800 text-white rounded-lg shadow-sm">
            {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-2" />} Simpan
          </Button>
          <Button onClick={handleExport} disabled={isExporting || isLoading} className="h-9 px-4 text-xs font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm">
            {isExporting ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-2" />} Export XLSX
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 flex flex-col border-r border-gray-200 bg-white shrink-0 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50"><h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Daftar Tabel</h3></div>
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            {SHEETS.map((sheet) => (
              <button key={sheet} onClick={() => setActiveSheet(sheet)} className={`w-full text-left px-3 py-2.5 text-[12px] font-bold rounded-lg transition-all ${activeSheet === sheet ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-gray-600 hover:bg-gray-50'}`}>
                Tabel {sheet}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6 overflow-hidden flex flex-col bg-gray-50/50">
          <div className="flex items-center justify-between mb-4 shrink-0 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <h2 className="text-[14px] font-bold text-gray-900">{getMergedConfig(activeSheet).title}</h2>
             <div className="flex gap-2">
               <Button onClick={addRow} variant="outline" size="sm" className="h-8 text-[11px] font-bold gap-1.5 border-gray-200"><Plus className="w-3.5 h-3.5" /> Tambah Baris</Button>
               <Button onClick={deleteRow} variant="outline" size="sm" className="h-8 text-[11px] font-bold gap-1.5 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /> Hapus Baris</Button>
             </div>
          </div>

          <div className="flex-1 overflow-hidden relative border border-gray-200 rounded-xl shadow-sm bg-white p-2">
            {isLoading && <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>}
            <SimpleGrid data={data[activeSheet] || []} config={getMergedConfig(activeSheet)} onDataChange={(newData: SheetData) => updateSheetData(activeSheet, newData)} />
          </div>
        </main>
      </div>
    </div>
  )
}

export default function Page({ params }: { params: Promise<{ prodiId: string }> }) {
  const resolvedParams = React.use(params)
  return <Suspense><ReportContent prodiId={resolvedParams.prodiId} /></Suspense>
}