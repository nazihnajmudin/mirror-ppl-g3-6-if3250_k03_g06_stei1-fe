"use client"

import React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Pencil, ExternalLink, Check, X, Loader2, ArrowRight, Plus } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { downloadCertificate, isLocalCertificate } from "@/lib/api-prodi"
import { useProdiDetailData } from "../hooks/useProdiDetailData"
import { useUser } from "@/hooks/useUser"

export function ProdiDetailView({ targetProdiId, canEdit }: { targetProdiId: string, canEdit: boolean }) {
  const router = useRouter()
  const { user } = useUser()
  const logic = useProdiDetailData(targetProdiId)
  const isGuest = user?.role === 'SUPER_ADMIN' || user?.role === 'PIMPINAN'

  if (logic.isLoadingData) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (logic.error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-red-500 font-bold">{logic.error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-lg h-11 px-6 font-bold">Coba Lagi</Button>
        <Button onClick={() => router.push('/profil-prodi')} variant="ghost" className="rounded-lg h-11 px-6 font-bold">Kembali ke Daftar</Button>
      </div>
    )
  }

  return (
    <div className="relative space-y-6 md:space-y-8">
      {logic.toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-semibold text-white transition-all ${logic.toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {logic.toast.message}
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{logic.prodiData.fullname || "Memuat..."}</h1>
            {logic.prodiData.akreditasi && (
              <Badge className="bg-green-100 text-green-700 border-none shadow-none rounded-md px-2.5 py-0.5 text-xs font-bold">
                {logic.prodiData.akreditasi}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium mt-1">
            <span>{logic.prodiData.degree}</span>
            {logic.prodiData.endDate && (
              <>
                <span>·</span>
                {logic.prodiData.certificateUrl ? (
                  <button onClick={() => logic.setShowSertifikat(true)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors font-semibold">
                    Berlaku s.d. {logic.prodiData.endDate}
                    <ExternalLink className="w-3 h-3" />
                  </button>
                ) : (
                  <span>Berlaku s.d. {logic.prodiData.endDate}</span>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isGuest && (
            <Button variant="outline" onClick={() => router.push('/profil-prodi')} className="rounded-full h-10 px-5 font-bold text-sm bg-white">
              &larr; Kembali ke Daftar
            </Button>
          )}
        </div>
      </header>

      {/* TABS NAVIGATION */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => { logic.setActiveTab("informasi"); logic.handleBatalEdit() }}
          className={`px-4 py-2.5 text-sm font-bold transition-colors border-b-2 -mb-px ${logic.activeTab === "informasi" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Informasi Prodi
        </button>
        <button
          onClick={() => { logic.setActiveTab("tim"); logic.handleBatalEdit() }}
          className={`px-4 py-2.5 text-sm font-bold transition-colors border-b-2 -mb-px ${logic.activeTab === "tim" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Tim Prodi
        </button>
      </div>

      {/* KONTEN TAB: INFORMASI PRODI */}
      {logic.activeTab === "informasi" && (
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-gray-100 flex flex-row items-center justify-between bg-white">
            <CardTitle className="text-lg font-bold text-gray-900">Informasi Program Studi</CardTitle>
            {canEdit && (
              logic.isEditing ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={logic.handleBatalEdit} className="rounded-lg h-9 px-4 text-xs font-bold border-gray-200 text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5" /> Batal
                  </Button>
                  <Button size="sm" onClick={logic.handleSimpanProfil} className="rounded-lg h-9 px-4 text-xs font-bold bg-black hover:bg-gray-800 text-white transition-all flex items-center gap-1.5 shadow-md">
                    <Check className="w-3.5 h-3.5" /> Simpan
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={logic.openEditProfil} className="rounded-lg h-9 px-4 text-xs font-bold border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95 shadow-sm flex items-center gap-2">
                  <Pencil className="w-3.5 h-3.5" /> Edit Profil
                </Button>
              )
            )}
          </CardHeader>
          <CardContent className="px-6 py-6 space-y-8">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Indikator Program Studi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Nama Program Studi</p>
                  {logic.isEditing ? (
                    <Input value={logic.editForm.fullname} onChange={(e) => logic.setEditForm((f) => ({ ...f, fullname: e.target.value }))} className="rounded-lg h-11 bg-gray-50/50 border-gray-200 text-sm" />
                  ) : <p className="text-sm font-semibold text-gray-900">{logic.prodiData.fullname}</p>}
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Nama Kaprodi</p>
                  {logic.isEditing ? (
                    <Input value={logic.editForm.namaKaprodi} onChange={(e) => logic.setEditForm((f) => ({ ...f, namaKaprodi: e.target.value }))} className="rounded-lg h-11 bg-gray-50/50 border-gray-200 text-sm" />
                  ) : <p className="text-sm font-semibold text-gray-900">{logic.prodiData.namaKaprodi || "—"}</p>}
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Jenjang</p>
                  {logic.isEditing ? (
                    <Input value={logic.editForm.degree} onChange={(e) => logic.setEditForm((f) => ({ ...f, degree: e.target.value }))} className="rounded-lg h-11 bg-gray-50/50 border-gray-200 text-sm" />
                  ) : <p className="text-sm font-semibold text-gray-900">{logic.prodiData.degree || "—"}</p>}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Visi &amp; Misi</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Visi</p>
                  {logic.isEditing ? (
                    <textarea value={logic.editForm.visi} onChange={(e) => logic.setEditForm((f) => ({ ...f, visi: e.target.value }))} rows={3} className="w-full rounded-lg bg-gray-50/50 border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none" />
                  ) : <p className="text-sm text-gray-700 leading-relaxed font-medium">{logic.prodiData.visi || "—"}</p>}
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Misi {logic.isEditing && <span className="ml-1 normal-case font-medium text-gray-400">(satu baris per poin)</span>}</p>
                  {logic.isEditing ? (
                    <textarea value={logic.misiText} onChange={(e) => logic.setMisiText(e.target.value)} rows={5} className="w-full rounded-lg bg-gray-50/50 border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none" />
                  ) : logic.prodiData.misi.length > 0 ? (
                    <ol className="list-decimal list-inside space-y-1.5 text-sm font-medium text-gray-700 leading-relaxed">
                      {logic.prodiData.misi.map((item, idx) => <li key={idx}>{item}</li>)}
                    </ol>
                  ) : <p className="text-sm text-gray-500">—</p>}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Akreditasi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Grade Akreditasi</p>
                  {logic.isEditing ? (
                    <Input value={logic.editForm.akreditasi} onChange={(e) => logic.setEditForm((f) => ({ ...f, akreditasi: e.target.value }))} className="rounded-lg h-11 bg-gray-50/50 border-gray-200 text-sm" />
                  ) : <p className="text-sm font-semibold text-gray-900">{logic.prodiData.akreditasi || "—"}</p>}
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Sertifikat</p>
                  {isLocalCertificate(logic.prodiData.certificateUrl) ? (
                    <button onClick={() => downloadCertificate(targetProdiId)} className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-bold flex items-center gap-1.5 h-11">
                      <ExternalLink className="w-4 h-4" /> Unduh Sertifikat
                    </button>
                  ) : logic.isEditing ? (
                    <Input value={logic.editForm.certificateUrl} onChange={(e) => logic.setEditForm((f) => ({ ...f, certificateUrl: e.target.value }))} className="rounded-lg h-11 bg-gray-50/50 border-gray-200 text-sm" placeholder="https://..." />
                  ) : logic.prodiData.certificateUrl ? (
                    <a href={logic.prodiData.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-bold flex items-center gap-1.5 h-11">
                      <ExternalLink className="w-4 h-4" /> Buka Sertifikat
                    </a>
                  ) : <p className="text-sm font-semibold text-gray-900 h-11 flex items-center">—</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KONTEN TAB: TIM PRODI */}
      {logic.activeTab === "tim" && (
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-gray-100 flex flex-row items-center justify-between bg-white">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">Tim Prodi</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{logic.timProdi.length} Anggota</p>
            </div>
            {canEdit && (
              <Button size="sm" onClick={logic.openTambahAnggota} className="bg-black hover:bg-gray-800 text-white rounded-lg h-9 px-4 text-xs font-bold shadow-md flex items-center gap-2">
                <Plus className="w-3.5 h-3.5" /> Tambah Anggota
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">Nama</TableHead>
                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">Email</TableHead>
                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">Role</TableHead>
                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">Status</TableHead>
                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider text-right">Penugasan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logic.timProdi.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400 font-medium">Belum ada anggota tim prodi.</TableCell>
                  </TableRow>
                )}
                {logic.timProdi.map((member) => {
                  const isAssigned = logic.penugasanList.some((p) => p.userId === member.id)
                  return (
                    <TableRow key={member.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border border-gray-100 shadow-sm">
                            <AvatarFallback className="bg-blue-50 text-blue-600 text-[13px] font-bold">{member.initials}</AvatarFallback>
                          </Avatar>
                          <span className="text-[14px] font-bold text-gray-900">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-[13px] text-gray-500 font-medium">{member.email}</TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 rounded-md px-2.5 py-0.5 text-[11px] font-bold shadow-none border-none">
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="secondary" className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold shadow-none border-none ${member.isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                          {member.isActive ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Link href="/penugasan" className="inline-block group">
                          <div className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isAssigned ? "bg-blue-50 text-blue-700 border-blue-200 group-hover:bg-blue-100" : "bg-white text-gray-600 border-gray-200 shadow-sm group-hover:bg-gray-50 group-hover:text-gray-900"}`}>
                            {isAssigned ? "Lihat Penugasan" : "Atur Penugasan"}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* MODAL SERTIFIKAT */}
      <Dialog open={logic.showSertifikat} onOpenChange={logic.setShowSertifikat}>
        <DialogContent className="max-w-xl bg-white rounded-xl shadow-xl">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-lg font-bold text-gray-900">Sertifikat Akreditasi — {logic.prodiData.fullname}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status Akreditasi</p>
                <Badge className="bg-green-50 text-green-600 border-none shadow-none rounded-md px-3 py-1 text-sm font-bold">{logic.prodiData.akreditasi}</Badge>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Berlaku Sampai</p>
                <p className="text-sm font-bold text-gray-900 h-7 flex items-center">{logic.prodiData.endDate}</p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center py-12 gap-3">
              <p className="text-sm text-gray-500 font-medium">Sertifikat akreditasi tersedia di tautan berikut:</p>
              {isLocalCertificate(logic.prodiData.certificateUrl) ? (
                <Button onClick={() => downloadCertificate(targetProdiId)} variant="outline" className="rounded-lg h-11 px-6 font-bold text-sm bg-white border-blue-200 text-blue-700 hover:bg-blue-50">
                  <ExternalLink className="w-4 h-4 mr-2" /> Unduh Sertifikat
                </Button>
              ) : (
                <a href={logic.prodiData.certificateUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="rounded-lg h-11 px-6 font-bold text-sm bg-white border-blue-200 text-blue-700 hover:bg-blue-50">
                    <ExternalLink className="w-4 h-4 mr-2" /> Buka Sertifikat
                  </Button>
                </a>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL TAMBAH ANGGOTA */}
      <Dialog open={logic.showTambahAnggota} onOpenChange={logic.setShowTambahAnggota}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-lg font-bold text-gray-900">Tambah Anggota Tim Prodi</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            {logic.formErrors.general && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-[13px] font-bold rounded-lg">{logic.formErrors.general}</div>
            )}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Nama</Label>
              <Input placeholder="Masukkan nama lengkap" value={logic.newNama} onChange={(e) => { logic.setNewNama(e.target.value); logic.setFormErrors((prev) => ({ ...prev, name: undefined })) }} className={`h-11 rounded-lg text-sm bg-gray-50/50 ${logic.formErrors.name ? "border-red-500" : "border-gray-200"}`} />
              {logic.formErrors.name && <p className="text-[11px] font-bold text-red-600">{logic.formErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Email</Label>
              <Input type="email" placeholder="nama@institusi.ac.id" value={logic.newEmail} onChange={(e) => { logic.setNewEmail(e.target.value); logic.setFormErrors((prev) => ({ ...prev, email: undefined })) }} className={`h-11 rounded-lg text-sm bg-gray-50/50 ${logic.formErrors.email ? "border-red-500" : "border-gray-200"}`} />
              {logic.formErrors.email && <p className="text-[11px] font-bold text-red-600">{logic.formErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Role</Label>
              <select value={logic.newRole} onChange={(e) => logic.setNewRole(e.target.value)} className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50/50 px-4 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300">
                <option value="TIM_PRODI">Tim Prodi</option>
                <option value="KAPRODI">Kaprodi</option>
              </select>
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Status</Label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <input type="radio" name="status" checked={logic.newIsActive === true} onChange={() => logic.setNewIsActive(true)} className="h-4 w-4 border-gray-300 text-blue-600 cursor-pointer" /> Aktif
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <input type="radio" name="status" checked={logic.newIsActive === false} onChange={() => logic.setNewIsActive(false)} className="h-4 w-4 border-gray-300 text-blue-600 cursor-pointer" /> Tidak Aktif
                </label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={() => logic.setShowTambahAnggota(false)} className="rounded-lg h-10 px-5 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100">Batal</Button>
            <Button onClick={logic.handleTambahAnggota} className="bg-black hover:bg-gray-800 text-white rounded-lg h-10 px-6 text-sm font-bold shadow-md">Tambah</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}