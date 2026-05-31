"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/errors"
import apiClient from "@/lib/api-client"
import type { ApiResponse, ProdiOption } from "@/types/api.types"

interface ProdiWithDashboard extends ProdiOption {
  dashboard?: {
    accreditation?: { grade?: string; endDate?: string }
    documents?: { lkps?: { progress?: number }; led?: { progress?: number } }
    simulationScore?: number
  }
  status?: "completed" | "in_progress"
}

export default function InstitusiDashboard() {
  const [activeTab, setActiveTab] = useState<"Selesai" | "Progress">("Selesai")
  const [prodis, setProdis] = useState<ProdiWithDashboard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.get<ApiResponse<ProdiWithDashboard[]>>("/prodi/dashboard/summary")
        setProdis(response.data.data || [])
      } catch (err: unknown) {
        const message = getErrorMessage(err) || "Gagal memuat data ringkasan dashboard"
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Separate prodis by status
  const prodiSelesai = prodis.filter((p) => p.status === "completed")
  const prodiProgress = prodis.filter((p) => p.status === "in_progress")
  const totalReady = prodiSelesai.length
  const totalNeedAttention = prodiProgress.filter((p) => (p.dashboard?.simulationScore || 0) < 200).length

  // Prepare graph data
  const graphData = prodis.slice(0, 5).map((prodi) => {
    const score = prodi.dashboard?.simulationScore || 0
    let color = "bg-[#ff6b6b]" // Perlu Perhatian <200
    if (score >= 200 && score < 301) color = "bg-[#ffd93d]" // Baik 200-300
    else if (score >= 301 && score < 361) color = "bg-[#06b6d4]" // Baik Sekali 301-360
    else if (score >= 361) color = "bg-[#20c997]" // Unggul >=361
    
    return {
      name: prodi.abbreviation || prodi.fullname.slice(0, 10),
      score,
      color,
    }
  })

  const maxScore = Math.max(...graphData.map((d) => d.score), 500)

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
      {/* --- HEADER TITLE --- */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Beranda Institusi</h1>
          <p className="text-sm text-gray-500 mt-1">Ringkasan progress kesiapan akreditasi program studi.</p>
        </div>
      </header>

      {/* --- WIDGET SUMMARY --- */}
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

      {/* --- GRAFIK PERBANDINGAN --- */}
      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white text-center">
          <CardTitle className="text-lg font-bold text-gray-900">
            Grafik Perbandingan Skor Simulasi Akreditasi
          </CardTitle>
          <div className="flex justify-center gap-5 mt-4 text-[13px] text-gray-600 font-medium">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff6b6b] shadow-sm"></span> Perlu Perhatian (&lt;200)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ffd93d] shadow-sm"></span> Baik (200-300)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#06b6d4] shadow-sm"></span> Baik Sekali (301-360)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#20c997] shadow-sm"></span> Unggul (≥361)
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-6 py-8">
          <div className="relative h-[300px] w-full mt-2">
            {[0, Math.max(maxScore / 4, 125), Math.max(maxScore / 2, 250), Math.max((maxScore * 3) / 4, 375), maxScore || 500].map(
              (val, idx) => (
                <div key={idx} className="absolute w-full flex items-center" style={{ bottom: `${(val / (maxScore || 500)) * 100}%` }}>
                  <span className="text-[11px] font-bold text-gray-400 w-10 text-right mr-4">{Math.round(val)}</span>
                  <div className="flex-1 border-t border-dashed border-gray-200"></div>
                </div>
              )
            )}

            <div className="absolute inset-0 ml-14 flex justify-around items-end pb-[1px]">
              {graphData.length > 0 ? (
                graphData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center w-16 h-full justify-end group">
                    <div
                      className={cn("w-14 rounded-t-md transition-all duration-700 shadow-sm group-hover:opacity-80", d.color)}
                      style={{ height: `${((d.score || 0) / (maxScore || 500)) * 100}%` }}
                    />
                    <span className="absolute -bottom-7 text-[11px] font-bold text-gray-500 whitespace-nowrap">{d.name}</span>
                  </div>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <p>Belum ada data</p>
                </div>
              )}
            </div>
          </div>
          <div className="h-10"></div>
        </CardContent>
      </Card>

      {/* --- TABEL STATUS KESIAPAN --- */}
      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-lg font-bold text-gray-900">Status Kesiapan Program Studi</CardTitle>

          <div className="flex gap-1 bg-gray-100 p-1.5 rounded-full shadow-inner">
            <button
              onClick={() => setActiveTab("Selesai")}
              className={cn(
                "px-5 py-1.5 text-xs font-bold rounded-full transition-all shadow-sm",
                activeTab === "Selesai"
                  ? "bg-[#20c997] text-white"
                  : "bg-transparent text-gray-500 hover:text-gray-700 shadow-none"
              )}
            >
              Selesai ({prodiSelesai.length})
            </button>
            <button
              onClick={() => setActiveTab("Progress")}
              className={cn(
                "px-5 py-1.5 text-xs font-bold rounded-full transition-all shadow-sm",
                activeTab === "Progress"
                  ? "bg-[#ff6b6b] text-white"
                  : "bg-transparent text-gray-500 hover:text-gray-700 shadow-none"
              )}
            >
              Progress ({prodiProgress.length})
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {activeTab === "Selesai" && prodiSelesai.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <p className="text-sm">Belum ada program studi yang selesai</p>
            </div>
          ) : activeTab === "Progress" && prodiProgress.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <p className="text-sm">Belum ada program studi dalam progress</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">
                    PROGRAM STUDI
                  </TableHead>
                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">
                    AKREDITASI
                  </TableHead>
                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">
                    BERLAKU S.D.
                  </TableHead>

                  {activeTab === "Progress" && (
                    <>
                      <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">
                        PROGRESS LKPS
                      </TableHead>
                      <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">
                        PROGRESS LED
                      </TableHead>
                    </>
                  )}

                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider text-right">
                    SKOR SIMULASI
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {(activeTab === "Selesai" ? prodiSelesai : prodiProgress).map((prodi) => (
                  <TableRow key={prodi.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-900 rounded-lg text-white shadow-sm">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[14px] font-bold text-gray-900 block">{prodi.fullname}</span>
                          {prodi.abbreviation && (
                            <span className="text-[11px] text-gray-500">{prodi.abbreviation}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-gray-100 rounded-md shadow-inner flex-shrink-0 border border-gray-200/50">
                          <Image src="/icon/dashboard-akreditasi.svg" alt="Ikon Akreditasi" width={22} height={22} />
                        </div>
                        <span className="text-[13px] font-semibold text-gray-700">
                          {prodi.dashboard?.accreditation?.grade || "Belum"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <Image
                          src="/icon/dashboard-masa-berlaku.svg"
                          alt="Ikon Masa Berlaku"
                          width={16}
                          height={16}
                          className="flex-shrink-0 opacity-70"
                        />
                        <span className="text-[13px] text-gray-600 font-medium">
                          {prodi.dashboard?.accreditation?.endDate
                            ? new Date(prodi.dashboard.accreditation.endDate).toLocaleDateString("id-ID")
                            : "-"}
                        </span>
                      </div>
                    </TableCell>

                    {activeTab === "Progress" && (
                      <>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src="/icon/dashboard-progress.svg"
                              alt="Ikon Progress"
                              width={16}
                              height={16}
                              className="flex-shrink-0 opacity-80"
                            />
                            <span className="text-[12px] font-bold text-gray-700 w-8">
                              {prodi.dashboard?.documents?.lkps?.progress || 0}%
                            </span>
                            <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                              <div
                                className="h-full bg-gray-900 rounded-full"
                                style={{ width: `${prodi.dashboard?.documents?.lkps?.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src="/icon/dashboard-progress.svg"
                              alt="Ikon Progress"
                              width={16}
                              height={16}
                              className="flex-shrink-0 opacity-80"
                            />
                            <span className="text-[12px] font-bold text-gray-700 w-8">
                              {prodi.dashboard?.documents?.led?.progress || 0}%
                            </span>
                            <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                              <div
                                className="h-full bg-gray-900 rounded-full"
                                style={{ width: `${prodi.dashboard?.documents?.led?.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                      </>
                    )}

                    <TableCell className="px-6 py-4 text-right">
                      <span className="text-[15px] font-bold text-gray-900">
                        {prodi.dashboard?.simulationScore || 0}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
