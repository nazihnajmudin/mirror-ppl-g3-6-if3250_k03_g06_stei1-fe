"use client"

import React from "react"
import { RefreshCw, Database, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

import { useDataInstitusi } from "@/features/pusat-data-institusi/hooks/useDataInstitusi"
import { DataInstitusiMain } from "@/features/pusat-data-institusi/components/DataInstitusiMain"

export default function PusatDataInstitusiPage() {
  const logic = useDataInstitusi()

  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pusat Data Institusi</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data per program studi berdasarkan konfigurasi LKPS dan sinkronkan langsung ke sheet LKPS aktif.
          </p>
        </div>
        
        {/* Action Atas (Mirip Manajemen Akun) */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            onClick={() => void logic.loadSheet(logic.selectedSheetKey, true)} 
            variant="outline" 
            className="rounded-full font-bold text-sm h-10 px-5" 
            disabled={logic.loadingProdi || logic.loadingSheet || logic.saving}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${logic.loadingSheet ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={logic.handleSync}
            disabled={logic.loadingProdi || logic.loadingSheet || logic.saving || !logic.selectedProdiId}
            className="bg-black hover:bg-gray-800 text-white rounded-full px-6 py-2.5 h-10 text-sm font-bold flex items-center gap-2 shadow-md transition-colors"
          >
            {logic.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {logic.saving ? "Menyinkronkan..." : "Simpan & Sinkronisasi"}
          </Button>
        </div>
      </header>

      {/* Konten Utama FSD */}
      <DataInstitusiMain {...logic} />
    </>
  )
}