"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Bell, AlertCircle, Info, AlertTriangle, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import apiClient from "@/lib/api-client"
import { cn } from "@/lib/utils"

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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

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
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const unreadCount = notifications.filter(n => !n.isRead).length

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
      case 'DANGER': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default: return <Info className="w-4 h-4 text-blue-500" />
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
      <DropdownMenuContent align="end" className="w-80 max-h-[450px] overflow-y-auto">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifikasi</span>
            {loading && <span className="text-[10px] text-gray-400 animate-pulse">Memperbarui...</span>}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            Tidak ada notifikasi
          </div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={cn(
                "flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-gray-50",
                !n.isRead && "bg-blue-50/50 focus:bg-blue-50"
              )}
              onClick={() => handleNotificationClick(n)}
            >
              <div className="flex items-center gap-2 w-full">
                {getIcon(n.type)}
                <span className={cn("text-xs font-bold flex-1", !n.isRead ? "text-gray-900" : "text-gray-600")}>
                  {n.title}
                </span>
                <span className="text-[10px] text-gray-400">
                  {formatTime(n.createdAt)}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 ml-6">
                {n.message}
              </p>
              {n.prodi && (
                <span className="text-[10px] font-medium text-blue-600 ml-6 bg-blue-50 px-1.5 py-0.5 rounded">
                  {n.prodi.fullname}
                </span>
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
