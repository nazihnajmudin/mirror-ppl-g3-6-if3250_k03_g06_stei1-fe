"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { useSimulasiList } from "@/features/simulasi-skor/hooks/useSimulasiList"
import { SimulasiListMain } from "@/features/simulasi-skor/components/SimulasiListMain"

export default function SimulasiSkorPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const logic = useSimulasiList(user, userLoading)

  useEffect(() => {
    if (!userLoading && user?.role === 'KAPRODI' && user?.prodiId) {
      router.push(`/simulasi-skor/${user.prodiId}`)
    }
  }, [user?.role, user?.prodiId, userLoading, router])

  if (logic.loading || userLoading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  }

  if (user?.role === 'KAPRODI') return null

  if (logic.error) {
    return (
      <div className="p-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <p className="text-red-700 font-bold">{logic.error}</p>
      </div>
    )
  }

  return <SimulasiListMain logic={logic} />
}