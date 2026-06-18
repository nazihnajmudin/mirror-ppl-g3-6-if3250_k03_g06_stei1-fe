import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProdiWithDashboard } from "../hooks/useDashboard"

export function DashboardSummary({ prodis }: { prodis: ProdiWithDashboard[] }) {
  const totalProdis = prodis.length
  const sedangAkreditasi = prodis.filter((p) => !p.isSafePeriod).length
  const masaAman = prodis.filter((p) => p.isSafePeriod).length

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white text-center pb-4">
          <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Total Program Studi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="text-4xl font-bold text-gray-900">{totalProdis}</div>
          <p className="text-sm text-gray-500 mt-2 font-medium">Semua Program Studi</p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-blue-100 bg-white shadow-sm overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white text-center pb-4">
          <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Sedang Akreditasi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="text-4xl font-bold text-blue-600">{sedangAkreditasi}</div>
          <p className="text-sm text-gray-500 mt-2 font-medium">Batas waktu ≤ 1.5 Tahun</p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-emerald-100 bg-white shadow-sm overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white text-center pb-4">
          <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Masa Aman
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="text-4xl font-bold text-emerald-600">{masaAman}</div>
          <p className="text-sm text-gray-500 mt-2 font-medium">Batas waktu &gt; 1.5 Tahun</p>
        </CardContent>
      </Card>
    </div>
  )
}