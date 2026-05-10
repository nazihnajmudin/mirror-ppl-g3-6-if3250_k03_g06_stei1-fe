"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, TrendingUp, Eye, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/errors"
import apiClient from "@/lib/api-client"
import type { ApiResponse, ProdiOption } from "@/types/api.types"

interface ProdiWithSimulation extends ProdiOption {
  dashboard?: {
    simulationScore?: number
  }
  status?: "unggul" | "baik_sekali" | "baik" | "needs_attention"
}

export default function SimulasiSkorPage() {
  const router = useRouter()
  const [prodis, setProdis] = useState<ProdiWithSimulation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProdis = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.get<ApiResponse<ProdiOption[]>>("/prodi")
        const prodiList = response.data.data || []

        // Fetch dashboard data for each prodi
        const prodiWithSimulation = await Promise.all(
          prodiList.map(async (prodi) => {
            try {
              const dashboardRes = await apiClient.get(`/prodi/${prodi.id}/dashboard`)
              const dashboardData = dashboardRes.data.data
              const score = dashboardData?.simulationScore || 0
              return {
                ...prodi,
                dashboard: dashboardData,
                status:
                  score >= 361 ? ("unggul" as const) :
                  score >= 301 ? ("baik_sekali" as const) :
                  score >= 200 ? ("baik" as const) :
                  ("needs_attention" as const),
              }
            } catch (err) {
              // If dashboard fetch fails, return prodi without dashboard data
              return {
                ...prodi,
                status: "needs_attention" as const,
              }
            }
          })
        )

        setProdis(prodiWithSimulation)
      } catch (err: unknown) {
        const message = getErrorMessage(err) || "Gagal memuat data simulasi skor"
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadProdis()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unggul":
        return <Badge className="bg-emerald-100 text-emerald-800">Unggul (≥361)</Badge>
      case "baik_sekali":
        return <Badge className="bg-sky-100 text-sky-800">Baik Sekali (301-360)</Badge>
      case "baik":
        return <Badge className="bg-yellow-100 text-yellow-800">Baik (200-300)</Badge>
      case "needs_attention":
        return <Badge className="bg-red-100 text-red-800">Perlu Perhatian (&lt;200)</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const sortedProdis = [...prodis].sort((a, b) =>
    (b.dashboard?.simulationScore || 0) - (a.dashboard?.simulationScore || 0)
  )

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
        <AlertCircle className="w-5 h-5 text-red-500" />
        <p className="text-red-700">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Simulasi Skor Akreditasi</h1>
          <p className="text-gray-600 mt-1">
            Pantau skor simulasi akreditasi untuk semua program studi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Program Studi</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prodis.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unggul (≥361)</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {prodis.filter(p => p.status === "unggul").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baik Sekali (301-360)</CardTitle>
            <TrendingUp className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600">
              {prodis.filter(p => p.status === "baik_sekali").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perlu Perhatian (&lt;200)</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {prodis.filter(p => p.status === "needs_attention").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Simulasi Skor Program Studi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program Studi</TableHead>
                <TableHead>Skor Simulasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProdis.map((prodi) => (
                <TableRow key={prodi.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{prodi.fullname}</div>
                      <div className="text-sm text-gray-500">{prodi.degree}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-lg font-semibold">
                      {prodi.dashboard?.simulationScore || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(prodi.status || "needs_attention")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => router.push(`/simulasi-skor-prodi/${prodi.id}`)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}