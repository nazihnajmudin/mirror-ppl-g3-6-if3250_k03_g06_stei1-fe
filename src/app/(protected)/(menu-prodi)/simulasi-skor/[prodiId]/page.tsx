"use client"

import React from "react"
import { useParams } from "next/navigation"
import { Loader2, AlertCircle } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { useSimulasiDetail } from "@/features/simulasi-skor/hooks/useSimulasiDetail"
import { SimulasiDetailMain } from "@/features/simulasi-skor/components/SimulasiDetailMain"

export default function SimulasiSkorProdiPage() {
  const params = useParams()
  const { user } = useUser()
  const logic = useSimulasiDetail(params.prodiId as string)

  if (logic.loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  }

  if (logic.error || !logic.simulation || !logic.prodi) {
    return (
      <div className="p-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <p className="text-red-700 font-bold">{logic.error || "Data tidak ditemukan"}</p>
      </div>
    )
  }

  return <SimulasiDetailMain user={user} logic={logic} />
}