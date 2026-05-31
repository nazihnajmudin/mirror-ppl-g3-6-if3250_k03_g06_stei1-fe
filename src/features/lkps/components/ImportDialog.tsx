'use client'

import React, { useState, useRef } from 'react'
import { UploadCloud, Loader2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import apiClient from '@/lib/api-client'
import { cn } from '@/lib/utils'

interface ImportDialogProps {
  prodiId?: string
  onImportSuccess: () => void
  defaultPeriode?: string
}

export function ImportDialog({ prodiId, onImportSuccess, defaultPeriode }: ImportDialogProps) {
  const currentYear = new Date().getFullYear().toString()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelection = (selectedFile: File) => {
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase()
    if (!['.xlsx', '.xls'].includes(ext)) {
      toast({ variant: 'destructive', title: 'Format tidak valid', description: 'Hanya mendukung format .xlsx atau .xls' })
      return
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File terlalu besar', description: 'Ukuran file maksimal 10MB' })
      return
    }
    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append('name', `Revisi LKPS - ${file.name}`)
    formData.append('periode', defaultPeriode || currentYear)
    if (prodiId) formData.append('prodiId', prodiId)
    formData.append('file', file)
    try {
      await apiClient.post('/lkps/confirm', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast({ title: 'Berhasil', description: `File LKPS periode ${defaultPeriode || currentYear} telah berhasil diupload.` })
      setFile(null)
      onImportSuccess()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Upload',
        description: error.response?.data?.message || 'Terjadi kesalahan saat mengupload file.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2.5 items-start">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
          Pastikan format file Anda sesuai: <b>S1 Informatika</b> dan <b>S1 Sistem & Teknologi Informasi</b> menggunakan format <b>INFOKOM</b>, sedangkan prodi lainnya menggunakan format <b>LAMTEKNIK</b>.
        </p>
      </div>

      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer group',
          isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50'
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.length) handleFileSelection(e.dataTransfer.files[0]) }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-5 h-5 text-blue-600" />
        </div>
        {file ? (
          <div className="text-sm font-medium text-blue-600 truncate px-2">{file.name}</div>
        ) : (
          <>
            <p className="text-[13px] font-medium text-gray-900">Klik atau drag file</p>
            <p className="text-[11px] text-gray-500">Maks 10MB (.xlsx)</p>
          </>
        )}
      </div>
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        accept=".xlsx,.xls"
        onChange={(e) => e.target.files && handleFileSelection(e.target.files[0])}
      />
      <Button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-10 text-xs shadow-md"
      >
        {loading && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
        {loading ? 'Mengunggah...' : 'Simpan Dokumen'}
      </Button>
    </div>
  )
}
