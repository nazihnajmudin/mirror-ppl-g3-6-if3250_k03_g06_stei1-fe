"use client"

import React, { useState, useEffect, useRef } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { upsertAccreditation, uploadAccreditationCertificate } from "@/lib/api-prodi"
import { toInputDate, type ProdiWithAccreditation } from "../utils"

interface EditCertificateModalProps {
  prodi: ProdiWithAccreditation | null
  onClose: () => void
  onSuccess: () => void
}

export function EditCertificateModal({ prodi, onClose, onSuccess }: EditCertificateModalProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [form, setForm] = useState({ grade: "", startDate: "", endDate: "", certificateUrl: "" })
  const [certFile, setCertFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Inisialisasi form saat modal terbuka
  useEffect(() => {
    if (prodi) {
      setForm({
        grade: prodi.accreditation?.grade ?? "",
        startDate: toInputDate(prodi.accreditation?.startDate),
        endDate: toInputDate(prodi.accreditation?.endDate),
        certificateUrl: prodi.accreditation?.certificateUrl?.startsWith("http") ? (prodi.accreditation.certificateUrl) : "",
      })
      setCertFile(null)
      setError(null)
    }
  }, [prodi])

  if (!prodi) return null

  const handleSave = async () => {
    if (form.startDate && form.endDate) {
      if (new Date(form.startDate) > new Date(form.endDate)) {
        setError("Tanggal mulai berlaku tidak boleh melebihi tanggal berakhir")
        return
      }
    }
    
    setSaving(true)
    setError(null)
    try {
      await upsertAccreditation(prodi.id, {
        grade: form.grade || undefined,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      })

      if (certFile) {
        await uploadAccreditationCertificate(prodi.id, certFile)
      }

      toast({ title: "Berhasil", description: "Data akreditasi berhasil disimpan" })
      onSuccess()
    } catch (err: any) {
      toast({ variant: "destructive", title: "Gagal menyimpan", description: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <h2 className="text-lg font-bold text-gray-900">Edit Akreditasi — {prodi.fullname}</h2>

        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="grade" className="text-sm font-bold text-gray-700">Grade Akreditasi</Label>
            <Input
              id="grade"
              value={form.grade}
              onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
              placeholder="Contoh: A, B, Unggul, Baik Sekali"
              className="mt-1.5 h-11 bg-gray-50/50 border-gray-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-sm font-bold text-gray-700">Berlaku Dari</Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => { setForm((f) => ({ ...f, startDate: e.target.value })); setError(null); }}
                className="mt-1.5 h-11 bg-gray-50/50 border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-sm font-bold text-gray-700">Berlaku S.d.</Label>
              <Input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={(e) => { setForm((f) => ({ ...f, endDate: e.target.value })); setError(null); }}
                className="mt-1.5 h-11 bg-gray-50/50 border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

          <div className="pt-2">
            <Label className="text-sm font-bold text-gray-700">Upload File Sertifikat</Label>
            <p className="text-xs text-gray-500 mb-2">Format PDF/JPEG/PNG, maksimal 10MB.</p>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setCertFile(e.target.files?.[0] ?? null)}
              />
              <Button variant="outline" size="sm" type="button" className="h-9 border-gray-300" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-3.5 w-3.5 mr-2" />
                Pilih File
              </Button>
              {certFile && <span className="text-xs font-semibold text-gray-700 truncate max-w-[200px]">{certFile.name}</span>}
              {!certFile && prodi.accreditation?.certificateOriginalName && (
                <span className="text-xs text-gray-500 truncate max-w-[200px]">File saat ini: {prodi.accreditation.certificateOriginalName}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-2">
          <Button variant="ghost" onClick={onClose} disabled={saving} className="font-bold text-gray-500 hover:text-gray-900">
            Batal
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6">
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </div>
  )
}