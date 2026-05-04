"use client"

import React, { useEffect, useState } from "react"
import { AlertCircle, AlertTriangle, X, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/api-client"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'DANGER'
  isRead: boolean
  targetUrl?: string
}

export function WarningBanner() {
  const [activeAlerts, setActiveAlerts] = useState<Notification[]>([])
  const [dismissed, setDismissed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await apiClient.get('/notifications')
        const all = res.data.data || []
        // Hanya tampilkan notifikasi WARNING dan DANGER yang belum dibaca
        const critical = all.filter((n: Notification) => !n.isRead && (n.type === 'WARNING' || n.type === 'DANGER'))
        setActiveAlerts(critical)
      } catch (error) {
        console.error('Gagal mengambil alert banner:', error)
      }
    }
    fetchAlerts()
  }, [])

  if (dismissed || activeAlerts.length === 0) return null

  const alert = activeAlerts[0] // Tampilkan yang paling baru/kritis

  const handleViewAlert = async (alert: Notification) => {
    try {
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
        <div className="flex flex-col sm:flex-row sm:items-center">
          <span className="font-bold sm:mr-2 text-sm">{alert.title}</span>
          <span className="text-xs sm:text-sm opacity-90 line-clamp-1">{alert.message}</span>
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
