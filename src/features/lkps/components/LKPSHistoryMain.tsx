"use client"
import React from 'react'
import { FileSpreadsheet, Download, Loader2, ChevronLeft, ChevronRight, CheckCircle2, Clock, ArrowLeft, Lock, Unlock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ImportDialog } from "./ImportDialog"
import { MonitoringDialog } from "@/components/monitoring/monitoring-dialog"

export function LKPSHistoryMain({ logic, prodiId }: { logic: any, prodiId: string }) {
  const isViewOnly = logic.user?.role === 'PIMPINAN' || logic.user?.role === 'SUPER_ADMIN'
  const canToggleLock = logic.user?.role === 'SUPER_ADMIN' || (logic.user?.role === 'KAPRODI' && logic.user?.prodiId === prodiId)
  const prodiName = logic.allVersions[0]?.prodi?.fullname || "Program Studi"
  const isLocked = logic.activeVersion?.status === 'FINAL'

  const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-6">
      <header className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">{prodiName}</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">Manajemen arsip Laporan Kinerja Program Studi (LKPS)</p>
      </header>

      <div className="relative flex items-center justify-center py-2 border-b border-gray-200 mb-8 pb-4 min-h-[50px]">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
            <Button variant="ghost" onClick={() => logic.router.push('/lkps')} className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-3 -ml-3 gap-2 font-bold text-xs rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Prodi
            </Button>
        </div>
        <div className="flex items-center">
            <button className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 mr-4 disabled:opacity-30" disabled={logic.availablePeriods.indexOf(logic.activePeriode) <= 0} onClick={() => { const idx = logic.availablePeriods.indexOf(logic.activePeriode); if (idx > 0) logic.setActivePeriode(logic.availablePeriods[idx - 1]); }}><ChevronLeft className="w-5 h-5" /></button>
            <div className="flex gap-2 overflow-x-auto px-2">
                {logic.availablePeriods.map((period: string) => (
                    <button key={period} onClick={() => logic.setActivePeriode(period)} className={cn("px-5 py-1.5 text-xs font-bold rounded-full transition-all", logic.activePeriode === period ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100")}>{period}</button>
                ))}
            </div>
            <button className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 ml-4 disabled:opacity-30" disabled={logic.availablePeriods.indexOf(logic.activePeriode) >= logic.availablePeriods.length - 1} onClick={() => { const idx = logic.availablePeriods.indexOf(logic.activePeriode); if (idx < logic.availablePeriods.length - 1) logic.setActivePeriode(logic.availablePeriods[idx + 1]); }}><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-240px)] min-h-[750px]">
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full min-h-0">
          {!isViewOnly && (
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm shrink-0">
                <CardHeader className="px-5 py-4 border-b border-gray-100"><CardTitle className="text-sm font-bold text-gray-900">Impor Dokumen ({logic.activePeriode})</CardTitle></CardHeader>
                <CardContent className="p-5"><ImportDialog prodiId={prodiId} onImportSuccess={logic.refresh} defaultPeriode={logic.activePeriode} /></CardContent>
            </Card>
          )}

          <Card className="rounded-xl border border-gray-200 bg-white shadow-sm flex-1 flex flex-col min-h-0">
            <CardHeader className="px-5 py-4 border-b border-gray-100 shrink-0"><CardTitle className="text-sm font-bold text-gray-900">Riwayat Versi ({logic.activePeriode})</CardTitle></CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
              {logic.loading ? (
                <div className="p-10 text-center text-sm font-medium text-gray-500 animate-pulse flex flex-col items-center gap-3"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /> Memuat riwayat...</div>
              ) : logic.versions.length === 0 ? (
                <div className="p-10 text-center text-sm font-medium text-gray-400">Belum ada dokumen untuk periode ini.</div>
              ) : (
                logic.versions.map((v: any, idx: number) => {
                  const isLatest = idx === 0; const isSelected = logic.activeVersionId === v.id;
                  return (
                    <div key={v.id} onClick={() => logic.setActiveVersionId(v.id)} className={cn("px-5 py-4 border-b border-gray-50 flex items-start gap-3 transition-colors cursor-pointer group", isSelected ? "bg-blue-50/50 border-l-4 border-l-blue-600" : "bg-white hover:bg-gray-50 opacity-80")}>
                      <div className="mt-0.5">{isLatest ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-gray-400" />}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className={cn("text-[13px] font-bold truncate", isLatest ? "text-emerald-800" : "text-gray-900")}>Versi {logic.versions.length - idx} {isLatest && "(Terbaru)"}</span>
                          <span className={cn("text-[10px] font-bold tracking-wider whitespace-nowrap ml-2", isLatest ? "text-emerald-600" : "text-gray-400")}>{formatDate(v.createdAt)}</span>
                        </div>
                        <p className="text-[11px] font-medium text-gray-500 truncate mb-2">{v.originalFilename || v.name}</p>
                        <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-2">
                          <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1.5 w-max border", v.status === 'FINAL' ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-50 text-gray-600 border-gray-200")}>
                              {v.status === 'FINAL' ? <Lock className="w-3 h-3"/> : <Unlock className="w-3 h-3"/>} {v.status || 'DRAFT'}
                          </span>
                          {canToggleLock && (
                              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); logic.handleToggleStatus(v.id, v.status || 'DRAFT'); }} className={cn("h-6 px-2 text-[10px] font-bold rounded-md", v.status === 'FINAL' ? "text-amber-600 hover:text-amber-800 hover:bg-amber-50" : "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50")}>
                                  {v.status === 'FINAL' ? "Buka Kunci" : "Finalisasi"}
                              </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-8 flex flex-col h-full min-h-0">
          <Card className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col h-full min-h-0">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg shrink-0"><FileSpreadsheet className="w-5 h-5" /></div>
                <div className="overflow-hidden">
                    <h2 className="text-[14px] font-bold text-gray-900 leading-tight truncate">{logic.activeVersion?.originalFilename || logic.activeVersion?.name || `Preview LKPS (${logic.activePeriode})`}</h2>
                    <p className="text-[11px] font-medium text-gray-500 truncate flex items-center gap-2 mt-0.5">
                        {logic.activeVersion ? `Versi ${logic.versions.length - logic.versions.findIndex((v:any) => v.id === logic.activeVersionId)} • ${formatDate(logic.activeVersion.createdAt)}` : 'Binary Document (.xlsx)'}
                        {isLocked && <span className="inline-flex items-center text-amber-700 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded"><Lock className="w-2.5 h-2.5 mr-1"/> FINAL</span>}
                    </p>
                </div>
              </div>
              <div className="flex gap-2">
                {logic.activeVersion && <MonitoringDialog documentType="LKPS" documentId={logic.activeVersion.id} documentLabel={logic.activeVersion.name || `LKPS ${logic.activePeriode}`} triggerLabel="Monitoring" compact triggerClassName="rounded-lg h-9 text-xs font-bold bg-white text-gray-700 border-gray-200 shadow-sm" />}
                <Button variant="outline" onClick={logic.handleExport} disabled={!logic.activeVersionId} className="rounded-lg h-9 text-xs font-bold text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm gap-2 shrink-0">
                  <Download className="w-4 h-4 text-gray-500" /> Unduh
                </Button>
              </div>
            </div>
            
            <CardContent className="flex-1 bg-gray-50/50 p-6 flex flex-col items-center justify-center text-center overflow-y-auto min-h-0">
                <div className="w-20 h-20 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-5"><FileSpreadsheet className="w-8 h-8 text-blue-500" /></div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Pratinjau Dinonaktifkan</h3>
                <p className="text-gray-500 font-medium max-w-md text-sm mb-6">Gunakan <b>Mirror Excel</b> untuk melakukan entri data LKPS secara langsung melalui browser.</p>
                
                {isLocked ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center max-w-md shadow-sm">
                      <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3"><Lock className="w-5 h-5" /></div>
                      <h3 className="text-[13px] font-bold text-gray-900 mb-1">Dokumen Terkunci (FINAL)</h3>
                      <p className="text-[11px] font-medium text-gray-600">Akses menuju pengisian Form dan Mirror Excel telah ditutup karena versi dokumen yang Anda pilih berstatus FINAL.</p>
                  </div>
                ) : (
                  <div className="flex gap-3 justify-center">
                      <Button onClick={() => { if(logic.activeVersionId) logic.router.push(`/lkps/${prodiId}/report?versionId=${logic.activeVersionId}`) }} disabled={!logic.activeVersionId} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 rounded-xl shadow-md transition-all flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4" /> Buka Mirror Excel
                      </Button>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}