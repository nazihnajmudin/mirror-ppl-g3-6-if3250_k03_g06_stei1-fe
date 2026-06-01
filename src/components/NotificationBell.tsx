"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Bell, AlertCircle, Info, AlertTriangle, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import apiClient from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/useUser"

interface Notification {
  id: string
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'DANGER'
  isRead: boolean
  targetUrl?: string
  createdAt: string
  prodi?: {
    fullname: string
  }
}

export function NotificationBell() {
  const router = useRouter()
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'akreditasi' | 'indikator'>('all')

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/notifications')
      setNotifications(res.data.data || [])
    } catch (error) {
      console.error('Gagal mengambil notifikasi:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
    
    // Listen for custom trigger to update notifications immediately
    window.addEventListener('notifications-updated', fetchNotifications)

    return () => {
      clearInterval(interval)
      window.removeEventListener('notifications-updated', fetchNotifications)
    }
  }, [fetchNotifications, user?.role])

  const unreadNotifications = notifications.filter(n => !n.isRead)
  const unreadCount = unreadNotifications.length

  // Calculate counts for each filter category
  const akreditasiCount = unreadNotifications.filter(
    n => n.title === 'Peringatan Akreditasi' || n.title === 'Akreditasi Kedaluwarsa'
  ).length
  const indikatorCount = unreadNotifications.filter(
    n => n.title.startsWith('Capaian Indikator Rendah:')
  ).length

  const filteredNotifications = unreadNotifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'akreditasi') {
      return n.title === 'Peringatan Akreditasi' || n.title === 'Akreditasi Kedaluwarsa'
    }
    if (filter === 'indikator') {
      return n.title.startsWith('Capaian Indikator Rendah:')
    }
    return true
  })

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await apiClient.patch(`/notifications/${notification.id}/read`)
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        )
      } catch (error) {
        console.error('Gagal menandai notifikasi dibaca:', error)
      }
    }
    
    if (notification.targetUrl) {
      router.push(notification.targetUrl)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'DANGER': return <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
      default: return <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Baru saja'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m lalu`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}j lalu`
    return date.toLocaleDateString('id-ID')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative inline-flex items-center justify-center rounded-md w-9 h-9 text-sm font-medium transition-colors hover:bg-gray-100 outline-none focus-visible:ring-1 focus-visible:ring-gray-950">
        <Bell className="w-5 h-5 text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[480px] overflow-y-auto p-0 shadow-lg border border-gray-200">
        <DropdownMenuGroup className="p-3 pb-2 flex items-center justify-between">
          <DropdownMenuLabel className="font-bold text-sm text-gray-900 p-0">
            Notifikasi Baru
          </DropdownMenuLabel>
          {loading && <span className="text-[10px] text-gray-400 animate-pulse">Memperbarui...</span>}
        </DropdownMenuGroup>
        
        {/* Custom Segmented Radio Filter Control */}
        <div className="px-3 pb-3">
          <div 
            role="radiogroup"
            aria-label="Filter notifikasi"
            className="flex bg-gray-100/80 p-1 rounded-lg text-xs gap-1 border border-gray-200/50"
          >
            <button
              role="radio"
              aria-checked={filter === 'all'}
              onClick={() => setFilter('all')}
              className={cn(
                "flex-1 py-1.5 px-2 rounded-md font-medium text-center transition-all flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400",
                filter === 'all' 
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/30 font-semibold scale-[1.02]" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-white/40"
              )}
            >
              <span>Semua</span>
              {unreadCount > 0 && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-[9px] font-bold transition-all",
                  filter === 'all' ? "bg-gray-950 text-white" : "bg-gray-200 text-gray-700"
                )}>
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              role="radio"
              aria-checked={filter === 'akreditasi'}
              onClick={() => setFilter('akreditasi')}
              className={cn(
                "flex-1 py-1.5 px-2 rounded-md font-medium text-center transition-all flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400",
                filter === 'akreditasi' 
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/30 font-semibold scale-[1.02]" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-white/40"
              )}
            >
              <span>Akreditasi</span>
              {akreditasiCount > 0 && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-[9px] font-bold transition-all",
                  filter === 'akreditasi' ? "bg-red-500 text-white animate-pulse" : "bg-red-100 text-red-700"
                )}>
                  {akreditasiCount}
                </span>
              )}
            </button>
            <button
              role="radio"
              aria-checked={filter === 'indikator'}
              onClick={() => setFilter('indikator')}
              className={cn(
                "flex-1 py-1.5 px-2 rounded-md font-medium text-center transition-all flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400",
                filter === 'indikator' 
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/30 font-semibold scale-[1.02]" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-white/40"
              )}
            >
              <span>Indikator</span>
              {indikatorCount > 0 && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-[9px] font-bold transition-all",
                  filter === 'indikator' ? "bg-orange-500 text-white" : "bg-orange-100 text-orange-700"
                )}>
                  {indikatorCount}
                </span>
              )}
            </button>
          </div>
        </div>
        
        <DropdownMenuSeparator className="my-0 font-light opacity-50" />
        
        <div className="py-1">
          {filteredNotifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500 px-4 flex flex-col items-center justify-center gap-2">
              <Bell className="w-8 h-8 text-gray-300 stroke-[1.5]" />
              <p className="font-medium text-xs text-gray-500">
                {filter === 'all' && "Tidak ada notifikasi baru"}
                {filter === 'akreditasi' && "Tidak ada peringatan akreditasi baru"}
                {filter === 'indikator' && "Tidak ada peringatan capaian indikator baru"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-blue-50/50 hover:bg-blue-50/20 border-b border-gray-100/50 last:border-b-0 mx-1 rounded-md transition-colors duration-150"
                onClick={() => handleNotificationClick(n)}
              >
                <div className="flex items-center gap-2 w-full">
                  {getIcon(n.type)}
                  <span className="text-xs font-bold flex-1 text-gray-900 leading-snug">
                    {n.title}
                  </span>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {formatTime(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 ml-6 whitespace-normal break-words leading-relaxed">
                  {n.message}
                </p>
                {n.prodi && (
                  <span className="text-[10px] font-semibold text-blue-600 ml-6 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-100/50">
                    {n.prodi.fullname}
                  </span>
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
