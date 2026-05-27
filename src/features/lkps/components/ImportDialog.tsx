"use client"

import React, { useState } from "react"
import { Upload, FileSpreadsheet, Loader2, Calendar } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/lib/api-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface ImportDialogProps {
  prodiId?: string
  onImportSuccess: () => void
  defaultPeriode?: string
}

export function ImportDialog({ prodiId, onImportSuccess, defaultPeriode }: ImportDialogProps) {
  const currentYear = new Date().getFullYear().toString()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [periode, setPeriode] = useState(defaultPeriode || currentYear)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append("name", `Revisi LKPS - ${file.name}`)
    formData.append("periode", periode)
    if (prodiId) {
      formData.append("prodiId", prodiId)
    }
    formData.append("file", file)

    try {
      await apiClient.post("/lkps/confirm", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      toast({
        title: "Berhasil",
        description: `File LKPS periode ${periode} telah berhasil diupload.`,
      })
      
      setOpen(false)
      setFile(null)
      onImportSuccess()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Upload",
        description: error.response?.data?.message || "Terjadi kesalahan saat mengupload file.",
      })
    } finally {
      setLoading(false)
    }
  }

  const years = Array.from({ length: 6 }, (_, i) => (new Date().getFullYear() - 5 + i).toString()).reverse()

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Upload Revisi LKPS
      </Button>
      <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setFile(null); }}>
      
      <DialogContent className="max-w-md bg-white rounded-xl shadow-xl border-gray-200 p-0 overflow-hidden sm:max-w-md">
        <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <DialogTitle className="text-lg font-bold text-gray-900">Upload File LKPS Baru (.xlsx)</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 p-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Calendar className="w-3.5 h-3.5" /> Periode Akreditasi
            </label>
            <Select value={periode} onValueChange={(val) => setPeriode(val ?? "")}>
              <SelectTrigger className="w-full h-11 bg-gray-50/50 border-gray-200 rounded-lg font-bold text-gray-700">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 rounded-xl shadow-lg">
                {years.map(y => (
                  <SelectItem key={y} value={y} className="font-medium">{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={cn(
            "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer group relative",
            file ? "border-green-300 bg-green-50/30" : "border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300"
          )}>
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
            />
            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileSpreadsheet className={cn("w-6 h-6", file ? "text-green-600" : "text-blue-600")} />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-bold text-gray-900">
                {file ? file.name : "Klik atau drag file Excel ke sini"}
              </p>
              <p className="text-[11px] text-gray-500 font-medium mt-1">Hanya mendukung format .xlsx atau .xls</p>
            </div>
          </div>
          
          <Button 
            disabled={!file || loading} 
            onClick={handleUpload}
            className="w-full h-11 font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-all"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
            {loading ? "Sedang Mengupload..." : "Upload Sekarang"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}