"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { usePenugasanData } from "../hooks/usePenugasanData"
import { KRITERIA_LAM_TEKNIK, KRITERIA_LAM_INFOKOM, KRITERIA_LKPS, makeInitials } from "../utils"
import { useUser } from "@/hooks/useUser"

export function PenugasanDetailView({ targetProdiId }: { targetProdiId: string }) {
  const router = useRouter()
  const { user } = useUser()
  const logic = usePenugasanData(targetProdiId)

  const isGuest = user?.role === 'SUPER_ADMIN' || user?.role === 'PIMPINAN'
  
  // ✅ Penentuan List Kriteria Berdasarkan Pilihan (Termasuk LKPS)
  const kriteriaList = logic.kategoriTugas === "INFOKOM" 
    ? KRITERIA_LAM_INFOKOM 
    : logic.kategoriTugas === "LKPS" 
      ? KRITERIA_LKPS 
      : KRITERIA_LAM_TEKNIK

  const assignedUserIds = new Set(logic.penugasanList.map((p) => p.userId))
  const unassignedCount = logic.anggotaList.filter((a) => !assignedUserIds.has(a.id)).length
  
  const assignedKriteriaSet = new Set<string>()
  logic.penugasanList.forEach((p) => {
      const k = p.kriteria || p.indikator || []
      k.forEach((item: string) => {
        const parts = item.split(':')
        const tmpl = parts.length > 1 ? parts[0] : null
        const id = parts.length > 1 ? parts[1] : item
        if (!tmpl || tmpl === logic.kategoriTugas) {
          assignedKriteriaSet.add(id)
        }
      })
  })
  const totalAssignedKriteria = assignedKriteriaSet.size

  const filteredPenugasan = logic.filterAnggota === "Semua Anggota" 
    ? logic.penugasanList 
    : logic.penugasanList.filter((p) => (p.user?.id ?? p.userId) === logic.filterAnggota)

  return (
    <div className="relative space-y-6 md:space-y-8">
      {logic.toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-semibold text-white transition-all ${logic.toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {logic.toast.message}
        </div>
      )}

      {/* HEADER BARU: Menyatu dengan background */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{logic.prodiName}</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Kelola penugasan kriteria akreditasi kepada anggota Tim Prodi.</p>
        </div>
        {isGuest && (
          <Button variant="outline" onClick={() => router.push('/penugasan')} className="rounded-full h-10 px-5 font-bold text-sm bg-white">
            &larr; Kembali ke Daftar
          </Button>
        )}
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardContent className="px-6 py-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Penugasan</p>
            <p className="text-3xl font-bold text-gray-900 leading-none">{logic.penugasanList.length}</p>
            <p className="text-xs font-medium text-gray-400 mt-2">Aktif</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardContent className="px-6 py-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ditugaskan ({logic.kategoriTugas})</p>
            <p className="text-3xl font-bold text-gray-900 leading-none">{totalAssignedKriteria}</p>
            <p className="text-xs font-medium text-gray-400 mt-2">dari {kriteriaList.length} Kriteria</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardContent className="px-6 py-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Belum Ditugaskan</p>
            <p className="text-3xl font-bold text-red-500 leading-none">{unassignedCount}</p>
            <p className="text-xs font-medium text-gray-400 mt-2">anggota</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardContent className="px-6 py-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Anggota Tim Prodi</p>
            <p className="text-3xl font-bold text-gray-900 leading-none">{logic.anggotaList.length}</p>
            <p className="text-xs font-medium text-gray-400 mt-2">anggota terdaftar</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Form Tugaskan */}
        <Card className="xl:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm h-fit">
          <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white">
            <CardTitle className="text-base font-bold text-gray-900">Tugaskan Anggota</CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-5 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Kategori Penugasan</label>
              <select
                value={logic.kategoriTugas}
                onChange={(e) => {
                  logic.setKategoriTugas(e.target.value as "LAM_TEKNIK" | "INFOKOM" | "LKPS")
                  logic.setSelectedKriteria([])
                }}
                className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50/50 px-4 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="LAM_TEKNIK">LED - LAM Teknik (C1–C7)</option>
                <option value="INFOKOM">LED - LAM Infokom (C1–C6)</option>
                <option value="LKPS">LKPS Kuantitatif (C1-C7)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Anggota Tim Prodi</label>
              <select
                value={logic.selectedUserId}
                onChange={(e) => logic.setSelectedUserId(e.target.value)}
                className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50/50 px-4 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="">-- Pilih anggota --</option>
                {logic.anggotaList
                  .filter((a) => !assignedUserIds.has(a.id))
                  .map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Pilih Kriteria (opsional)</label>
              <div className="space-y-3">
                {kriteriaList.map((k) => (
                  <label key={k.id} className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={logic.selectedKriteria.includes(k.id)}
                      onChange={() => logic.toggleKriteria(k.id)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700 leading-tight group-hover:text-gray-900">
                      <span className="font-bold">{k.id}</span> — {k.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <Button
                onClick={logic.handleTugaskan}
                disabled={!logic.selectedUserId}
                className="w-full bg-black hover:bg-gray-800 text-white rounded-lg h-11 text-sm font-bold shadow-md transition-all disabled:opacity-40"
              >
                Tugaskan Sekarang
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Daftar Penugasan */}
        <Card className="xl:col-span-3 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden h-fit">
          <CardHeader className="px-6 py-5 border-b border-gray-100 flex flex-row items-center justify-between bg-white">
            <CardTitle className="text-lg font-bold text-gray-900">Daftar Penugasan</CardTitle>
            <select
              value={logic.filterAnggota}
              onChange={(e) => logic.setFilterAnggota(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white h-9 px-3 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="Semua Anggota">Semua Anggota</option>
              {logic.penugasanList.map((p) => (
                <option key={p.id} value={p.user?.id ?? p.userId}>{p.user?.name ?? p.userId}</option>
              ))}
            </select>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">Anggota</TableHead>
                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">Ditugaskan</TableHead>
                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPenugasan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="px-6 py-12 text-center text-sm font-medium text-gray-400">
                      Belum ada data penugasan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPenugasan.map((p) => {
                    const name = p.user?.name ?? p.userId
                    const initials = makeInitials(name)
                    const tanggal = new Date(p.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric",
                    })
                    return (
                      <TableRow key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border border-gray-100 shadow-sm">
                              <AvatarFallback className="bg-blue-50 text-blue-600 text-[13px] font-bold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="text-[14px] font-bold text-gray-900 block mb-0.5">{name}</span>
                              <span className="text-[12px] font-medium text-gray-500">{p.user?.email ?? "—"}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-[13px] font-medium text-gray-600">{tanggal}</TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => logic.confirmHapusPenugasan(p.id)}
                            className="h-9 w-9 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Ringkasan Beban Tugas */}
      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-6">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white">
          <CardTitle className="text-lg font-bold text-gray-900">Ringkasan Beban Tim Prodi</CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-6">
          {logic.anggotaList.length === 0 ? (
            <div className="py-8 text-center text-sm font-medium text-gray-400">Belum ada anggota tim prodi.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {logic.anggotaList.map((a) => {
                const assignment = logic.penugasanList.find((p) => p.userId === a.id)
                const assigned = !!assignment
                const assignedKriteria = assignment?.kriteria || assignment?.indikator || []

                return (
                  <div key={a.id} className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="w-10 h-10 border border-white shadow-sm">
                          <AvatarFallback className="bg-blue-50 text-blue-700 text-[13px] font-bold">
                            {makeInitials(a.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-[14px] font-bold text-gray-900 block leading-tight">{a.name}</span>
                          <span className="text-[12px] font-medium text-gray-500 mt-0.5 block">{a.role}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start pt-2 border-t border-gray-200/60">
                      <Badge
                        variant="secondary"
                        className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold shadow-none border-none mb-3 ${
                          assigned ? "bg-green-100 text-green-700" : "bg-red-50 text-red-600"
                        }`}
                      >
                        {assigned ? "Sudah Ditugaskan" : "Belum Ditugaskan"}
                      </Badge>

                      {assigned && (
                        <div className="w-full">
                          {assignedKriteria.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {assignedKriteria.map((raw: string) => {
                                const parts = raw.split(':')
                                const tmplKey = parts.length > 1 ? parts[0] : null
                                const kriteriaId = parts.length > 1 ? parts[1] : raw
                                
                                let templateName = ''
                                let label = ''
                                let badgeClass = ''
                                
                                // ✅ Menangani label dan warna berdasarkan tipe penugasan (Teknik / Infokom / LKPS)
                                if (tmplKey === 'LAM_TEKNIK') {
                                  templateName = 'LAM Teknik'
                                  badgeClass = 'bg-blue-50 text-blue-600'
                                  label = KRITERIA_LAM_TEKNIK.find(x => x.id === kriteriaId)?.label ?? ''
                                } else if (tmplKey === 'INFOKOM') {
                                  templateName = 'LAM Infokom'
                                  badgeClass = 'bg-purple-50 text-purple-600'
                                  label = KRITERIA_LAM_INFOKOM.find(x => x.id === kriteriaId)?.label ?? ''
                                } else if (tmplKey === 'LKPS') {
                                  templateName = 'LKPS'
                                  badgeClass = 'bg-emerald-50 text-emerald-600'
                                  label = KRITERIA_LKPS.find(x => x.id === kriteriaId)?.label ?? ''
                                } else {
                                  // Fallback logic
                                  const teknikMatch = KRITERIA_LAM_TEKNIK.find(x => x.id === kriteriaId)
                                  templateName = teknikMatch ? 'LAM Teknik' : 'LAM Infokom'
                                  badgeClass = teknikMatch ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                  label = (teknikMatch ?? KRITERIA_LAM_INFOKOM.find(x => x.id === kriteriaId))?.label ?? ''
                                }

                                return (
                                  <div key={raw} className="flex flex-col gap-0.5 w-full bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-[12px] text-gray-800 font-bold">
                                      {kriteriaId} {label ? ` — ${label}` : ''}
                                    </span>
                                    <span className={`text-[10px] w-fit px-1.5 py-0.5 rounded font-bold mt-1 ${badgeClass}`}>
                                      {templateName}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-medium italic">Seluruh Kriteria (Akses Umum)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={logic.showHapusDialog} onOpenChange={logic.setShowHapusDialog}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-xl">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-lg font-bold text-gray-900">Hapus Penugasan</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium text-gray-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus penugasan ini? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <DialogFooter className="gap-2 pt-2 border-t border-gray-100 mt-2">
            <Button variant="ghost" onClick={() => logic.setShowHapusDialog(false)} className="rounded-lg h-10 px-5 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100">
              Batal
            </Button>
            <Button onClick={logic.executeHapusPenugasan} className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-10 px-6 text-sm font-bold shadow-md">
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}