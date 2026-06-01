"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { useSettings } from "@/features/pengaturan/hooks/useSettings"
import { SettingsMain } from "@/features/pengaturan/components/SettingsMain"

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const logic = useSettings()

  useEffect(() => {
    if (!userLoading && user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard')
    }
  }, [user, userLoading, router])

  if (logic.loading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user) return null

  return <SettingsMain logic={logic} />
}