"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { TrendingUp, Eye, BookOpen, AlertCircle } from "lucide-react"
import { getStatusLabel } from "../utils"
import { cn } from "@/lib/utils"

export function SimulasiListMain({ logic }: { logic: any }) {
  const router = useRouter()

  const sortedProdis = [...logic.prodis].sort((a, b) =>
    (b.dashboard?.simulationScore || 0) - (a.dashboard?.simulationScore || 0)
  )

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Simulasi Skor Akreditasi</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Pantau skor simulasi akreditasi untuk semua program studi</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-xl shadow-sm border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-5">
            <CardTitle className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Prodi</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="text-3xl font-bold text-gray-900">{logic.prodis.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-5">
            <CardTitle className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Unggul (≥361)</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="text-3xl font-bold text-emerald-600">{logic.prodis.filter((p:any) => p.status === "unggul").length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-5">
            <CardTitle className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Baik Sekali (301-360)</CardTitle>
            <TrendingUp className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="text-3xl font-bold text-sky-600">{logic.prodis.filter((p:any) => p.status === "baik_sekali").length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-5">
            <CardTitle className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Perlu Perhatian (&lt;200)</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="text-3xl font-bold text-red-500">{logic.prodis.filter((p:any) => p.status === "needs_attention").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white">
          <CardTitle className="text-sm font-bold text-gray-900">Daftar Simulasi Skor</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="border-b border-gray-100 hover:bg-transparent">
              <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Program Studi</TableHead>
              <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">Skor Simulasi</TableHead>
              <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">Status</TableHead>
              <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right pr-6 py-4">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProdis.map((prodi) => {
              const score = prodi.dashboard?.simulationScore || 0
              const badge = getStatusLabel(score)
              return (
                <TableRow key={prodi.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="font-bold text-[14px] text-gray-900">{prodi.fullname}</div>
                    <div className="text-[12px] text-gray-500 font-medium">{prodi.degree}</div>
                  </TableCell>
                  <TableCell className="py-4 font-extrabold text-[16px] text-gray-900">{score}</TableCell>
                  <TableCell className="py-4">
                    <span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-md border", badge.class)}>{badge.label}</span>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <Button onClick={() => router.push(`/simulasi-skor/${prodi.id}`)} variant="outline" size="sm" className="gap-2 h-9 rounded-lg font-bold border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
                      <Eye className="w-4 h-4" /> Detail
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}