"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2, Save, TrendingUp, FileText, CheckCircle, Edit3 } from "lucide-react"
import { getScoreColor, getStatusLabel } from "../utils"
import { cn } from "@/lib/utils"

export function SimulasiDetailMain({ user, logic }: { user: any, logic: any }) {
  const router = useRouter()
  const scoreBadge = getStatusLabel(logic.simulation.totalScore)

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="text-gray-500 hover:text-gray-900 px-0 h-8 gap-2 font-bold text-xs mb-2">
            &larr; Kembali
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Simulasi Skor Akreditasi</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">{logic.prodi.fullname} - {logic.prodi.degree}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-xl shadow-sm border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-5">
            <CardTitle className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Skor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className={cn("text-3xl font-bold", getScoreColor(logic.simulation.totalScore))}>{logic.simulation.totalScore}</div>
            <div className="mt-2"><span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border", scoreBadge.class)}>{scoreBadge.label}</span></div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-5">
            <CardTitle className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Kuantitatif</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className={cn("text-3xl font-bold", getScoreColor(logic.simulation.quantitativeScore))}>{logic.simulation.quantitativeScore}</div>
            <p className="text-[11px] font-bold text-gray-400 mt-2">BOBOT 70%</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-5">
            <CardTitle className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Kualitatif</CardTitle>
            <Edit3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className={cn("text-3xl font-bold", getScoreColor(logic.simulation.qualitativeScore))}>{logic.simulation.qualitativeScore || 0}</div>
            <p className="text-[11px] font-bold text-gray-400 mt-2">BOBOT 30%</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-5">
            <CardTitle className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Terakhir Update</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="text-[14px] font-bold text-gray-900">{new Date(logic.simulation.updatedAt).toLocaleDateString('id-ID')}</div>
            <p className="text-[12px] font-medium text-gray-500 mt-1">{new Date(logic.simulation.updatedAt).toLocaleTimeString('id-ID')}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white">
          <CardTitle className="text-sm font-bold text-gray-900">Detail Indikator</CardTitle>
          <p className="text-xs text-gray-500 font-medium">Skor kuantitatif dihitung dari penyelesaian LKPS (70%) dan jumlah eviden (30%)</p>
        </CardHeader>
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="border-b border-gray-100 hover:bg-transparent">
              <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Kode</TableHead>
              <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4 min-w-[200px]">Indikator</TableHead>
              <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4 text-center">Kuantitatif</TableHead>
              <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4 text-center">Kualitatif</TableHead>
              <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4 min-w-[200px]">Catatan</TableHead>
              <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4 text-center">Total</TableHead>
              <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">Progres Sheet</TableHead>
              <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4 text-center">Eviden</TableHead>
              {user?.role === 'KAPRODI' && <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right pr-6 py-4">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {logic.simulation.indicators.map((indicator: any) => (
              <TableRow key={indicator.code} className="border-b border-gray-50 hover:bg-gray-50/40">
                <TableCell className="px-6 py-4 font-bold text-[13px] text-gray-900">{indicator.code}</TableCell>
                <TableCell className="py-4 text-[13px] font-medium text-gray-700">{indicator.name}</TableCell>
                <TableCell className="py-4 text-center"><span className={cn("font-extrabold text-[14px]", getScoreColor(indicator.quantitativeScore))}>{indicator.quantitativeScore}</span></TableCell>
                <TableCell className="py-4 text-center">
                  {indicator.qualitativeScore !== null ? <span className={cn("font-extrabold text-[14px]", getScoreColor(indicator.qualitativeScore))}>{indicator.qualitativeScore}</span> : <span className="text-gray-300 font-medium text-[13px]">0</span>}
                </TableCell>
                <TableCell className="py-4"><p className="text-[12px] font-medium text-gray-500 line-clamp-2">{indicator.qualitativeNote || "-"}</p></TableCell>
                <TableCell className="py-4 text-center"><span className={cn("font-extrabold text-[14px]", getScoreColor(indicator.totalScore))}>{indicator.totalScore}</span></TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${indicator.sheetCompletion}%` }}/></div>
                    <span className="text-[12px] font-bold text-gray-700">{indicator.sheetCompletion}%</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-center"><span className="text-[11px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded">{indicator.evidenceCount}</span></TableCell>
                {user?.role === 'KAPRODI' && (
                  <TableCell className="text-right pr-6 py-4">
                    <Button onClick={() => logic.handleEditQualitative(indicator)} variant="outline" size="sm" className="gap-2 h-8 rounded-lg font-bold border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"><Edit3 className="w-3.5 h-3.5" /> Edit</Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={logic.editDialogOpen} onOpenChange={logic.setEditDialogOpen}>
        <DialogContent className="bg-white rounded-xl shadow-xl border-gray-200 p-0 overflow-hidden sm:max-w-md">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <DialogTitle className="text-lg font-bold text-gray-900">Edit Skor Kualitatif</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <div>
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Indikator</Label>
              <Input className="h-10 bg-gray-100 border-gray-200 text-gray-600 font-bold" value={`${logic.editingIndicator?.code} - ${logic.editingIndicator?.name}`} disabled />
            </div>
            <div>
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Skor Kualitatif (0-100)</Label>
              <Input className={cn("h-11 bg-white font-bold", logic.scoreError && "border-red-500 focus-visible:ring-red-500")} type="number" min="0" max="100" value={logic.qualitativeScore} onChange={(e) => { logic.setQualitativeScore(e.target.value); logic.validateScore(e.target.value); }} placeholder="0" />
              {logic.scoreError && <p className="text-[11px] font-bold text-red-600 mt-1.5">{logic.scoreError}</p>}
            </div>
            <div>
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Catatan Tambahan</Label>
              <Textarea className="bg-white resize-none font-medium text-sm" value={logic.qualitativeNote} onChange={(e) => logic.setQualitativeNote(e.target.value)} placeholder="Tuliskan catatan di sini..." rows={3} />
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-3">
            <Button onClick={() => logic.setEditDialogOpen(false)} variant="outline" className="font-bold border-gray-300 text-gray-700 hover:bg-gray-100" disabled={logic.saving}>Batal</Button>
            <Button onClick={logic.handleSaveQualitative} disabled={logic.saving || !!logic.scoreError || (!logic.qualitativeScore.trim() && !logic.qualitativeNote.trim())} className="bg-black text-white hover:bg-gray-800 font-bold shadow-sm">
              {logic.saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}