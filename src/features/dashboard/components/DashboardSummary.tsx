import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProdiWithDashboard } from "../hooks/useDashboard"

export function DashboardSummary({ prodis }: { prodis: ProdiWithDashboard[] }) {
  const prodiSelesai = prodis.filter((p) => p.status === "completed")
  const prodiProgress = prodis.filter((p) => p.status === "in_progress")
  const totalReady = prodiSelesai.length
  const totalNeedAttention = prodiProgress.filter((p) => (p.dashboard?.simulationScore || 0) < 200).length

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white text-center pb-4">
          <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Total Program Studi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="text-4xl font-bold text-gray-900">{prodis.length}</div>
          <p className="text-sm text-gray-500 mt-2 font-medium">Semua Program Studi</p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white text-center pb-4">
          <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Prodi yang Siap
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="text-4xl font-bold text-gray-900">{totalReady}</div>
          <p className="text-sm text-gray-500 mt-2 font-medium">Skor Simulasi ≥ 361</p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-red-100 bg-white shadow-sm overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white text-center pb-4">
          <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Prodi Perlu Perhatian
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="text-4xl font-bold text-red-600">{totalNeedAttention}</div>
          <p className="text-sm text-gray-500 mt-2 font-medium">Skor Simulasi &lt; 200</p>
        </CardContent>
      </Card>
    </div>
  )
}