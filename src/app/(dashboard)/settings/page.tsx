"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, RefreshCw, AlertCircle, ShieldCheck } from "lucide-react"
import apiClient from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/useUser"
import { useRouter } from "next/navigation"

interface Threshold {
  id: string
  name: string
  value: number
  updatedAt: string
}

export default function SettingsPage() {
  const { toast } = useToast()
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  
  const [thresholds, setThresholds] = useState<Threshold[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [triggering, setTriggering] = useState(false)

  useEffect(() => {
    if (!userLoading && user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard')
    }
  }, [user, userLoading, router])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/settings/threshold')
      setThresholds(res.data.data || [])
    } catch (error) {
      console.error('Gagal mengambil pengaturan:', error)
      toast({
        title: "Error",
        description: "Gagal mengambil data pengaturan",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleUpdateThreshold = async (name: string, value: string) => {
    const numValue = parseInt(value)
    if (isNaN(numValue)) return

    try {
      setSaving(name)
      await apiClient.put('/settings/threshold', { name, value: numValue })
      setThresholds(prev => 
        prev.map(t => t.name === name ? { ...t, value: numValue } : t)
      )
      toast({
        title: "Berhasil",
        description: `Pengaturan ${name} telah diperbarui`,
      })
    } catch (error) {
      console.error('Gagal memperbarui pengaturan:', error)
      toast({
        title: "Error",
        description: "Gagal memperbarui pengaturan",
        variant: "destructive"
      })
    } finally {
      setSaving(null)
    }
  }

  const handleTriggerEarlyWarning = async () => {
    try {
      setTriggering(true)
      await apiClient.post('/notifications/trigger')
      toast({
        title: "Berhasil",
        description: "Sistem Early Warning telah dijalankan secara manual",
      })
    } catch (error) {
      console.error('Gagal menjalankan early warning:', error)
      toast({
        title: "Error",
        description: "Gagal menjalankan sistem early warning",
        variant: "destructive"
      })
    } finally {
      setTriggering(false)
    }
  }

  if (loading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const getDisplayName = (name: string) => {
    switch (name) {
      case 'accreditation_expiry_warning_days': return 'Ambangi Masa Berlaku Akreditasi (Hari)'
      case 'document_inactivity_days': return 'Ambangi Ketidakaktifan Dokumen (Hari)'
      default: return name
    }
  }

  const getDescription = (name: string) => {
    switch (name) {
      case 'accreditation_expiry_warning_days': 
        return 'Jumlah hari sebelum akreditasi berakhir untuk memicu notifikasi peringatan.'
      case 'document_inactivity_days': 
        return 'Jumlah hari ketidakaktifan dokumen DRAFT sebelum memicu notifikasi informasi.'
      default: return ''
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
          <p className="text-sm text-gray-500">Kelola konfigurasi early warning dan notifikasi</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-bold text-blue-700">Mode Admin</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Konfigurasi Early Warning</CardTitle>
          <CardDescription>
            Tentukan nilai ambang batas (threshold) untuk pemicu otomatis sistem peringatan dini.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {thresholds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Belum ada konfigurasi. Jalankan trigger manual untuk inisialisasi.</p>
            </div>
          ) : (
            thresholds.map((t) => (
              <div key={t.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b pb-6 last:border-0 last:pb-0">
                <div className="md:col-span-2">
                  <Label className="text-sm font-bold text-gray-700">{getDisplayName(t.name)}</Label>
                  <p className="text-xs text-gray-500 mt-1">{getDescription(t.name)}</p>
                </div>
                <div className="md:col-span-1">
                  <Input 
                    type="number" 
                    defaultValue={t.value}
                    onBlur={(e) => {
                      if (parseInt(e.target.value) !== t.value) {
                        handleUpdateThreshold(t.name, e.target.value)
                      }
                    }}
                    className="h-9"
                  />
                </div>
                <div className="flex justify-end">
                  {saving === t.name ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <Save className="w-4 h-4 text-gray-300" />
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-orange-100 bg-orange-50/30">
        <CardHeader>
          <CardTitle className="text-lg text-orange-900">Operasi Manual</CardTitle>
          <CardDescription className="text-orange-700/70">
            Jalankan pemeriksaan sistem secara manual tanpa menunggu jadwal otomatis harian.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleTriggerEarlyWarning} 
            disabled={triggering}
            variant="outline"
            className="border-orange-200 hover:bg-orange-100 text-orange-700"
          >
            {triggering ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Jalankan Early Warning Sekarang
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
