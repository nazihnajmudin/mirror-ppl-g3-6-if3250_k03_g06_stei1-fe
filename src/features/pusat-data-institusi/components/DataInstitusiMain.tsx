"use client"

import React from "react"
import { Loader2, RefreshCw, Database, AlertCircle, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import SimpleGrid from "@/features/lkps/components/SimpleGrid"

export function DataInstitusiMain({
  periode, setPeriode, availablePeriods, prodis, selectedProdiId, setSelectedProdiId, selectedSheetKey, setSelectedSheetKey,
  loadingProdi, loadingSheet, saving, error, 
  sheetConfig, sheetData, setSheetData, availableSheets, currentSheetMetadata,
  loadSheet, handleSync
}: any) {

  const noDrafts = !loadingProdi && selectedProdiId && availablePeriods.length === 0;

  return (
    <>
      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-6">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white">
          <CardTitle className="text-lg font-bold text-gray-900">Target Sinkronisasi</CardTitle>
          <CardDescription className="text-sm text-gray-500 mt-1">Pilih program studi dan sheet LKPS yang akan diisi.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-2.5 min-w-0">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Program Studi</label>
              <Select value={selectedProdiId} onValueChange={(value) => setSelectedProdiId(value ?? "")} disabled={loadingProdi}>
                <SelectTrigger className="w-full h-11 bg-gray-50/50 border-gray-200 rounded-lg min-w-0">
                  <SelectValue placeholder={loadingProdi ? "Memuat prodi..." : "Pilih program studi"} />
                </SelectTrigger>
                <SelectContent>
                  {prodis.map((prodi: any) => (
                    <SelectItem key={prodi.id} value={prodi.id}>
                      {prodi.fullname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2.5 min-w-0">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Periode LKPS (DRAFT)</label>
              <Select value={periode} onValueChange={(value) => setPeriode(value ?? "")} disabled={!selectedProdiId || availablePeriods.length === 0}>
                <SelectTrigger className="w-full h-11 bg-gray-50/50 border-gray-200 rounded-lg min-w-0">
                  <SelectValue placeholder={noDrafts ? "Tidak ada draft" : "Pilih periode"} />
                </SelectTrigger>
                <SelectContent>
                  {availablePeriods.map((p: string) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {noDrafts ? (
        <Card className="rounded-xl border border-gray-200 bg-gray-50 shadow-sm overflow-hidden mb-6 flex flex-col items-center justify-center p-12 text-center">
          <ShieldCheck className="w-16 h-16 text-emerald-500 mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Masa Aman / Tidak Ada DRAFT</h2>
          <p className="text-gray-500 max-w-md">
            Program studi ini tidak memiliki dokumen LKPS yang sedang dalam masa pengisian (status DRAFT). Sinkronisasi data institusi hanya bisa dilakukan pada dokumen yang belum difinalisasi.
          </p>
        </Card>
      ) : (
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-6">
          <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Editor Sheet LKPS Institusi</CardTitle>
                <CardDescription className="text-sm text-gray-500 mt-1 break-normal whitespace-normal">
                  {currentSheetMetadata?.description || "Isi data sinkronisasi untuk program studi terpilih."}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSheets.map((sheet: any) => (
                  <Button
                    key={sheet.key}
                    type="button"
                    variant={selectedSheetKey === sheet.key ? "default" : "outline"}
                    onClick={() => setSelectedSheetKey(sheet.key)}
                    className={cn(
                      "rounded-full px-4 font-bold text-xs h-9 transition-colors",
                      selectedSheetKey === sheet.key ? "bg-black text-white hover:bg-gray-800" : "text-gray-600 border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    {sheet.title}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {error && (
              <div className="mx-6 mt-4 p-4 rounded-lg bg-red-50 text-red-600 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
            {availablePeriods.length === 0 && selectedProdiId ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-500 bg-gray-50/50 p-8 text-center">
                <Database className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">Tidak ada draft LKPS</h3>
                <p className="mt-2 max-w-md">Prodi ini tidak memiliki data yang dapat disinkronisasi karena belum ada draft LKPS yang dibuat. Harap buat dokumen LKPS baru terlebih dahulu.</p>
              </div>
            ) : loadingSheet ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : sheetConfig ? (
              <div className="p-6 overflow-x-auto">
                <SimpleGrid
                  config={sheetConfig}
                  data={sheetData}
                  onDataChange={setSheetData}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[300px] text-gray-500">
                Data tidak tersedia atau gagal dimuat.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}