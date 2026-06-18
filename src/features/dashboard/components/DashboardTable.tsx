import React, { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Activity, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProdiWithDashboard } from "../hooks/useDashboard"

export function DashboardTable({ prodis }: { prodis: ProdiWithDashboard[] }) {
  const [activeTab, setActiveTab] = useState<"Selesai" | "Progress" | "Aman">("Progress")
  
  const prodiSelesai = prodis.filter((p) => p.status === "completed" && !p.isSafePeriod)
  const prodiProgress = prodis.filter((p) => p.status === "in_progress" && !p.isSafePeriod)
  const prodiAman = prodis.filter((p) => p.isSafePeriod)

  return (
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
          <button
            onClick={() => setActiveTab("Aman")}
            className={cn(
              "px-5 py-1.5 text-xs font-bold rounded-full transition-all shadow-sm",
              activeTab === "Aman"
                ? "bg-[#06b6d4] text-white"
                : "bg-transparent text-gray-500 hover:text-gray-700 shadow-none"
            )}
          >
            Masa Aman ({prodiAman.length})
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
        ) : activeTab === "Aman" && prodiAman.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <p className="text-sm">Tidak ada program studi dalam masa aman</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-b border-gray-100">
                <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-4 py-3 tracking-wider">
                  PROGRAM STUDI
                </TableHead>
                <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-4 py-3 tracking-wider w-32">
                  AKREDITASI
                </TableHead>
                <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-4 py-3 tracking-wider w-32">
                  BERLAKU S.D.
                </TableHead>

                {activeTab === "Progress" && (
                  <>
                    <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-4 py-3 tracking-wider w-40">
                      PROGRESS LKPS
                    </TableHead>
                    <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-4 py-3 tracking-wider w-40">
                      PROGRESS LED
                    </TableHead>
                  </>
                )}

                {activeTab !== "Aman" && (
                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-4 py-3 tracking-wider text-right w-24">
                    SKOR SIMULASI
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {(activeTab === "Selesai" ? prodiSelesai : activeTab === "Progress" ? prodiProgress : prodiAman).map((prodi) => (
                <TableRow key={prodi.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-900 rounded-lg text-white shadow-sm flex-shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[13px] font-bold text-gray-900 block truncate">{prodi.fullname}</span>
                        {prodi.abbreviation && (
                          <span className="text-[11px] text-gray-500">{prodi.abbreviation}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gray-100 rounded-md shadow-inner flex-shrink-0 border border-gray-200/50">
                        <Image src="/icon/dashboard-akreditasi.svg" alt="Ikon Akreditasi" width={18} height={18} />
                      </div>
                      <span className="text-[12px] font-semibold text-gray-700 whitespace-nowrap">
                        {prodi.dashboard?.accreditation?.grade || "Belum"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/icon/dashboard-masa-berlaku.svg"
                        alt="Ikon Masa Berlaku"
                        width={14}
                        height={14}
                        className="flex-shrink-0 opacity-70"
                      />
                      <span className="text-[12px] text-gray-600 font-medium whitespace-nowrap">
                        {prodi.dashboard?.accreditation?.endDate
                          ? new Date(prodi.dashboard.accreditation.endDate).toLocaleDateString("id-ID")
                          : "-"}
                      </span>
                    </div>
                  </TableCell>

                  {activeTab === "Progress" && (
                    <>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="text-[12px] font-bold text-gray-700 w-7">
                            {prodi.dashboard?.documents?.lkps?.progress || 0}%
                          </span>
                          <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden shadow-inner flex-shrink-0">
                            <div
                              className="h-full bg-gray-900 rounded-full"
                              style={{ width: `${prodi.dashboard?.documents?.lkps?.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-[12px] font-bold text-gray-700 w-7">
                            {prodi.dashboard?.documents?.led?.progress || 0}%
                          </span>
                          <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden shadow-inner flex-shrink-0">
                            <div
                              className="h-full bg-gray-900 rounded-full"
                              style={{ width: `${prodi.dashboard?.documents?.led?.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                    </>
                  )}

                  {activeTab !== "Aman" && (
                    <TableCell className="px-4 py-3 text-right">
                      <span className="text-[14px] font-bold text-gray-900">
                        {prodi.dashboard?.simulationScore || 0}
                      </span>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}