"use client"

import React from "react"
import { Loader2, AlertCircle } from "lucide-react"

import { useDashboard } from "@/features/dashboard/hooks/useDashboard"
import { DashboardSummary } from "@/features/dashboard/components/DashboardSummary"
import { DashboardChart } from "@/features/dashboard/components/DashboardChart"
import { DashboardTable } from "@/features/dashboard/components/DashboardTable"

export default function InstitusiDashboard() {
  const { prodis, loading, error } = useDashboard()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <p className="text-sm text-red-800">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* --- Header Title --- */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Beranda Institusi</h1>
          <p className="text-sm text-gray-500 mt-1">Ringkasan progress kesiapan akreditasi program studi.</p>
        </div>
      </header>

      {/* --- Widget Summary --- */}
      <DashboardSummary prodis={prodis} />

      {/* --- Grafik Perbandingan --- */}
      <DashboardChart prodis={prodis} />

      {/* --- Tabel Status Kesiapan --- */}
      <DashboardTable prodis={prodis} />
    </div>
  )
}