import React, { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProdiWithDashboard } from "../hooks/useDashboard"

export function DashboardTable({ prodis }: { prodis: ProdiWithDashboard[] }) {
  const [activeTab, setActiveTab] = useState<"Selesai" | "Progress">("Selesai")
  
  const prodiSelesai = prodis.filter((p) => p.status === "completed")
  const prodiProgress = prodis.filter((p) => p.status === "in_progress")

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
  )
}