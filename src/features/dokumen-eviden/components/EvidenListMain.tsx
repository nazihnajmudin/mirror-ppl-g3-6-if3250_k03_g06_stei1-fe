"use client"

import React, { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Eye, Edit, Trash2, ArrowUpDown, Filter, SortAsc, SortDesc, CalendarDays, Building, Loader2, BookOpen, Search, HardDrive, FileStack, RefreshCcw, Lock, Unlock, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { MonitoringDialog } from "@/components/monitoring/monitoring-dialog"
import { formatBytes, isInfokom } from "../utils/index"
import { cn } from "@/lib/utils"

export function EvidenListMain({ user, logic, urlProdiId }: { user: any, logic: any, urlProdiId: string | null }) {
  const router = useRouter()
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'PIMPINAN'
  const showProdiColumn = isAdmin || user?.role === 'TIM_PRODI'

  if (!isAdmin && logic.accessibleProdis.length > 1 && !urlProdiId) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Pilih Program Studi</h1>
            <p className="text-sm text-gray-500 mt-1">Pilih program studi untuk mengelola Dokumen Eviden</p>
        </header>
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50/50">
                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                    <TableHead className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">PROGRAM STUDI</TableHead>
                    <TableHead className="text-right pr-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">AKSI</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {logic.accessibleProdis.map((prodi: any) => (
                <TableRow key={prodi.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                  <TableCell className="px-6 py-4 font-bold text-[14px] text-gray-900">{prodi.fullname}</TableCell>
                  <TableCell className="py-4 text-right pr-6">
                    <Button onClick={() => router.push(`/dokumen-eviden?prodiId=${prodi.id}`)} variant="outline" size="sm" className="gap-2 h-9 rounded-lg font-bold border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"><BookOpen className="w-4 h-4"/> Buka Eviden</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    )
  }

  const activeProdiId = urlProdiId || (logic.accessibleProdis.length === 1 ? logic.accessibleProdis[0].id : null);
  const activeProdi = logic.accessibleProdis.find((p: any) => p.id === activeProdiId);
  const baseEvidenData = isAdmin ? logic.evidenList : logic.evidenList.filter((e: any) => e.prodiId === activeProdiId);

  const processedEviden = useMemo(() => {
    let result = [...baseEvidenData];
    result = result.map(e => ({ ...e, fileCount: e.files?.length || 0, totalSizeBytes: e.files?.reduce((sum: number, f: any) => sum + f.size, 0) || 0, totalSizeMB: (e.files?.reduce((sum: number, f: any) => sum + f.size, 0) || 0) / (1024 * 1024), periodeNum: parseInt(e.periode) || 0 }));
    if (logic.searchQuery.trim()) { const q = logic.searchQuery.toLowerCase(); result = result.filter(e => e.judul.toLowerCase().includes(q)); }
    if (logic.filters.prodi.length > 0) result = result.filter(e => logic.filters.prodi.includes(e.prodiId));
    if (logic.filters.periode.length > 0) result = result.filter(e => logic.filters.periode.includes(e.periode));
    if (logic.filters.indikator.length > 0) result = result.filter(e => e.indikator.some((ind: string) => logic.filters.indikator.includes(ind)));
    if (logic.filters.minCount) result = result.filter(e => e.fileCount >= parseInt(logic.filters.minCount));
    if (logic.filters.maxCount) result = result.filter(e => e.fileCount <= parseInt(logic.filters.maxCount));
    if (logic.filters.minSizeMB) result = result.filter(e => e.totalSizeMB >= parseFloat(logic.filters.minSizeMB));
    if (logic.filters.maxSizeMB) result = result.filter(e => e.totalSizeMB <= parseFloat(logic.filters.maxSizeMB));
    if (logic.sortConfig) {
        result.sort((a, b) => {
            let valA, valB;
            switch (logic.sortConfig.key) {
                case 'judul': valA = a.judul.toLowerCase(); valB = b.judul.toLowerCase(); break;
                case 'periode': valA = a.periodeNum; valB = b.periodeNum; break;
                case 'size': valA = a.totalSizeBytes; valB = b.totalSizeBytes; break;
                case 'count': valA = a.fileCount; valB = b.fileCount; break;
                default: return 0;
            }
            if (valA < valB) return logic.sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return logic.sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    return result;
  }, [baseEvidenData, logic.searchQuery, logic.filters, logic.sortConfig]);

  const availablePeriodes = Array.from(new Set(baseEvidenData.map((e: any) => e.periode).filter(Boolean))).sort() as string[]
  const availableIndikators = Array.from(new Set(baseEvidenData.flatMap((e: any) => e.indikator))).sort() as string[]
  const activeFiltersCount = logic.filters.prodi.length + logic.filters.periode.length + logic.filters.indikator.length + (logic.filters.minCount || logic.filters.maxCount ? 1 : 0) + (logic.filters.minSizeMB || logic.filters.maxSizeMB ? 1 : 0)

  let summary = null
  if (isAdmin) {
    let lengkapCount = 0; let belumLengkapCount = 0
    logic.accessibleProdis.forEach((prodi: any) => {
        const prodiEviden = logic.evidenList.filter((e: any) => e.prodiId === prodi.id);
        const covered = new Set(prodiEviden.flatMap((e: any) => e.indikator));
        const requiredCount = isInfokom(prodi.abbreviation) ? 6 : 7;
        if (covered.size >= requiredCount) lengkapCount++; else belumLengkapCount++;
    });
    summary = (
      <>
        <Card className="rounded-xl shadow-sm border border-gray-200"><CardContent className="p-6 text-center"><p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Total Seluruh Eviden</p><p className="text-3xl font-bold text-gray-900 leading-none">{logic.evidenList.length}</p></CardContent></Card>
        <Card className="rounded-xl shadow-sm border border-gray-200"><CardContent className="p-6 text-center"><p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Prodi Lengkap Eviden</p><p className="text-3xl font-bold text-emerald-600 leading-none">{lengkapCount}</p></CardContent></Card>
        <Card className="rounded-xl shadow-sm border border-gray-200"><CardContent className="p-6 text-center"><p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Prodi Belum Lengkap</p><p className="text-3xl font-bold text-red-500 leading-none">{belumLengkapCount}</p></CardContent></Card>
      </>
    )
  } else if (activeProdi) {
    const reqCount = isInfokom(activeProdi.abbreviation) ? 6 : 7
    const coveredIds = new Set(baseEvidenData.flatMap((e: any) => e.indikator))
    summary = (
      <>
        <Card className="rounded-xl shadow-sm border border-gray-200"><CardContent className="p-6 text-center"><p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Total Eviden</p><p className="text-3xl font-bold text-gray-900 leading-none">{baseEvidenData.length}</p></CardContent></Card>
        <Card className="rounded-xl shadow-sm border border-gray-200"><CardContent className="p-6 text-center"><p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Kriteria Tercakup</p><p className="text-3xl font-bold text-gray-900 leading-none">{coveredIds.size}</p><p className="text-[11px] font-medium text-gray-400 mt-2">dari {reqCount} Kriteria</p></CardContent></Card>
        <Card className="rounded-xl shadow-sm border border-gray-200"><CardContent className="p-6 text-center"><p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Status Kelengkapan</p><p className={`text-xl font-bold mt-2 ${coveredIds.size >= reqCount ? 'text-emerald-600' : 'text-amber-500'}`}>{coveredIds.size >= reqCount ? 'LENGKAP' : 'BELUM LENGKAP'}</p></CardContent></Card>
      </>
    )
  }

  const handleAction = (mode: 'view' | 'edit' | 'add', id?: string) => {
    const queryProdi = activeProdiId && mode === 'add' ? `&prodiId=${activeProdiId}` : ''
    router.push(`/dokumen-eviden/form?mode=${mode}${id ? `&id=${id}` : ''}${queryProdi}`)
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dokumen Eviden {activeProdi && !isAdmin ? `- ${activeProdi.fullname}` : ''}</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Manajemen bukti pendukung untuk akreditasi</p>
        </div>
        {!isAdmin && activeProdiId && (
          <Button onClick={() => handleAction('add')} className="bg-black text-white hover:bg-gray-800 gap-2 h-10 px-5 rounded-lg font-bold shadow-md transition-colors">
            <Plus className="w-4 h-4" /> Tambah Eviden
          </Button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{summary}</div>

      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-white px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-sm font-bold text-gray-900 shrink-0">Daftar Dokumen</CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Cari judul..." value={logic.searchQuery} onChange={(e) => logic.setSearchQuery(e.target.value)} className="pl-9 h-9 text-xs w-[200px] md:w-[250px] bg-gray-50 border-gray-200 rounded-lg" />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 h-9 px-3 text-xs font-bold gap-2 outline-none shadow-sm">
                <ArrowUpDown className="w-3.5 h-3.5"/> {logic.sortConfig ? 'Tersortir' : 'Urutkan'}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-gray-200">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-bold text-gray-900">Urutkan Berdasarkan</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mt-1">Judul</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem checked={logic.sortConfig?.key === 'judul' && logic.sortConfig.direction === 'asc'} onCheckedChange={() => logic.setSortConfig({key: 'judul', direction: 'asc'})} className="font-medium">A - Z</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={logic.sortConfig?.key === 'judul' && logic.sortConfig.direction === 'desc'} onCheckedChange={() => logic.setSortConfig({key: 'judul', direction: 'desc'})} className="font-medium">Z - A</DropdownMenuCheckboxItem>
                  <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mt-1">Periode</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem checked={logic.sortConfig?.key === 'periode' && logic.sortConfig.direction === 'desc'} onCheckedChange={() => logic.setSortConfig({key: 'periode', direction: 'desc'})} className="font-medium">Terbaru</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={logic.sortConfig?.key === 'periode' && logic.sortConfig.direction === 'asc'} onCheckedChange={() => logic.setSortConfig({key: 'periode', direction: 'asc'})} className="font-medium">Terlama</DropdownMenuCheckboxItem>
                  {logic.sortConfig && (<><DropdownMenuSeparator /><DropdownMenuItem onClick={() => logic.setSortConfig(null)} className="text-red-600 font-bold text-xs justify-center cursor-pointer">Reset Sort</DropdownMenuItem></>)}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className={cn("inline-flex items-center justify-center rounded-lg border bg-white h-9 px-3 text-xs font-bold gap-2 outline-none shadow-sm", activeFiltersCount > 0 ? "border-blue-500 text-blue-700 bg-blue-50" : "border-gray-200 text-gray-700 hover:bg-gray-50")}>
                <Filter className="w-3.5 h-3.5"/> Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-lg border-gray-200">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex justify-between items-center font-bold text-gray-900">
                    Filter Data
                    {activeFiltersCount > 0 && (<button onClick={(e) => { e.stopPropagation(); logic.setFilters({ prodi: [], periode: [], indikator: [], minCount: '', maxCount: '', minSizeMB: '', maxSizeMB: '' }); }} className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold"><RefreshCcw className="w-3 h-3"/> Reset</button>)}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="font-medium"><Building className="w-4 h-4 mr-2"/> Prodi {logic.filters.prodi.length > 0 && `(${logic.filters.prodi.length})`}</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="rounded-xl shadow-lg border-gray-200">
                        {logic.accessibleProdis.map((p: any) => (
                          <DropdownMenuCheckboxItem key={p.id} checked={logic.filters.prodi.includes(p.id)} onCheckedChange={(c) => logic.toggleFilterArray('prodi', p.id, c)} className="font-medium">{p.abbreviation || p.fullname}</DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  )}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="font-medium"><CalendarDays className="w-4 h-4 mr-2"/> Periode {logic.filters.periode.length > 0 && `(${logic.filters.periode.length})`}</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="rounded-xl shadow-lg border-gray-200">
                      {availablePeriodes.map(p => (
                        <DropdownMenuCheckboxItem key={p} checked={logic.filters.periode.includes(p)} onCheckedChange={(c) => logic.toggleFilterArray('periode', p, c)} className="font-medium">{p}</DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="font-medium"><Filter className="w-4 h-4 mr-2"/> Indikator {logic.filters.indikator.length > 0 && `(${logic.filters.indikator.length})`}</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="max-h-60 overflow-y-auto rounded-xl shadow-lg border-gray-200 custom-scrollbar">
                      {availableIndikators.map(ind => (
                        <DropdownMenuCheckboxItem key={ind} checked={logic.filters.indikator.includes(ind)} onCheckedChange={(c) => logic.toggleFilterArray('indikator', ind, c)} className="font-medium">{ind}</DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="border-b border-gray-100 hover:bg-transparent">
              <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Judul Eviden</TableHead>
              {showProdiColumn && <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">Prodi</TableHead>}
              <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">Periode</TableHead>
              <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">Status</TableHead>
              <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">Dokumen</TableHead>
              <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">Indikator</TableHead>
              <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right pr-6 py-4">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logic.isFetching ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></TableCell></TableRow>
            ) : processedEviden.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12 text-sm text-gray-400 font-medium">Tidak ada data ditemukan.</TableCell></TableRow>
            ) : (
              processedEviden.map((eviden: any) => {
                const canToggleStatus = user?.role === 'SUPER_ADMIN' || (user?.role === 'KAPRODI' && eviden.prodiId === user?.prodiId);
                const isLocked = eviden.status === 'FINAL';
                return (
                  <TableRow key={eviden.id} className="hover:bg-gray-50/40 border-b border-gray-50 last:border-0 transition-colors">
                    <TableCell className="px-6 py-4 font-bold text-[14px] text-gray-900 leading-tight truncate max-w-[200px]" title={eviden.judul}>{eviden.judul}</TableCell>
                    {showProdiColumn && <TableCell className="py-4 text-[13px] font-medium text-gray-600">{eviden.prodi?.abbreviation || '-'}</TableCell>}
                    <TableCell className="py-4 text-[13px] font-medium text-gray-600">{eviden.periode || '-'}</TableCell>
                    <TableCell className="py-4">
                      <span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center w-max gap-1.5 border", isLocked ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-50 text-gray-600 border-gray-200")}>
                        {isLocked ? <Lock className="w-3 h-3"/> : <Unlock className="w-3 h-3"/>} {eviden.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-[13px] font-medium text-gray-600">
                      {eviden.fileCount} File <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded ml-1 border border-gray-200">{formatBytes(eviden.totalSizeBytes)}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {eviden.indikator.map((ind: string) => (
                          <span key={ind} className={cn("border px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm", ind.startsWith("LKPS") ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-blue-50 text-blue-600 border-blue-200")}>{ind}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-right pr-6">
                      <div className="flex justify-end gap-3 items-center">
                        <button onClick={() => handleAction('view', eviden.id)} className="text-blue-600 hover:text-blue-800 text-[12px] font-bold flex items-center gap-1 transition-colors"><Eye className="w-3.5 h-3.5"/> Lihat</button>
                        {canToggleStatus && (
                          <button onClick={() => logic.handleToggleStatus(eviden.id, eviden.status, () => logic.fetchInitialData())} className={cn("text-[12px] font-bold flex items-center gap-1 transition-colors", isLocked ? "text-orange-500 hover:text-orange-700" : "text-emerald-600 hover:text-emerald-800")}>
                            {isLocked ? <><Unlock className="w-3.5 h-3.5"/> Buka</> : <><Lock className="w-3.5 h-3.5"/> Final</>}
                          </button>
                        )}
                        <MonitoringDialog documentType="EVIDEN" documentId={eviden.id} documentLabel={eviden.judul} triggerLabel="Monitoring" compact triggerClassName="text-gray-600 font-bold text-[12px] hover:text-gray-900 border-none bg-transparent hover:bg-gray-100 px-2 h-7 rounded-md" />
                        {!isAdmin && !isLocked && (
                          <>
                            <button onClick={() => handleAction('edit', eviden.id)} className="text-gray-600 hover:text-gray-900 text-[12px] font-bold flex items-center gap-1 transition-colors"><Edit className="w-3.5 h-3.5"/> Edit</button>
                            <button disabled={logic.isDeletingId === eviden.id} onClick={() => logic.handleDelete(eviden.id, () => {})} className="text-red-500 hover:text-red-700 text-[12px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50">
                              {logic.isDeletingId === eviden.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5"/>} Hapus
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}