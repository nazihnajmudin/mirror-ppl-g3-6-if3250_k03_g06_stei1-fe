"use client"

import * as React from "react"
import { Plus, Pencil, ExternalLink, Check, X, BookOpen, Eye, Loader2, ArrowRight } from "lucide-react"
import { HeaderKaprodi } from "@/components/layout/header-kaprodi"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

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
  getProdiMembers,
  getPenugasan,
  downloadCertificate,
  isLocalCertificate,
} from "@/lib/api-prodi"
import apiClient from "@/lib/api-client"
import { useUser } from "@/hooks/useUser"

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

// ============================================================================
// 1. KOMPONEN TABEL PRODI
// ============================================================================
function ProdiListView() {
    const router = useRouter();
    const [prodis, setProdis] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchProdis = async () => {
            try {
                const response = await apiClient.get('/prodi/my-prodi');
                setProdis(response.data.data || []);
            } catch (error) {
                console.error("Gagal mengambil data prodi", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProdis();
    }, []);

    if (isLoading) return <div className="p-8 text-gray-500">Memuat daftar program studi...</div>;

    return (
    <div className="space-y-6">
        <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Profil Program Studi Institusi</h1>
            <p className="text-sm text-gray-500 mt-1">Pilih Program Studi untuk mengelola informasi profil dan tim.</p>
        </header>

        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table>
            <TableHeader className="bg-gray-50/50">
            <TableRow>
                <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4">Program Studi</TableHead>
                <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 text-right">Aksi</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {prodis.map((prodi) => (
                <TableRow key={prodi.id} className="hover:bg-gray-50/40">
                <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-900 rounded-lg text-white shadow-sm"><BookOpen className="w-4 h-4" /></div>
                    <span className="text-[14px] font-bold text-gray-900">{prodi.fullname}</span>
                    </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                    <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push(`/profil-prodi?prodiId=${prodi.id}`)}
                    className="h-8 text-xs font-bold gap-2"
                    >
                    <Eye className="w-4 h-4" /> Lihat Profil
                    </Button>
                </TableCell>
                </TableRow>
            ))}
            {prodis.length === 0 && (
                <TableRow><TableCell colSpan={2} className="text-center py-8 text-gray-500">Belum ada data program studi.</TableCell></TableRow>
            )}
            </TableBody>
        </Table>
        </Card>
    </div>
    );
}

// ============================================================================
// 2. KOMPONEN DETAIL PROFIL
// ============================================================================
function ProdiDetailView({ targetProdiId, canEdit }: { targetProdiId: string, canEdit: boolean }) {
  const router = useRouter()
  const { user } = useUser()
  const [activeTab, setActiveTab] = React.useState<"informasi" | "tim">("informasi")
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
  const [penugasanList, setPenugasanList] = React.useState<any[]>([])
  const [isEditing, setIsEditing] = React.useState(false)
  const [isLoadingData, setIsLoadingData] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [editForm, setEditForm] = React.useState<ProdiData>(prodiData)
  const [misiText, setMisiText] = React.useState("")
  const [showSertifikat, setShowSertifikat] = React.useState(false)
  const [showTambahAnggota, setShowTambahAnggota] = React.useState(false)
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null)
  const [newNama, setNewNama] = React.useState("")
  const [newEmail, setNewEmail] = React.useState("")
  const [newRole, setNewRole] = React.useState("TIM_PRODI")
  const [newIsActive, setNewIsActive] = React.useState(true)
  const [formErrors, setFormErrors] = React.useState<{ name?: string; email?: string; general?: string }>({})

  React.useEffect(() => {
    if (targetProdiId) {
        setError(null)
        setIsLoadingData(true)
        Promise.all([
          loadProdiData(targetProdiId), 
          loadTimProdi(targetProdiId),
          loadPenugasan(targetProdiId)
        ])
            .finally(() => setIsLoadingData(false))
    }
  }, [targetProdiId])

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
    } catch (err: any) {
        console.error("Gagal memuat data prodi:", err)
        setError("Gagal memuat data program studi. Pastikan Anda memiliki akses.")
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
    } catch (err: any) {
        console.error("Gagal memuat tim prodi:", err)
    }
  }

  const loadPenugasan = async (id: string) => {
    try {
        const assignments = await getPenugasan(id)
        setPenugasanList(assignments || [])
    } catch (err) {
        console.error("Gagal memuat data penugasan:", err)
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
      await updateProdi(targetProdiId, { fullname: editForm.fullname, degree: editForm.degree })
      if (editForm.akreditasi || (editForm.certificateUrl && !isLocalCertificate(editForm.certificateUrl))) {
        await upsertAccreditation(targetProdiId, {
          grade: editForm.akreditasi,
          certificateUrl: isLocalCertificate(editForm.certificateUrl) ? undefined : editForm.certificateUrl,
        })
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
        prodiId: targetProdiId,
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

  const isGuest = user?.role === 'SUPER_ADMIN' || user?.role === 'PIMPINAN';

  if (isLoadingData) {
    return (
        <div className="flex flex-col gap-6">
            <HeaderKaprodi />
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm mb-6">
                <CardContent className="px-6 py-24 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-gray-500 font-medium text-sm">Memuat data program studi...</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center p-12 gap-4">
            <p className="text-red-500 font-bold">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">Coba Lagi</Button>
            <Button onClick={() => router.push('/profil-prodi')} variant="ghost">Kembali ke Daftar</Button>
        </div>
    )
  }

  return (
    <div className="relative">
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

      <HeaderKaprodi />

      {/* Header Card */}
      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm mb-6">
          <CardContent className="px-6 py-5">
            <div className="flex justify-between items-start">
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
                {isGuest && (
                    <Button variant="ghost" onClick={() => router.push('/profil-prodi')} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 gap-2 font-semibold text-sm">
                        &larr; Kembali ke Daftar
                    </Button>
                )}
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
              {canEdit && (
                isEditing ? (
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
                )
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
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Sertifikat</p>
                    {isLocalCertificate(prodiData.certificateUrl) ? (
                      <button
                        onClick={() => downloadCertificate(targetProdiId)}
                        className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Unduh Sertifikat
                      </button>
                    ) : isEditing ? (
                      <Input value={editForm.certificateUrl} onChange={(e) => setEditForm((f) => ({ ...f, certificateUrl: e.target.value }))} className="rounded-lg border-gray-200 text-sm h-9" placeholder="https://..." />
                    ) : prodiData.certificateUrl ? (
                      <a href={prodiData.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Buka Sertifikat
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">—</p>
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
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="hover:bg-transparent border-b border-gray-100">
                    <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">NAMA</TableHead>
                    <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">EMAIL</TableHead>
                    <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">ROLE</TableHead>
                    <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">STATUS</TableHead>
                    <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">PENUGASAN</TableHead>
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
                  {timProdi.map((member) => {
                    const isAssigned = penugasanList.some((p) => p.userId === member.id);
                    return (
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
                      <TableCell className="px-6 py-4">
                        <Link href="/penugasan" className="inline-block group">
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all border ${
                                isAssigned 
                                ? "bg-blue-50 text-blue-600 border-blue-200 group-hover:bg-blue-100" 
                                : "bg-gray-50 text-gray-500 border-gray-200 group-hover:bg-gray-100 group-hover:text-gray-700"
                            }`}>
                                {isAssigned ? "Lihat Penugasan" : "Atur Penugasan"}
                                <ArrowRight className="w-3 h-3" />
                            </div>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      
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
              {isLocalCertificate(prodiData.certificateUrl) ? (
                <button
                  onClick={() => downloadCertificate(targetProdiId)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  Unduh Sertifikat
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              ) : (
                <a
                  href={prodiData.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  Buka Sertifikat
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
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
    </div>
  )
}

// ============================================================================
// 3. MAIN CONTENT (SUSPENSE & RBAC)
// ============================================================================
function ProfilProdiContent() {
    const { user, loading } = useUser();
    const searchParams = useSearchParams();
    const urlProdiId = searchParams.get("prodiId");
    const [accessibleProdis, setAccessibleProdis] = React.useState<any[]>([]);
    const [isProdiLoading, setIsProdiLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchMyProdis = async () => {
            if (loading) return;
            if (!user) {
                setIsProdiLoading(false);
                return;
            }
            try {
                const res = await apiClient.get('/prodi/my-prodi');
                setAccessibleProdis(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch my prodis");
            } finally {
                setIsProdiLoading(false);
            }
        };
        fetchMyProdis();
    }, [user, loading]);

    if (loading || isProdiLoading) {
        return (
            <div className="p-8 flex items-center gap-3 text-gray-500 font-medium">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                Memuat otorisasi...
            </div>
        );
    }
    
    if (!user) return null;

    const isGuestRole = user.role === 'PIMPINAN' || user.role === 'SUPER_ADMIN';
    const canEdit = user.role === 'KAPRODI';

    if (urlProdiId) {
        const hasAccess = accessibleProdis.some(p => p.id === urlProdiId);
        if (!hasAccess && !isGuestRole) {
            return <div className="p-8 text-red-500 font-bold">Akses ditolak.</div>;
        }
        return <ProdiDetailView targetProdiId={urlProdiId} canEdit={canEdit && !isGuestRole} />;
    }

    if (isGuestRole || accessibleProdis.length > 1) {
        return <ProdiListView />;
    }

    if (accessibleProdis.length === 1) {
        return <ProdiDetailView targetProdiId={accessibleProdis[0].id} canEdit={canEdit} />;
    }

    return <div className="p-8 text-red-500 font-bold">Akses ditolak atau Program Studi tidak ditemukan.</div>;
}

export default function ProfilProdiPage() {
  return (
    <React.Suspense fallback={<div className="p-8 flex items-center gap-3 text-gray-500"><Loader2 className="w-5 h-5 animate-spin" /> Memuat...</div>}>
      <ProfilProdiContent />
    </React.Suspense>
  )
}