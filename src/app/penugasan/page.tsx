"use client"

import * as React from "react"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { addPenugasan } from "@/lib/api-prodi"
import { ProdiAssignment } from "@/types/api.types"

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

const anggotaList = [
  { name: "Siti", initials: "SI" },
  { name: "Agus", initials: "AG" },
  { name: "Kevin", initials: "KE" },
]

interface Penugasan {
  id: string
  anggota: string
  initials: string
  kriteria: string
  label: string
  tanggal: string
}

const initialPenugasan: Penugasan[] = [
  { id: "1", anggota: "Siti", initials: "SI", kriteria: "K1", label: "Visi, Misi, Tujuan & Strategi", tanggal: "20 Juni 2027" },
  { id: "2", anggota: "Siti", initials: "SI", kriteria: "K2", label: "Tata Pamong & Kerjasama", tanggal: "21 Juni 2027" },
  { id: "3", anggota: "Agus", initials: "AG", kriteria: "K3", label: "Mahasiswa", tanggal: "22 Juni 2027" },
  { id: "4", anggota: "Agus", initials: "AG", kriteria: "K4", label: "Sumber Daya Manusia", tanggal: "23 Juni 2027" },
]

export default function PenugasanPage() {
  const [penugasan, setPenugasan] = React.useState<Penugasan[]>(initialPenugasan)
  const [selectedAnggota, setSelectedAnggota] = React.useState("")
  const [selectedKriteria, setSelectedKriteria] = React.useState<string[]>([])
  const [filterAnggota, setFilterAnggota] = React.useState("Semua Anggota")

  const toggleKriteria = (id: string) => {
    setSelectedKriteria((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    )
  }

  const handleTugaskan = async () => {
    if (!selectedAnggota || selectedKriteria.length === 0) {
      alert("Pilih anggota dan minimal satu kriteria!");
      return;
    }

    try {
      const result = await addPenugasan({
        userId: selectedAnggota,
        prodiId: "1",
        kriteriaIds: selectedKriteria,
      });

      setPenugasan((prev: any) => {
        const existingIdx = prev.findIndex(p => p.id === result.userId);
        
        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx] = result;
          return updated;
        }
        
        return [result, ...prev];
      });

      setSelectedKriteria([]);
      setSelectedAnggota("");

    } catch (error: unknown) {
      console.error((error as Error).message);
    }
  };

  const assignedKriteria = [...new Set(penugasan.map((p) => p.kriteria))]
  const unassignedKriteria = kriteria.filter((k) => !assignedKriteria.includes(k.id))

  const penugasanByAnggota = anggotaList.map((a) => ({
    ...a,
    kriteria: penugasan.filter((p) => p.anggota === a.name).map((p) => p.kriteria),
    tanggal: penugasan.find((p) => p.anggota === a.name)?.tanggal ?? "-",
  }))

  const filteredRows =
    filterAnggota === "Semua Anggota"
      ? penugasanByAnggota.filter((a) => a.kriteria.length > 0)
      : penugasanByAnggota.filter((a) => a.name === filterAnggota && a.kriteria.length > 0)

  return (
    <div className="min-h-screen flex bg-[#F9FAFB]">
      <div className="w-[240px] fixed h-full bg-white border-r border-gray-200 hidden md:flex items-center justify-center text-gray-400 text-sm font-medium">
        <SidebarProdi />
      </div>

      <main className="flex-grow md:ml-[240px] p-8 min-h-screen">
        <HeaderKaprodi />

        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Penugasan Anggota Tim Prodi</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola penugasan kriteria akreditasi kepada anggota Tim Prodi.</p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <CardContent className="px-5 py-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Penugasan</p>
              <p className="text-3xl font-bold text-gray-900">{penugasan.length}</p>
              <p className="text-xs text-gray-500 mt-1">Aktif</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <CardContent className="px-5 py-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Kriteria Tercakup</p>
              <p className="text-3xl font-bold text-gray-900">{assignedKriteria.length}</p>
              <p className="text-xs text-gray-500 mt-1">dari {kriteria.length} Kriteria</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <CardContent className="px-5 py-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Kriteria Belum Ditugaskan</p>
              <p className="text-3xl font-bold text-red-500">{unassignedKriteria.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                {unassignedKriteria.map((k) => k.id).join(", ") || "Semua sudah ditugaskan"}
              </p>
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
                  value={selectedAnggota}
                  onChange={(e) => setSelectedAnggota(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <option value="">-- Pilih anggota --</option>
                  {anggotaList.map((a) => (
                    <option key={a.name} value={a.name}>{a.name}</option>
                  ))}
                </select>
              </div>

              {/* Checklist kriteria */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-3">Pilih Kriteria</label>
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
                disabled={!selectedAnggota || selectedKriteria.length === 0}
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
                <option>Semua Anggota</option>
                {anggotaList.map((a) => (
                  <option key={a.name}>{a.name}</option>
                ))}
              </select>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="hover:bg-transparent border-b border-gray-100">
                    <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-3 tracking-wider">ANGGOTA</TableHead>
                    <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-3 tracking-wider">KRITERIA</TableHead>
                    <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-3 tracking-wider">TANGGAL DITUGASKAN</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="px-6 py-8 text-center text-sm text-gray-400">
                        Belum ada penugasan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRows.map((row) => (
                      <TableRow key={row.name} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 border border-gray-100 shadow-sm">
                              <AvatarFallback className="bg-blue-50 text-blue-600 text-[11px] font-bold">
                                {row.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[13px] font-semibold text-gray-900">{row.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {row.kriteria.map((k) => (
                              <Badge key={k} variant="secondary" className="bg-gray-100 text-gray-700 rounded-md px-2 py-0.5 text-[11px] font-bold shadow-none border-none">
                                {k}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-[13px] text-gray-500">{row.tanggal}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Ringkasan Beban Tugas */}
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardHeader className="px-6 py-5 border-b border-gray-100">
            <CardTitle className="text-base font-bold text-gray-900">Ringkasan Beban Tugas</CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-5">
            <div className="grid grid-cols-3 gap-4">
              {anggotaList.map((a) => {
                const myKriteria = penugasan.filter((p) => p.anggota === a.name)
                return (
                  <div key={a.name} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                    <div className="flex items-center gap-2.5 mb-3">
                      <Avatar className="w-8 h-8 border border-gray-200">
                        <AvatarFallback className="bg-blue-50 text-blue-600 text-[11px] font-bold">
                          {a.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-bold text-gray-900">{a.name}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">Kriteria ditangani:</p>
                    <p className={`text-2xl font-bold mb-2 ${myKriteria.length === 0 ? "text-red-500" : "text-gray-900"}`}>
                      {myKriteria.length}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {myKriteria.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">Belum ada penugasan</span>
                      ) : (
                        myKriteria.map((p) => (
                          <Badge key={p.kriteria} variant="secondary" className="bg-gray-100 text-gray-700 rounded-md px-2 py-0.5 text-[11px] font-bold shadow-none border-none">
                            {p.kriteria}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}