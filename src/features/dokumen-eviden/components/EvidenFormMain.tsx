"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { UploadCloud, Download, Trash2, FileText, Save, Edit, Loader2, Lock, Unlock } from "lucide-react"
import { cn } from "@/lib/utils"
import { getFileIcon, getFileExtension, isInfokom, KRITERIA_LAM_TEKNIK, KRITERIA_LAM_INFOKOM, KRITERIA_LKPS } from "../utils/index"
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

export function EvidenFormMain({ logic, mode, evidenId, urlProdiId }: { logic: any, mode: 'add'|'edit'|'view', evidenId: string | null, urlProdiId: string | null }) {
  const router = useRouter()
  const lamList = isInfokom(logic.activeProdi?.abbreviation) ? KRITERIA_LAM_INFOKOM : KRITERIA_LAM_TEKNIK
  const currentKriteriaList = logic.kategoriKriteria === "LAM" ? lamList : KRITERIA_LKPS

  return (
    <>
      <ConfirmDialog
        open={logic.confirmCancelOpen} title="Batalkan perubahan?" description="Perubahan belum disimpan. Yakin ingin membatalkan?"
        confirmLabel="Ya, Batalkan" cancelLabel="Lanjut Edit" variant="destructive"
        onConfirm={() => { sessionStorage.removeItem('unsavedChanges'); logic.setConfirmCancelOpen(false); logic.goBack() }}
        onCancel={() => logic.setConfirmCancelOpen(false)}
      />

      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6 sticky top-0 bg-gray-50/80 backdrop-blur-md z-20">
          <div>
            <Button variant="ghost" onClick={logic.handleCancel} className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-3 h-8 mb-2 gap-2 font-bold text-xs rounded-lg transition-colors">
              &larr; Kembali ke Daftar
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {mode === 'add' ? 'Tambah Eviden Baru' : mode === 'edit' ? 'Edit Eviden' : 'Detail Eviden'}
              </h1>
              {mode !== 'add' && (
                <span className={cn("text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 border", logic.isLocked ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-50 text-gray-600 border-gray-200")}>
                  {logic.isLocked ? <Lock className="w-3 h-3"/> : <Unlock className="w-3 h-3"/>} {logic.formData.status}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {mode !== 'add' && logic.canToggleLock && (
              <Button onClick={logic.handleToggleStatus} variant="outline" className={cn("gap-2 font-bold h-10 rounded-lg", logic.isLocked ? "border-amber-200 text-amber-700 hover:bg-amber-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50")}>
                {logic.isLocked ? <><Unlock className="w-4 h-4"/> Buka Kunci</> : <><Lock className="w-4 h-4"/> Finalisasi Dokumen</>}
              </Button>
            )}

            {mode === 'view' && !logic.isAdmin && !logic.isLocked && (
              <Button onClick={() => router.push(`/dokumen-eviden/form?mode=edit&id=${evidenId}${urlProdiId ? `&prodiId=${urlProdiId}` : ''}`)} className="bg-black text-white hover:bg-gray-800 gap-2 font-bold h-10 rounded-lg shadow-md px-6 transition-colors">
                <Edit className="w-4 h-4" /> Mulai Edit
              </Button>
            )}

            {mode !== 'view' && !logic.isLocked && !logic.isAdmin && (
              <>
                <Button variant="outline" onClick={logic.handleCancel} disabled={logic.isSaving} className="font-bold border-gray-200 text-gray-600 h-10 rounded-lg hover:bg-gray-100">Batal</Button>
                <Button onClick={logic.handleSave} disabled={logic.isSaving} className="bg-black text-white hover:bg-gray-800 gap-2 font-bold h-10 px-6 rounded-lg shadow-md transition-colors min-w-[150px]">
                  {logic.isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} {logic.isSaving ? "Menyimpan..." : "Simpan Eviden"}
                </Button>
              </>
            )}
          </div>
        </header>

        {logic.isLocked && (
          <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm flex items-center gap-3 font-bold border border-amber-200 mb-6 shadow-sm">
            <Lock className="w-5 h-5 shrink-0" /> Dokumen Eviden ini berstatus FINAL dan terkunci. Seluruh input telah dimatikan.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-stretch">
          <div className="space-y-6 flex flex-col h-full">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
              <div className="grid grid-cols-[2fr_1fr] gap-5">
                <div>
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Program Studi</Label>
                  <Input disabled value={logic.activeProdi?.fullname || "Memuat..."} className="h-11 bg-gray-50 border-gray-200 text-gray-700 font-bold rounded-lg" />
                </div>
                <div>
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Periode <span className="text-red-500">*</span></Label>
                  <Input disabled={logic.isViewOnly} value={logic.formData.periode} onChange={(e) => logic.handleFormChange('periode', e.target.value)} placeholder="Contoh: 2024" type="number" className="h-11 bg-gray-50/50 border-gray-200 rounded-lg font-medium" />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Judul Eviden <span className="text-red-500">*</span></Label>
                <Input disabled={logic.isViewOnly} value={logic.formData.judul} onChange={(e) => logic.handleFormChange('judul', e.target.value)} placeholder="Masukkan judul dokumen..." className="h-11 bg-gray-50/50 border-gray-200 rounded-lg font-bold text-gray-900" />
              </div>

              <div className="react-quill-container [&_.ql-editor]:min-h-[250px] flex-1">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Deskripsi Eviden</Label>
                <ReactQuill 
                  theme={logic.isViewOnly ? "bubble" : "snow"}
                  readOnly={logic.isViewOnly}
                  value={logic.formData.deskripsi} 
                  onChange={(val) => logic.handleFormChange('deskripsi', val)}
                  className={cn("bg-white", logic.isViewOnly ? "border border-gray-200 rounded-lg bg-gray-50/50 p-3 [&_.ql-editor]:min-h-[100px]" : "rounded-lg border-gray-200")}
                />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex-1">
              <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Pilih Kriteria/Indikator</h3>
                <select
                  value={logic.kategoriKriteria}
                  onChange={(e) => logic.setKategoriKriteria(e.target.value as "LAM" | "LKPS")}
                  disabled={logic.isViewOnly}
                  className="rounded-lg border border-gray-200 bg-gray-50/50 h-9 px-3 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="LAM">Kriteria LAM</option>
                  <option value="LKPS">Kriteria LKPS</option>
                </select>
              </div>
              
              <div className="space-y-3">
                {currentKriteriaList.map((kriteria) => (
                  <div key={kriteria.id} className="flex items-center space-x-3 group">
                    <Checkbox 
                      id={kriteria.id} disabled={logic.isViewOnly} checked={logic.formData.indikator.includes(kriteria.id)}
                      className="border-gray-300 rounded data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      onCheckedChange={() => {
                        const newIndikator = logic.formData.indikator.includes(kriteria.id) ? logic.formData.indikator.filter((id: string) => id !== kriteria.id) : [...logic.formData.indikator, kriteria.id];
                        logic.handleFormChange('indikator', newIndikator);
                      }}
                    />
                    <label htmlFor={kriteria.id} className={cn("text-sm cursor-pointer select-none transition-colors", logic.isViewOnly ? "cursor-default opacity-80" : "group-hover:text-gray-900")}>
                      <span className="font-bold text-gray-900">{kriteria.id}</span> <span className="text-gray-600 font-medium">— {kriteria.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3 shrink-0">
              <h3 className="text-base font-bold text-gray-900">Daftar File</h3>
              <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                {logic.uploadedFiles.length} File
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2 pb-4 space-y-3 custom-scrollbar relative min-h-[300px]">
              {logic.uploadedFiles.map((file: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50/50 border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2.5 bg-white border border-gray-100 shadow-sm rounded-lg shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[13px] font-bold text-gray-900 truncate pr-2" title={file.name}>{file.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-bold text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {getFileExtension(file.name, file.type)}
                        </span>
                        <span className="text-[11px] font-medium text-gray-500">{file.size}</span>
                        {file.isExisting === false && <span className="text-[9px] text-emerald-700 font-bold bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded">BARU</span>}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 pl-2">
                    {logic.isViewOnly ? (
                      <Button size="sm" variant="ghost" onClick={() => file.id && logic.handleDownloadFile(file.id, file.name)} className="w-8 h-8 rounded-lg text-blue-600 hover:bg-blue-100 p-0">
                        <Download className="w-4 h-4" />
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1">
                        {file.isExisting && file.id && (
                          <Button size="sm" variant="ghost" onClick={() => logic.handleDownloadFile(file.id, file.name)} className="w-8 h-8 rounded-lg text-blue-600 hover:bg-blue-100 p-0">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => logic.handleRemoveFile(idx)} className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 p-0 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {!logic.isViewOnly && (
                <div 
                  className={cn(
                    "sticky bottom-0 z-10 shrink-0 border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all shadow-[0_-12px_20px_rgba(255,255,255,0.9)] text-center", 
                    logic.uploadedFiles.length > 0 ? "mt-4" : "mt-0 h-full",
                    logic.isDragging ? "border-blue-500 bg-blue-50/90 backdrop-blur-sm" : "border-gray-300 bg-gray-50/90 backdrop-blur-sm hover:bg-gray-100 hover:border-gray-400"
                  )}
                  onDragOver={(e) => { e.preventDefault(); logic.setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); logic.setIsDragging(false); }}
                  onDrop={(e) => { e.preventDefault(); logic.setIsDragging(false); logic.handleFileSelect(e.dataTransfer.files); }}
                  onClick={() => logic.fileInputRef.current?.click()}
                >
                  <div className="w-12 h-12 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center shrink-0 mb-1">
                    <UploadCloud className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-900">Klik atau drag & drop file ke sini</p>
                    <p className="text-[11px] font-medium text-gray-500 mt-1">PDF, DOC, XLS, JPG, MP4, ZIP (Maks 10MB)</p>
                  </div>
                  <input type="file" multiple className="hidden" ref={logic.fileInputRef} onChange={(e) => logic.handleFileSelect(e.target.files)} />
                </div>
              )}
              
              {logic.isViewOnly && logic.uploadedFiles.length === 0 && (
                <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-gray-400">
                  <FileText className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-bold text-gray-500">Belum ada file yang diupload.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}