"use client"

import * as React from "react"
import { Plus, Pencil, Trash2, ExternalLink, Check, X } from "lucide-react"
import { HeaderKaprodi } from "@/components/layout/header-kaprodi"
import { SidebarProdi } from "@/components/layout/sidebar-prodi"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  getCurrentUser,
  getProdiById,
  getAccreditation,
  updateProdi,
  upsertAccreditation,
  addProdiMember,
  deleteProdiMember,
  getProdiMembers,
} from "@/lib/api-prodi"

interface ProdiData {
  fullname: string
  akreditasi: string
  degree: string
  endDate: string
  namaKaprodi: string
  visi: string
  misi: string[]
  skorAkreditasi: number
  targetSkor: number
  certificateUrl: string
}

interface TimProdiMember {
  id: string
  name: string
  email: string
  role: string
  indikator: string[]
  isActive: boolean
  initials: string
}

const DEFAULT_PRODI_ID = "prodi-if"

function makeInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

export default function ProfilProdiPage() {
  const [activeTab, setActiveTab] = React.useState<"informasi" | "tim">("informasi")
  const [prodiId, setProdiId] = React.useState<string>(DEFAULT_PRODI_ID)
  const [prodiData, setProdiData] = React.useState<ProdiData>({
    fullname: "",
    akreditasi: "",
    degree: "",
    endDate: "",
    namaKaprodi: "",
    visi: "",
    misi: [],
    skorAkreditasi: 0,
    targetSkor: 0,
    certificateUrl: "",
  })
  const [timProdi, setTimProdi] = React.useState<TimProdiMember[]>([])
  const [isEditing, setIsEditing] = React.useState(false)
  const [editForm, setEditForm] = React.useState<ProdiData>(prodiData)
  const [misiText, setMisiText] = React.useState("")
  const [showSertifikat, setShowSertifikat] = React.useState(false)
  const [showTambahAnggota, setShowTambahAnggota] = React.useState(false)
  const [showHapusDialog, setShowHapusDialog] = React.useState(false)
  const [memberToDelete, setMemberToDelete] = React.useState<string | null>(null)
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null)
  const [newNama, setNewNama] = React.useState("")
  const [newEmail, setNewEmail] = React.useState("")
  const [newRole, setNewRole] = React.useState("TIM_PRODI")
  const [newIsActive, setNewIsActive] = React.useState(true)
  const [formErrors, setFormErrors] = React.useState<{ name?: string; email?: string; general?: string }>({})

  React.useEffect(() => {
    const init = async () => {
      try {
        const me = await getCurrentUser()
        const resolvedProdiId = me.prodiId || DEFAULT_PRODI_ID
        setProdiId(resolvedProdiId)
        await loadProdiData(resolvedProdiId)
        await loadTimProdi(resolvedProdiId)
      } catch {
        await loadProdiData(DEFAULT_PRODI_ID)
        await loadTimProdi(DEFAULT_PRODI_ID)
      }
    }
    init()
  }, [])

  const loadProdiData = async (id: string) => {
    try {
      const prodi = await getProdiById(id)
      const accreditation = await getAccreditation(id)

      setProdiData((prev) => ({
        ...prev,
        fullname: prodi.fullname,
        degree: prodi.degree ?? "",
        akreditasi: accreditation?.grade ?? "",
        endDate: accreditation?.endDate ? new Date(accreditation.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "",
        certificateUrl: accreditation?.certificateUrl ?? "",
      }))
    } catch {
    }
  }

  const loadTimProdi = async (id: string) => {
    try {
      const members = await getProdiMembers(id)
      setTimProdi(
        members.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role,
          indikator: [],
          isActive: m.isActive !== false,
          initials: makeInitials(m.name),
        }))
      )
    } catch {
    }
  }

  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showNotification = (message: string, type: "success" | "error") => {
    setToast({ message, type })
  }

  const openEditProfil = () => {
    setEditForm(prodiData)
    setMisiText(prodiData.misi.join("\n"))
    setIsEditing(true)
  }

  const handleSimpanProfil = async () => {
    try {
      await updateProdi(prodiId, { fullname: editForm.fullname, degree: editForm.degree })
      if (editForm.akreditasi || editForm.certificateUrl) {
        await upsertAccreditation(prodiId, { grade: editForm.akreditasi, certificateUrl: editForm.certificateUrl })
      }
      setProdiData({
        ...editForm,
        misi: misiText.split("\n").map((s) => s.trim()).filter(Boolean),
      })
      setIsEditing(false)
      showNotification("Profil berhasil diperbarui", "success")
    } catch (error: any) {
      showNotification(error?.response?.data?.message || "Gagal menyimpan profil", "error")
    }
  }

  const handleBatalEdit = () => {
    setIsEditing(false)
  }

  const openTambahAnggota = () => {
    setNewNama("")
    setNewEmail("")
    setNewRole("TIM_PRODI")
    setNewIsActive(true)
    setFormErrors({})
    setShowTambahAnggota(true)
  }

  const handleTambahAnggota = async () => {
    if (!newNama.trim() || !newEmail.trim()) {
      setFormErrors({ general: "Nama dan Email wajib diisi" })
      return
    }

    setFormErrors({})

    try {
      const savedUser = await addProdiMember({
        name: newNama.trim(),
        email: newEmail.trim(),
        role: newRole,
        password: "password123",
        prodiId,
      })

      const savedName = savedUser.name || newNama
      setTimProdi((prev) => [
        ...prev,
        {
          id: savedUser.id,
          name: savedName,
          email: savedUser.email,
          role: savedUser.role,
          indikator: [],
          isActive: true,
          initials: makeInitials(savedName),
        },
      ])

      setShowTambahAnggota(false)
      setNewNama("")
      setNewEmail("")
      showNotification("Berhasil menambahkan anggota baru!", "success")
    } catch (error: any) {
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const newErrors: Record<string, string> = {}
        error.response.data.details.forEach((e: any) => {
          if (e.field) newErrors[e.field] = e.message
        })
        setFormErrors(newErrors)
      } else {
        setFormErrors({ general: error.response?.data?.message || error.message })
      }
      showNotification("Gagal menambahkan anggota", "error")
    }
  }

  const confirmHapusAnggota = (id: string) => {
    setMemberToDelete(id)
    setShowHapusDialog(true)
  }

  const executeHapusAnggota = async () => {
    if (!memberToDelete) return

    try {
      await deleteProdiMember(memberToDelete)
      setTimProdi((prev) => prev.filter((m) => m.id !== memberToDelete))
      showNotification("Anggota berhasil dihapus", "success")
    } catch (error: any) {
      showNotification(error?.response?.data?.message || "Gagal menghapus anggota", "error")
    } finally {
      setShowHapusDialog(false)
      setMemberToDelete(null)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F9FAFB] relative">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-semibold text-white transition-all ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="w-[240px] fixed h-full bg-white border-r border-gray-200 hidden md:flex items-center justify-center text-gray-400 text-sm font-medium">
        <SidebarProdi />
      </div>

      <main className="flex-grow md:ml-[240px] p-8 min-h-screen">
        <HeaderKaprodi />

        {/* Header Card */}
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm mb-6">
          <CardContent className="px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold">
                {prodiData.fullname ? prodiData.fullname.slice(0, 2).toUpperCase() : "—"}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{prodiData.fullname || "Memuat..."}</h1>
                  {prodiData.akreditasi && (
                    <Badge className="bg-green-50 text-green-600 border-none shadow-none rounded-md px-2.5 py-0.5 text-xs font-bold">
                      {prodiData.akreditasi}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <span>{prodiData.degree}</span>
                  {prodiData.endDate && (
                    <>
                      <span>·</span>
                      {prodiData.certificateUrl ? (
                        <button
                          onClick={() => setShowSertifikat(true)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline transition-colors font-medium"
                        >
                          Berlaku s.d. {prodiData.endDate}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : (
                        <span>Berlaku s.d. {prodiData.endDate}</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-1 mb-6 border-b border-gray-200">
          <button
            onClick={() => { setActiveTab("informasi"); setIsEditing(false) }}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "informasi"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Informasi Prodi
          </button>
          <button
            onClick={() => { setActiveTab("tim"); setIsEditing(false) }}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "tim"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Tim Prodi
          </button>
        </div>

        {/* Informasi Prodi */}
        {activeTab === "informasi" && (
          <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <CardHeader className="px-6 py-5 border-b border-gray-100 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold text-gray-900">Informasi Program Studi</CardTitle>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBatalEdit}
                    className="rounded-lg h-9 px-4 text-xs font-bold border-gray-200 text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSimpanProfil}
                    className="rounded-lg h-9 px-4 text-xs font-bold bg-black hover:bg-gray-800 text-white transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Simpan
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openEditProfil}
                  className="rounded-lg h-9 px-4 text-xs font-bold border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95 shadow-sm flex items-center gap-2"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Profil
                </Button>
              )}
            </CardHeader>
            <CardContent className="px-6 py-6 space-y-8">
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Indikator Program Studi</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Nama Program Studi</p>
                    {isEditing ? (
                      <Input value={editForm.fullname} onChange={(e) => setEditForm((f) => ({ ...f, fullname: e.target.value }))} className="rounded-lg border-gray-200 text-sm h-9" />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{prodiData.fullname}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Nama Kaprodi</p>
                    {isEditing ? (
                      <Input value={editForm.namaKaprodi} onChange={(e) => setEditForm((f) => ({ ...f, namaKaprodi: e.target.value }))} className="rounded-lg border-gray-200 text-sm h-9" />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{prodiData.namaKaprodi || "—"}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Jenjang</p>
                    {isEditing ? (
                      <Input value={editForm.degree} onChange={(e) => setEditForm((f) => ({ ...f, degree: e.target.value }))} className="rounded-lg border-gray-200 text-sm h-9" />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{prodiData.degree || "—"}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Visi &amp; Misi</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Visi</p>
                    {isEditing ? (
                      <textarea
                        value={editForm.visi}
                        onChange={(e) => setEditForm((f) => ({ ...f, visi: e.target.value }))}
                        rows={3}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                      />
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed">{prodiData.visi || "—"}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Misi{isEditing && <span className="ml-1 normal-case font-normal text-gray-400">(satu baris per poin)</span>}
                    </p>
                    {isEditing ? (
                      <textarea
                        value={misiText}
                        onChange={(e) => setMisiText(e.target.value)}
                        rows={5}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                      />
                    ) : prodiData.misi.length > 0 ? (
                      <ol className="list-decimal list-inside space-y-1.5">
                        {prodiData.misi.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-700 leading-relaxed">{item}</li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-sm text-gray-500">—</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Akreditasi</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Grade Akreditasi</p>
                    {isEditing ? (
                      <Input value={editForm.akreditasi} onChange={(e) => setEditForm((f) => ({ ...f, akreditasi: e.target.value }))} className="rounded-lg border-gray-200 text-sm h-9" />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{prodiData.akreditasi || "—"}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">URL Sertifikat</p>
                    {isEditing ? (
                      <Input value={editForm.certificateUrl} onChange={(e) => setEditForm((f) => ({ ...f, certificateUrl: e.target.value }))} className="rounded-lg border-gray-200 text-sm h-9" placeholder="https://..." />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{prodiData.certificateUrl || "—"}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tim Prodi */}
        {activeTab === "tim" && (
          <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <CardHeader className="px-6 py-5 border-b border-gray-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Tim Prodi</CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">{timProdi.length} Anggota</p>
              </div>
              <Button
                onClick={openTambahAnggota}
                className="bg-black hover:bg-gray-800 text-white rounded-full px-5 py-2 text-sm flex items-center gap-2 transition-all active:scale-95 shadow-md"
              >
                <Plus className="w-4 h-4" />
                Tambah Anggota
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="hover:bg-transparent border-b border-gray-100">
                    <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">NAMA</TableHead>
                    <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">EMAIL</TableHead>
                    <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">ROLE</TableHead>
                    <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">STATUS</TableHead>
                    <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider text-right">AKSI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timProdi.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                        Belum ada anggota tim prodi.
                      </TableCell>
                    </TableRow>
                  )}
                  {timProdi.map((member) => (
                    <TableRow key={member.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 border border-gray-100 shadow-sm">
                            <AvatarFallback className="bg-blue-50 text-blue-600 text-[12px] font-bold">{member.initials}</AvatarFallback>
                          </Avatar>
                          <span className="text-[14px] font-semibold text-gray-900">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-[13px] text-gray-500">{member.email}</TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 rounded-md px-2.5 py-0.5 text-[11px] font-bold shadow-none border-none">
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge
                          variant="secondary"
                          className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold shadow-none border-none ${
                            member.isActive ? "bg-green-50 text-green-600" : "bg-red-100 text-red-500"
                          }`}
                        >
                          {member.isActive ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmHapusAnggota(member.id)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Dialog Sertifikat Akreditasi */}
      <Dialog open={showSertifikat} onOpenChange={setShowSertifikat}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">
              Sertifikat Akreditasi — {prodiData.fullname}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Status Akreditasi</p>
                <Badge className="bg-green-50 text-green-600 border-none shadow-none rounded-md px-2.5 py-0.5 text-xs font-bold">
                  {prodiData.akreditasi}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Berlaku Sampai</p>
                <p className="text-sm font-semibold text-gray-900">{prodiData.endDate}</p>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center justify-center py-12 gap-3">
              <p className="text-sm text-gray-500">Sertifikat akreditasi tersedia di tautan berikut:</p>
              <a
                href={prodiData.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                Buka Sertifikat
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Tambah Anggota */}
      <Dialog open={showTambahAnggota} onOpenChange={setShowTambahAnggota}>
        <DialogContent className="max-w-lg bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">Tambah Anggota Tim Prodi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {formErrors.general && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium rounded-lg">
                {formErrors.general}
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama</Label>
              <Input
                placeholder="Masukkan nama"
                value={newNama}
                onChange={(e) => { setNewNama(e.target.value); setFormErrors((prev) => ({ ...prev, name: undefined })) }}
                className={`rounded-lg text-sm ${formErrors.name ? "border-red-500 focus-visible:ring-red-500" : "border-gray-200"}`}
              />
              {formErrors.name && <p className="text-[11px] font-medium text-red-500">{formErrors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</Label>
              <Input
                type="email"
                placeholder="nama@itb.ac.id"
                value={newEmail}
                onChange={(e) => { setNewEmail(e.target.value); setFormErrors((prev) => ({ ...prev, email: undefined })) }}
                className={`rounded-lg text-sm ${formErrors.email ? "border-red-500 focus-visible:ring-red-500" : "border-gray-200"}`}
              />
              {formErrors.email && <p className="text-[11px] font-medium text-red-500">{formErrors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</Label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="TIM_PRODI">Tim Prodi</option>
                <option value="KAPRODI">Kaprodi</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="radio" name="status" checked={newIsActive === true} onChange={() => setNewIsActive(true)} className="h-4 w-4 border-gray-300 cursor-pointer" />
                  Aktif
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="radio" name="status" checked={newIsActive === false} onChange={() => setNewIsActive(false)} className="h-4 w-4 border-gray-300 cursor-pointer" />
                  Tidak Aktif
                </label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowTambahAnggota(false)} className="rounded-lg border-gray-200 text-sm font-semibold">
              Batal
            </Button>
            <Button onClick={handleTambahAnggota} className="bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-semibold">
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={showHapusDialog} onOpenChange={setShowHapusDialog}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Apakah Anda yakin ingin menghapus anggota ini dari Tim Prodi? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowHapusDialog(false)} className="rounded-lg border-gray-200 text-sm font-semibold">
              Batal
            </Button>
            <Button onClick={executeHapusAnggota} className="bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold">
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}