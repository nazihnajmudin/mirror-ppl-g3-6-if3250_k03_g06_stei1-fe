import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/lib/api-client"
import { Threshold } from "../utils"

export function useSettings() {
  const { toast } = useToast()
  const [thresholds, setThresholds] = useState<Threshold[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [triggering, setTriggering] = useState(false)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/settings/threshold')
      setThresholds(res.data.data || [])
    } catch (error) {
      toast({ title: "Error", description: "Gagal mengambil data pengaturan", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSettings() }, [])

  const handleUpdateThreshold = async (name: string, value: string) => {
    const numValue = parseInt(value)
    if (isNaN(numValue)) return

    try {
      setSaving(name)
      await apiClient.put('/settings/threshold', { name, value: numValue })
      setThresholds(prev => prev.map(t => t.name === name ? { ...t, value: numValue } : t))
      toast({ title: "Berhasil", description: `Pengaturan ${name} telah diperbarui` })
    } catch (error) {
      toast({ title: "Error", description: "Gagal memperbarui pengaturan", variant: "destructive" })
    } finally {
      setSaving(null)
    }
  }

  const handleTriggerEarlyWarning = async () => {
    try {
      setTriggering(true)
      await apiClient.post('/notifications/trigger')
      toast({ title: "Berhasil", description: "Sistem Early Warning telah dijalankan secara manual" })
    } catch (error) {
      toast({ title: "Error", description: "Gagal menjalankan sistem early warning", variant: "destructive" })
    } finally {
      setTriggering(false)
    }
  }

  return { thresholds, loading, saving, triggering, handleUpdateThreshold, handleTriggerEarlyWarning }
}