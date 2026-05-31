"use client"

import React, { useEffect, useState } from "react"
import { AlertCircle, AlertTriangle, X, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/api-client"
import { cn } from "@/lib/utils"

// 1. IMPORT HOOK USEUSER
import { useUser } from "@/hooks/useUser"

interface Notification {
  id: string
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'DANGER'
  isRead: boolean
  targetUrl?: string
  prodi?: {
    fullname: string
  }
}

export function WarningBanner() {
  const [activeAlerts, setActiveAlerts] = useState<Notification[]>([])
  const [dismissed, setDismissed] = useState(false)
  const router = useRouter()
  const { user, loading } = useUser()

  useEffect(() => {
    if (loading) return;
    const isSuperOrPimpinan = user?.role === 'SUPER_ADMIN' || user?.role === 'PIMPINAN';

    const fetchAlerts = async () => {
      try {
        const res = await apiClient.get('/notifications')
        const all = res.data.data || []
        const critical = all.filter((n: Notification) => !n.isRead && (n.type === 'WARNING' || n.type === 'DANGER'))
        setActiveAlerts(critical)
      } catch (error) {
        console.error('Gagal mengambil alert banner:', error)
      }
    }

    if (isSuperOrPimpinan) {
      fetchAlerts()

      // Listen for custom trigger to update alert banner immediately
      window.addEventListener('notifications-updated', fetchAlerts)
    }

    return () => {
      window.removeEventListener('notifications-updated', fetchAlerts)
    }
  }, [user?.role, loading]) // Tambahkan dependency

  if (dismissed || activeAlerts.length === 0) return null

  // Prioritize accreditation expiry/danger warnings to the front
  const accreditationAlerts = activeAlerts.filter(n => n.title === 'Peringatan Akreditasi' || n.title === 'Akreditasi Kedaluwarsa')
  const otherAlerts = activeAlerts.filter(n => n.title !== 'Peringatan Akreditasi' && n.title !== 'Akreditasi Kedaluwarsa')
  const prioritizedAlerts = [...accreditationAlerts, ...otherAlerts]

  const alert = prioritizedAlerts[0] // Tampilkan yang paling prioritas (Akreditasi dahulu)

  const handleViewAlert = async (alert: Notification) => {
    try {
      setDismissed(true) // Hide immediately
      if (!alert.isRead) {
        await apiClient.patch(`/notifications/${alert.id}/read`)
      }
      if (alert.targetUrl) {
        router.push(alert.targetUrl)
      }
    } catch (error) {
      console.error('Gagal memproses alert:', error)
    }
  }

  return (
    <div className={cn(
      "relative w-full px-6 py-3 flex items-center justify-between gap-4 transition-all animate-in fade-in slide-in-from-top-4 duration-500",
      alert.type === 'DANGER' ? "bg-red-600 text-white" : "bg-orange-500 text-white"
    )}>
      <div className="flex items-center gap-3">
        {alert.type === 'DANGER' ? (
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        )}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="font-bold text-sm">{alert.title}</span>
          {alert.prodi && (
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full whitespace-nowrap">
              {alert.prodi.fullname}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {alert.targetUrl && (
          <button 
            onClick={() => handleViewAlert(alert)}
            className="flex items-center gap-1 text-[10px] font-bold bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
          >
            LIHAT <ArrowRight className="w-3 h-3" />
          </button>
        )}
        <button 
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}