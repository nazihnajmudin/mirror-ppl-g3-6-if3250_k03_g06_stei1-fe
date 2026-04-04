"use client"

import * as React from "react"
import { HeaderKaprodi } from "@/components/layout/header-kaprodi"
import { useSearchParams, useRouter } from "next/navigation"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2, BookOpen, Eye, Loader2 } from "lucide-react"
import { getCurrentUser, getProdiMembers, getPenugasan, addPenugasan, deletePenugasan, getProdiById } from "@/lib/api-prodi"
import type { User, ProdiAssignment } from "@/types/api.types"
import apiClient from "@/lib/api-client"
import { useUser } from "@/hooks/useUser"

const kriteria = [
  { id: "K1", label: "Visi, Misi, Tujuan & Strategi" },
  { id: "K2", label: "Tata Pamong & Kerjasama" },
  { id: "K3", label: "Mahasiswa" },
  { id: "K4", label: "Sumber Daya Manusia" },
  { id: "K5", label: "Keuangan, Sarana & Prasarana" },
  { id: "K6", label: "Pendidikan" },
  { id: "K7", label: "Penelitian" },
  { id: "K8", label: "Pengabdian Masyarakat" },
  { id: "K9", label: "Luaran dan Capaian Tridharma" },
]

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
            <h1 className="text-2xl font-bold text-gray-900">Penugasan Tim Prodi Institusi</h1>
            <p className="text-sm text-gray-500 mt-1">Pilih Program Studi untuk mengelola penugasan tim.</p>
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
                    onClick={() => router.push(`/penugasan?prodiId=${prodi.id}`)}
                    className="h-8 text-xs font-bold gap-2"
                    >
                    <Eye className="w-4 h-4" /> Kelola Penugasan
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
// 2. KOMPONEN UTAMA PENUGASAN DETAIL
// ============================================================================
function PenugasanDetailView({ targetProdiId }: { targetProdiId: string }) {
  const router = useRouter()
  const { user } = useUser()
  const [prodiName, setProdiName] = React.useState("Program Studi")
  const [anggotaList, setAnggotaList] = React.useState<User[]>([])
  const [penugasanList, setPenugasanList] = React.useState<ProdiAssignment[]>([])
  const [selectedUserId, setSelectedUserId] = React.useState("")
  const [selectedKriteria, setSelectedKriteria] = React.useState<string[]>([])
  const [filterAnggota, setFilterAnggota] = React.useState("Semua Anggota")
  const [showHapusDialog, setShowHapusDialog] = React.useState(false)
  const [penugasanToDelete, setPenugasanToDelete] = React.useState<string | null>(null)
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null)

  React.useEffect(() => {
    if (targetProdiId) {
        loadData(targetProdiId)
        fetchProdiName(targetProdiId)
    }
  }, [targetProdiId])

  const fetchProdiName = async (id: string) => {
      try {
          const res = await getProdiById(id)
          setProdiName(res.fullname)
      } catch {}
  }

  const loadData = async (id: string) => {
    try {
      const [members, assignments] = await Promise.all([
        getProdiMembers(id),
        getPenugasan(id),
      ])
      setAnggotaList(members)
      setPenugasanList(assignments)
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

  const toggleKriteria = (id: string) => {
    setSelectedKriteria((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    )
  }

  const handleTugaskan = async () => {
    if (!selectedUserId) {
      showNotification("Pilih anggota terlebih dahulu!", "error")
      return
    }

    const alreadyAssigned = penugasanList.some((p) => p.userId === selectedUserId)
    if (alreadyAssigned) {
      showNotification("Anggota ini sudah memiliki penugasan", "error")
      return
    }

    try {
      const result = await addPenugasan({ userId: selectedUserId, prodiId: targetProdiId })
      setPenugasanList((prev) => [result, ...prev])
      setSelectedKriteria([])
      setSelectedUserId("")
      showNotification("Penugasan berhasil ditambahkan!", "success")
    } catch (error: any) {
      showNotification(error?.response?.data?.message || error.message || "Gagal menambah penugasan", "error")
    }
  }

  const confirmHapusPenugasan = (id: string) => {
    setPenugasanToDelete(id)
    setShowHapusDialog(true)
  }

  const executeHapusPenugasan = async () => {
    if (!penugasanToDelete) return
    try {
      await deletePenugasan(penugasanToDelete)
      setPenugasanList((prev) => prev.filter((p) => p.id !== penugasanToDelete))
      showNotification("Penugasan berhasil dihapus", "success")
    } catch (error: any) {
      showNotification(error?.response?.data?.message || "Gagal menghapus penugasan", "error")
    } finally {
      setShowHapusDialog(false)
      setPenugasanToDelete(null)
    }
  }

  const assignedUserIds = new Set(penugasanList.map((p) => p.userId))
  const unassignedCount = anggotaList.filter((a) => !assignedUserIds.has(a.id)).length

  const filteredPenugasan =
    filterAnggota === "Semua Anggota"
      ? penugasanList
      : penugasanList.filter((p) => p.user?.id === filterAnggota)

  const isGuest = user?.role === 'SUPER_ADMIN' || user?.role === 'PIMPINAN'

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

      <header className="mb-8 flex justify-between items-start">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">{prodiName}</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola penugasan kriteria akreditasi kepada anggota Tim Prodi.</p>
        </div>
        {isGuest && (
            <Button variant="ghost" onClick={() => router.push('/penugasan')} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 gap-2 font-semibold text-sm">
                &larr; Kembali ke Daftar
            </Button>
        )}
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardContent className="px-5 py-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Penugasan</p>
            <p className="text-3xl font-bold text-gray-900">{penugasanList.length}</p>
            <p className="text-xs text-gray-500 mt-1">Aktif</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardContent className="px-5 py-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Kriteria Dipilih</p>
            <p className="text-3xl font-bold text-gray-900">{selectedKriteria.length}</p>
            <p className="text-xs text-gray-500 mt-1">dari {kriteria.length} Kriteria</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardContent className="px-5 py-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Belum Ditugaskan</p>
            <p className="text-3xl font-bold text-red-500">{unassignedCount}</p>
            <p className="text-xs text-gray-500 mt-1">anggota</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardContent className="px-5 py-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Jumlah Anggota Tim Prodi</p>
            <p className="text-3xl font-bold text-gray-900">{anggotaList.length}</p>
            <p className="text-xs text-gray-500 mt-1">Anggota</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-5 gap-6 mb-6">
        {/* Form Tugaskan */}
        <Card className="col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardHeader className="px-6 py-5 border-b border-gray-100">
            <CardTitle className="text-base font-bold text-gray-900">Tugaskan Anggota</CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-5 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Pilih Anggota Tim Prodi</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="">-- Pilih anggota --</option>
                {anggotaList
                  .filter((a) => !assignedUserIds.has(a.id))
                  .map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-3">Pilih Kriteria (opsional)</label>
              <div className="space-y-2.5">
                {kriteria.map((k) => (
                  <label key={k.id} className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedKriteria.includes(k.id)}
                      onChange={() => toggleKriteria(k.id)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 leading-tight group-hover:text-gray-900">
                      <span className="font-semibold">{k.id}</span> — {k.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              onClick={handleTugaskan}
              disabled={!selectedUserId}
              className="w-full bg-black hover:bg-gray-800 text-white rounded-lg py-2.5 text-sm font-semibold transition-all active:scale-95 disabled:opacity-40"
            >
              Tugaskan
            </Button>
          </CardContent>
        </Card>

        {/* Daftar Penugasan */}
        <Card className="col-span-3 rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardHeader className="px-6 py-5 border-b border-gray-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-gray-900">Daftar Penugasan</CardTitle>
            <select
              value={filterAnggota}
              onChange={(e) => setFilterAnggota(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="Semua Anggota">Semua Anggota</option>
              {penugasanList.map((p) => (
                <option key={p.id} value={p.user?.id ?? p.userId}>{p.user?.name ?? p.userId}</option>
              ))}
            </select>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-3 tracking-wider">ANGGOTA</TableHead>
                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-3 tracking-wider">TANGGAL DITUGASKAN</TableHead>
                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-3 tracking-wider text-right">AKSI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPenugasan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="px-6 py-8 text-center text-sm text-gray-400">
                      Belum ada penugasan
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
                            <Avatar className="w-8 h-8 border border-gray-100 shadow-sm">
                              <AvatarFallback className="bg-blue-50 text-blue-600 text-[11px] font-bold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="text-[13px] font-semibold text-gray-900 block">{name}</span>
                              <span className="text-[12px] text-gray-400">{p.user?.email ?? ""}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-[13px] text-gray-500">{tanggal}</TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmHapusPenugasan(p.id)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <CardHeader className="px-6 py-5 border-b border-gray-100">
          <CardTitle className="text-base font-bold text-gray-900">Ringkasan Tim Prodi</CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-5">
          {anggotaList.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Belum ada anggota tim prodi.</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {anggotaList.map((a) => {
                const assigned = penugasanList.some((p) => p.userId === a.id)
                return (
                  <div key={a.id} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                    <div className="flex items-center gap-2.5 mb-3">
                      <Avatar className="w-8 h-8 border border-gray-200">
                        <AvatarFallback className="bg-blue-50 text-blue-600 text-[11px] font-bold">
                          {makeInitials(a.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-sm font-bold text-gray-900 block">{a.name}</span>
                        <span className="text-[11px] text-gray-400">{a.role}</span>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold shadow-none border-none ${
                        assigned ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                      }`}
                    >
                      {assigned ? "Sudah Ditugaskan" : "Belum Ditugaskan"}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={showHapusDialog} onOpenChange={setShowHapusDialog}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">Konfirmasi Hapus Penugasan</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Apakah Anda yakin ingin menghapus penugasan ini? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowHapusDialog(false)} className="rounded-lg border-gray-200 text-sm font-semibold">
              Batal
            </Button>
            <Button onClick={executeHapusPenugasan} className="bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold">
              Ya, Hapus
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
function PenugasanPageContent() {
    const { user, loading } = useUser();
    const searchParams = useSearchParams();
    const urlProdiId = searchParams.get("prodiId");
    const [accessibleProdis, setAccessibleProdis] = React.useState<any[]>([]);
    const [isProdiLoading, setIsProdiLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchMyProdis = async () => {
            if (!user) return;
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
    }, [user]);

    if (loading || isProdiLoading) return <div className="p-8 text-gray-500">Memuat otorisasi...</div>;
    if (!user) return null;

    const isGuestRole = user.role === 'PIMPINAN' || user.role === 'SUPER_ADMIN';

    // Skenario 1: Ada prodiId di URL
    if (urlProdiId) {
        const hasAccess = accessibleProdis.some(p => p.id === urlProdiId);
        if (!hasAccess && !isGuestRole) {
            return <div className="p-8 text-red-500 font-bold">Akses ditolak.</div>;
        }
        return <PenugasanDetailView targetProdiId={urlProdiId} />;
    }

    // Skenario 2: Tidak ada prodiId, tapi punya lebih dari 1 prodi atau Admin
    if (isGuestRole || accessibleProdis.length > 1) {
        return <ProdiListView />;
    }

    // Skenario 3: Cuma punya 1 prodi akses
    if (accessibleProdis.length === 1) {
        return <PenugasanDetailView targetProdiId={accessibleProdis[0].id} />;
    }

    return <div className="p-8 text-red-500 font-bold">Akses ditolak atau Program Studi tidak ditemukan.</div>;
}

export default function PenugasanPage() {
  return (
    <React.Suspense fallback={<div className="p-8 flex items-center gap-3 text-gray-500"><Loader2 className="w-5 h-5 animate-spin" /> Memuat...</div>}>
      <PenugasanPageContent />
    </React.Suspense>
  )
}
