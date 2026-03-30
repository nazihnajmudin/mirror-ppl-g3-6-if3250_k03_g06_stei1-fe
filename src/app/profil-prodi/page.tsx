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


interface ProdiData {
  nama: string
  akreditasi: string
  jenjang: string
  berlakuSampai: string
  namaKaprodi: string
  visi: string
  misi: string[]
  skorAkreditasi: number
  targetSkor: number
  sertifikatUrl: string
}

interface TimProdiMember {
  id: string
  nama: string
  email: string
  role: string
  indikator: string[]
  status: "Aktif" | "Tidak Aktif"
  initials: string
}

const initialProdiData: ProdiData = {
  nama: "Teknik Informatika",
  akreditasi: "Unggul",
  jenjang: "Sarjana (S1)",
  berlakuSampai: "28 November 2027",
  namaKaprodi: "Michael Levi",
  visi: "To be a higher educational institution of international repute in science and technology, particularly in the field of informatics and computing, that contributes significantly to national development.",
  misi: [
    "To provide high quality education in informatics and computing that is relevant to the needs of industry and society.",
    "To promote research and innovation in informatics and computing that contributes to the advancement of knowledge and technology.",
    "To disseminate knowledge and technology through community service and collaboration with industry and government.",
  ],
  skorAkreditasi: 350,
  targetSkor: 500,
  sertifikatUrl: "https://banpt.or.id/sertifikat/sample.pdf",
}

const initialTimProdi: TimProdiMember[] = [
  { id: "1", nama: "Siti", email: "siti@itb.ac.id", role: "Tim Prodi", indikator: ["K1", "K2"], status: "Aktif", initials: "SI" },
  { id: "2", nama: "Agus", email: "agus@itb.ac.id", role: "Tim Prodi", indikator: ["K3", "K4"], status: "Aktif", initials: "AG" },
  { id: "3", nama: "Kevin", email: "kevin@itb.ac.id", role: "Tim Prodi", indikator: ["K5", "K6"], status: "Tidak Aktif", initials: "KE" },
]

export default function ProfilProdiPage() {
  const [activeTab, setActiveTab] = React.useState<"informasi" | "tim">("informasi")
  const [prodiData, setProdiData] = React.useState<ProdiData>(initialProdiData)
  const [timProdi, setTimProdi] = React.useState<TimProdiMember[]>(initialTimProdi)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editForm, setEditForm] = React.useState<ProdiData>(prodiData)
  const [misiText, setMisiText] = React.useState(prodiData.misi.join("\n"))
  const [showSertifikat, setShowSertifikat] = React.useState(false)
  const [showTambahAnggota, setShowTambahAnggota] = React.useState(false)
  const [newNama, setNewNama] = React.useState("")
  const [newEmail, setNewEmail] = React.useState("")
  const [newRole, setNewRole] = React.useState("Tim Prodi")
  const [newStatus, setNewStatus] = React.useState<"Aktif" | "Tidak Aktif">("Aktif")
  const openEditProfil = () => {
    setEditForm(prodiData)
    setMisiText(prodiData.misi.join("\n"))
    setIsEditing(true)
  }

  const handleSimpanProfil = () => {
    setProdiData({
      ...editForm,
      misi: misiText.split("\n").map((s) => s.trim()).filter(Boolean),
    })
    setIsEditing(false)
  }

  const handleBatalEdit = () => {
    setIsEditing(false)
  }

  const openTambahAnggota = () => {
    setNewNama("")
    setNewEmail("")
    setNewRole("Tim Prodi")
    setNewStatus("Aktif")
    setShowTambahAnggota(true)
  }

  const handleTambahAnggota = () => {
    if (!newNama.trim() || !newEmail.trim()) return
    const initials = newNama.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    setTimProdi((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        nama: newNama.trim(),
        email: newEmail.trim(),
        role: newRole,
        indikator: [],
        status: newStatus,
        initials,
      },
    ])
    setShowTambahAnggota(false)
  }

  const handleHapusAnggota = (id: string) => {
    setTimProdi((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className="min-h-screen flex bg-[#F9FAFB]">
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
                TI
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{prodiData.nama}</h1>
                  <Badge className="bg-green-50 text-green-600 border-none shadow-none rounded-md px-2.5 py-0.5 text-xs font-bold">
                    {prodiData.akreditasi}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <span>{prodiData.jenjang}</span>
                  <span>·</span>
                  {prodiData.sertifikatUrl ? (
                    <button
                      onClick={() => setShowSertifikat(true)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline transition-colors font-medium"
                    >
                      Berlaku s.d. {prodiData.berlakuSampai}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : (
                    <span>Berlaku s.d. {prodiData.berlakuSampai}</span>
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
              {/* Indikator Program Studi */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Indikator Program Studi</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Nama Program Studi</p>
                    {isEditing ? (
                      <Input value={editForm.nama} onChange={(e) => setEditForm((f) => ({ ...f, nama: e.target.value }))} className="rounded-lg border-gray-200 text-sm h-9" />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{prodiData.nama}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Nama Kaprodi</p>
                    {isEditing ? (
                      <Input value={editForm.namaKaprodi} onChange={(e) => setEditForm((f) => ({ ...f, namaKaprodi: e.target.value }))} className="rounded-lg border-gray-200 text-sm h-9" />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{prodiData.namaKaprodi}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Jenjang</p>
                    {isEditing ? (
                      <Input value={editForm.jenjang} onChange={(e) => setEditForm((f) => ({ ...f, jenjang: e.target.value }))} className="rounded-lg border-gray-200 text-sm h-9" />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{prodiData.jenjang}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Visi & Misi */}
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
                      <p className="text-sm text-gray-700 leading-relaxed">{prodiData.visi}</p>
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
                    ) : (
                      <ol className="list-decimal list-inside space-y-1.5">
                        {prodiData.misi.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-700 leading-relaxed">{item}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Akreditasi */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Akreditasi</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Skor Akreditasi</p>
                    {isEditing ? (
                      <Input type="number" value={editForm.skorAkreditasi} onChange={(e) => setEditForm((f) => ({ ...f, skorAkreditasi: Number(e.target.value) }))} className="rounded-lg border-gray-200 text-sm h-9" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{prodiData.skorAkreditasi}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Target Skor Akreditasi</p>
                    {isEditing ? (
                      <Input type="number" value={editForm.targetSkor} onChange={(e) => setEditForm((f) => ({ ...f, targetSkor: Number(e.target.value) }))} className="rounded-lg border-gray-200 text-sm h-9" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{prodiData.targetSkor}</p>
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
                    <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">INDIKATOR</TableHead>
                    <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">STATUS</TableHead>
                    <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider text-right">AKSI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timProdi.map((member) => (
                    <TableRow key={member.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 border border-gray-100 shadow-sm">
                            <AvatarFallback className="bg-blue-50 text-blue-600 text-[12px] font-bold">{member.initials}</AvatarFallback>
                          </Avatar>
                          <span className="text-[14px] font-semibold text-gray-900">{member.nama}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-[13px] text-gray-500">{member.email}</TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 rounded-md px-2.5 py-0.5 text-[11px] font-bold shadow-none border-none">
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {member.indikator.map((k) => (
                            <Badge key={k} variant="secondary" className="bg-gray-100 text-gray-700 rounded-md px-2 py-0.5 text-[11px] font-bold shadow-none border-none">
                              {k}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge
                          variant="secondary"
                          className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold shadow-none border-none ${
                            member.status === "Aktif" ? "bg-green-50 text-green-600" : "bg-red-100 text-red-500"
                          }`}
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleHapusAnggota(member.id)}
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

      {/* Sertifikat Akreditasi */}
      <Dialog open={showSertifikat} onOpenChange={setShowSertifikat}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">
              Sertifikat Akreditasi — {prodiData.nama}
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
                <p className="text-sm font-semibold text-gray-900">{prodiData.berlakuSampai}</p>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center justify-center py-12 gap-3">
              <p className="text-sm text-gray-500">Sertifikat akreditasi tersedia di tautan berikut:</p>
              <a
                href={prodiData.sertifikatUrl}
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

      {/* Tambah Anggota */}
      <Dialog open={showTambahAnggota} onOpenChange={setShowTambahAnggota}>
        <DialogContent className="max-w-lg bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">Tambah Anggota Tim Prodi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama</Label>
              <Input
                placeholder="Masukkan nama"
                value={newNama}
                onChange={(e) => setNewNama(e.target.value)}
                className="rounded-lg border-gray-200 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</Label>
              <Input
                type="email"
                placeholder="nama@itb.ac.id"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="rounded-lg border-gray-200 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</Label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option>Tim Prodi</option>
                <option>Kaprodi</option>
                <option>Dosen</option>
              </select>
            </div>


            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</Label>
              <div className="flex gap-4">
                {(["Aktif", "Tidak Aktif"] as const).map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={newStatus === s}
                      onChange={() => setNewStatus(s)}
                      className="h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-400 cursor-pointer"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowTambahAnggota(false)} className="rounded-lg border-gray-200 text-sm font-semibold">
              Batal
            </Button>
            <Button
              onClick={handleTambahAnggota}
              disabled={!newNama.trim() || !newEmail.trim()}
              className="bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-semibold disabled:opacity-40"
            >
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}