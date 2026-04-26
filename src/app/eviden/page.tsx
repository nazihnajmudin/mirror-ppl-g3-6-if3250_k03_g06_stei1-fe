"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Plus, Eye, Edit, Trash2, ArrowUpDown, Filter, SortAsc, SortDesc, CalendarDays, Building, Loader2, BookOpen, Search, HardDrive, FileStack, RefreshCcw } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import apiClient from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const KRITERIA_LAM_TEKNIK = [
    { id: "C1", label: "Visi, Misi, Tujuan, dan Strategi" },
    { id: "C2", label: "Tata Pamong, Tata Kelola, dan Kerja Sama" },
    { id: "C3", label: "Relevansi Pendidikan, Penelitian, dan PkM" },
    { id: "C4", label: "Sumber Daya Manusia" },
    { id: "C5", label: "Sarana, Prasarana, dan K3L" },
    { id: "C6", label: "Mahasiswa dan Luaran Mahasiswa" },
    { id: "C7", label: "Sistem Penjaminan Mutu" },
];

const KRITERIA_LAM_INFOKOM = [
    { id: "C1", label: "Budaya Mutu" },
    { id: "C2", label: "Relevansi Pendidikan" },
    { id: "C3", label: "Relevansi Penelitian" },
    { id: "C4", label: "Relevansi Pengabdian kepada Masyarakat" },
    { id: "C5", label: "Akuntabilitas" },
    { id: "C6", label: "Diferensiasi Misi" },
];

const isInfokom = (abbreviation?: string) => ['IF', 'II'].includes(abbreviation?.toUpperCase() || '');
const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals < 0 ? 0 : decimals))} ${sizes[i]}`;
};

export default function EvidenListPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlProdiId = searchParams.get("prodiId");
    const { user, loading } = useUser();
    
    // ==========================================
    // 1. ALL HOOKS
    // ==========================================
    const [evidenList, setEvidenList] = useState<any[]>([]);
    const [accessibleProdis, setAccessibleProdis] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
    const [filters, setFilters] = useState({
        prodi: [] as string[],
        periode: [] as string[],
        indikator: [] as string[],
        minCount: "", maxCount: "",
        minSizeMB: "", maxSizeMB: ""
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsFetching(true);
            try {
                const [prodiRes, evidenRes] = await Promise.all([
                    apiClient.get('/prodi/my-prodi'),
                    apiClient.get('/eviden')
                ]);
                setAccessibleProdis(prodiRes.data.data || []);
                setEvidenList(evidenRes.data.data || []);
            } catch (error) {
                console.error("Gagal mengambil data", error);
            } finally {
                setIsFetching(false);
            }
        };
        if (user) fetchInitialData();
    }, [user]);

    // Pre-kalkulasi variabel dasar untuk useMemo
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'PIMPINAN';
    const showProdiColumn = isAdmin || user?.role === 'TIM_PRODI';

    const activeProdiId = urlProdiId || (accessibleProdis.length === 1 ? accessibleProdis[0].id : null);
    const activeProdi = accessibleProdis.find(p => p.id === activeProdiId);
    
    const baseEvidenData = isAdmin ? evidenList : evidenList.filter(e => e.prodiId === activeProdiId);

    // HOOK USEMEMO
    const processedEviden = useMemo(() => {
        let result = [...baseEvidenData];

        result = result.map(e => ({
            ...e,
            fileCount: e.files?.length || 0,
            totalSizeBytes: e.files?.reduce((sum: number, f: any) => sum + f.size, 0) || 0,
            totalSizeMB: (e.files?.reduce((sum: number, f: any) => sum + f.size, 0) || 0) / (1024 * 1024),
            periodeNum: parseInt(e.periode) || 0
        }));

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(e => e.judul.toLowerCase().includes(query));
        }

        if (filters.prodi.length > 0) result = result.filter(e => filters.prodi.includes(e.prodiId));
        if (filters.periode.length > 0) result = result.filter(e => filters.periode.includes(e.periode));
        if (filters.indikator.length > 0) result = result.filter(e => e.indikator.some((ind: string) => filters.indikator.includes(ind)));
        
        if (filters.minCount) result = result.filter(e => e.fileCount >= parseInt(filters.minCount));
        if (filters.maxCount) result = result.filter(e => e.fileCount <= parseInt(filters.maxCount));
        
        if (filters.minSizeMB) result = result.filter(e => e.totalSizeMB >= parseFloat(filters.minSizeMB));
        if (filters.maxSizeMB) result = result.filter(e => e.totalSizeMB <= parseFloat(filters.maxSizeMB));

        if (sortConfig) {
            result.sort((a, b) => {
                let valA, valB;
                switch (sortConfig.key) {
                    case 'judul': valA = a.judul.toLowerCase(); valB = b.judul.toLowerCase(); break;
                    case 'periode': valA = a.periodeNum; valB = b.periodeNum; break;
                    case 'size': valA = a.totalSizeBytes; valB = b.totalSizeBytes; break;
                    case 'count': valA = a.fileCount; valB = b.fileCount; break;
                    default: return 0;
                }
                
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [baseEvidenData, searchQuery, filters, sortConfig]);

    // ==========================================
    // 2. EARLY RETURNS
    // ==========================================
    if (loading) return <div className="p-8 text-gray-500 flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin" /> Memuat...</div>;
    if (!user) return null;

    if (!isAdmin && accessibleProdis.length > 1 && !urlProdiId) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto">
                <header className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Pilih Program Studi</h1><p className="text-sm text-gray-500 mt-1">Pilih program studi untuk mengelola Dokumen Eviden</p></header>
                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50/50"><TableRow><TableHead className="px-6 py-4 font-bold text-gray-500">Program Studi</TableHead><TableHead className="text-right pr-6 py-4 font-bold text-gray-500">Aksi</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {accessibleProdis.map((prodi) => (
                                <TableRow key={prodi.id} className="hover:bg-gray-50/40">
                                    <TableCell className="px-6 py-4 font-bold text-sm text-gray-900">{prodi.fullname}</TableCell>
                                    <TableCell className="py-4 text-right pr-6">
                                        <Button onClick={() => router.push(`/eviden?prodiId=${prodi.id}`)} variant="outline" size="sm" className="gap-2"><BookOpen className="w-4 h-4"/> Buka Eviden</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        );
    }

    // ==========================================
    // 3. RENDER UTAMA
    // ==========================================
    const toggleFilterArray = (key: 'prodi' | 'periode' | 'indikator', value: string, checked: boolean) => {
        setFilters(prev => ({
            ...prev,
            [key]: checked ? [...prev[key], value] : prev[key].filter(v => v !== value)
        }));
    };

    const availablePeriodes = Array.from(new Set(baseEvidenData.map(e => e.periode).filter(Boolean))).sort();
    const availableIndikators = Array.from(new Set(baseEvidenData.flatMap(e => e.indikator))).sort();

    let summary = null;
    if (isAdmin) {
        let lengkapCount = 0;
        let belumLengkapCount = 0;
        
        accessibleProdis.forEach(prodi => {
            const prodiEviden = evidenList.filter(e => e.prodiId === prodi.id);
            const covered = new Set(prodiEviden.flatMap(e => e.indikator));
            const requiredCount = isInfokom(prodi.abbreviation) ? 6 : 7;
            if (covered.size >= requiredCount) lengkapCount++;
            else belumLengkapCount++;
        });

        summary = (
            <>
                <Card><CardContent className="p-6 text-center"><p className="text-sm text-gray-500 font-medium">Total Seluruh Eviden</p><p className="text-3xl font-bold text-gray-900 mt-2">{evidenList.length}</p></CardContent></Card>
                <Card><CardContent className="p-6 text-center"><p className="text-sm text-gray-500 font-medium">Prodi Lengkap Eviden</p><p className="text-3xl font-bold text-emerald-600 mt-2">{lengkapCount}</p></CardContent></Card>
                <Card><CardContent className="p-6 text-center"><p className="text-sm text-gray-500 font-medium">Prodi Belum Lengkap</p><p className="text-3xl font-bold text-red-500 mt-2">{belumLengkapCount}</p></CardContent></Card>
            </>
        );
    } else if (activeProdi) {
        const requiredCriteria = isInfokom(activeProdi.abbreviation) ? KRITERIA_LAM_INFOKOM : KRITERIA_LAM_TEKNIK;
        const coveredIds = new Set(baseEvidenData.flatMap(e => e.indikator));
        const missingCriteria = requiredCriteria.filter(c => !coveredIds.has(c.id)).map(c => c.id);
        
        summary = (
            <>
                <Card><CardContent className="p-6 text-center"><p className="text-sm text-gray-500 font-medium">Total Eviden</p><p className="text-3xl font-bold text-gray-900 mt-2">{baseEvidenData.length}</p></CardContent></Card>
                <Card><CardContent className="p-6 text-center"><p className="text-sm text-gray-500 font-medium">Kriteria Tercakup</p><p className="text-3xl font-bold text-gray-900 mt-2">{coveredIds.size}</p><p className="text-sm text-gray-500 mt-1">dari {requiredCriteria.length} Kriteria</p></CardContent></Card>
                <Card><CardContent className="p-6 text-center"><p className="text-sm text-gray-500 font-medium">Kriteria Belum Ada Eviden</p><p className="text-lg font-bold text-red-500 mt-3">{missingCriteria.length > 0 ? missingCriteria.join(', ') : 'LENGKAP'}</p></CardContent></Card>
            </>
        );
    }

    const handleAction = (mode: 'view' | 'edit' | 'add', id?: string) => {
        router.push(`/eviden/form?mode=${mode}${id ? `&id=${id}` : ''}${activeProdiId ? `&prodiId=${activeProdiId}` : ''}`);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus dokumen eviden ini secara permanen?")) return;
        setIsDeletingId(id);
        try {
            await apiClient.delete(`/eviden/${id}`);
            setEvidenList(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            alert("Gagal menghapus eviden.");
        } finally {
            setIsDeletingId(null);
        }
    };

    const activeFiltersCount = filters.prodi.length + filters.periode.length + filters.indikator.length + (filters.minCount || filters.maxCount ? 1 : 0) + (filters.minSizeMB || filters.maxSizeMB ? 1 : 0);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dokumen Eviden {activeProdi && !isAdmin ? `- ${activeProdi.fullname}` : ''}</h1>
                    <p className="text-sm text-gray-500 mt-1">Manajemen bukti pendukung untuk akreditasi</p>
                </div>
                {!isAdmin && activeProdiId && (
                    <Button onClick={() => handleAction('add')} className="bg-gray-900 text-white hover:bg-gray-800 gap-2 font-bold shadow-md">
                        <Plus className="w-4 h-4" /> Tambah Eviden
                    </Button>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">{summary}</div>

            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <CardHeader className="border-b border-gray-100 bg-white px-6 py-4 flex flex-row items-center justify-between flex-wrap gap-4">
                    <CardTitle className="text-sm font-bold text-gray-900 shrink-0">Daftar Eviden</CardTitle>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input 
                                placeholder="Cari judul eviden..." 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                                className="pl-9 h-8 text-xs w-[250px] bg-white border-gray-200" 
                            />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 h-8 px-3 text-xs font-medium gap-2 outline-none">
                                <ArrowUpDown className="w-3.5 h-3.5"/> 
                                {sortConfig ? 'Tersortir' : 'Urutkan'}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel>Urutkan Berdasarkan</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    
                                    <DropdownMenuLabel className="text-[10px] uppercase text-gray-400 mt-1">Berdasarkan Judul</DropdownMenuLabel>
                                    <DropdownMenuCheckboxItem checked={sortConfig?.key === 'judul' && sortConfig.direction === 'asc'} onCheckedChange={() => setSortConfig({key: 'judul', direction: 'asc'})} className="gap-2 cursor-pointer"><SortAsc className="w-4 h-4"/> A - Z</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={sortConfig?.key === 'judul' && sortConfig.direction === 'desc'} onCheckedChange={() => setSortConfig({key: 'judul', direction: 'desc'})} className="gap-2 cursor-pointer"><SortDesc className="w-4 h-4"/> Z - A</DropdownMenuCheckboxItem>
                                    
                                    <DropdownMenuLabel className="text-[10px] uppercase text-gray-400 mt-1">Berdasarkan Periode</DropdownMenuLabel>
                                    <DropdownMenuCheckboxItem checked={sortConfig?.key === 'periode' && sortConfig.direction === 'desc'} onCheckedChange={() => setSortConfig({key: 'periode', direction: 'desc'})} className="gap-2 cursor-pointer"><CalendarDays className="w-4 h-4"/> Terbaru</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={sortConfig?.key === 'periode' && sortConfig.direction === 'asc'} onCheckedChange={() => setSortConfig({key: 'periode', direction: 'asc'})} className="gap-2 cursor-pointer"><CalendarDays className="w-4 h-4"/> Terlama</DropdownMenuCheckboxItem>
                                    
                                    <DropdownMenuLabel className="text-[10px] uppercase text-gray-400 mt-1">Berdasarkan Ukuran File</DropdownMenuLabel>
                                    <DropdownMenuCheckboxItem checked={sortConfig?.key === 'size' && sortConfig.direction === 'desc'} onCheckedChange={() => setSortConfig({key: 'size', direction: 'desc'})} className="gap-2 cursor-pointer"><HardDrive className="w-4 h-4"/> Terbesar</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={sortConfig?.key === 'size' && sortConfig.direction === 'asc'} onCheckedChange={() => setSortConfig({key: 'size', direction: 'asc'})} className="gap-2 cursor-pointer"><HardDrive className="w-4 h-4"/> Terkecil</DropdownMenuCheckboxItem>
                                    
                                    <DropdownMenuLabel className="text-[10px] uppercase text-gray-400 mt-1">Berdasarkan Jml. Dokumen</DropdownMenuLabel>
                                    <DropdownMenuCheckboxItem checked={sortConfig?.key === 'count' && sortConfig.direction === 'desc'} onCheckedChange={() => setSortConfig({key: 'count', direction: 'desc'})} className="gap-2 cursor-pointer"><FileStack className="w-4 h-4"/> Terbanyak</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={sortConfig?.key === 'count' && sortConfig.direction === 'asc'} onCheckedChange={() => setSortConfig({key: 'count', direction: 'asc'})} className="gap-2 cursor-pointer"><FileStack className="w-4 h-4"/> Paling Sedikit</DropdownMenuCheckboxItem>
                                    
                                    {sortConfig && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => setSortConfig(null)} className="text-red-600 focus:text-red-700 cursor-pointer justify-center text-xs font-bold">Reset Sort</DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger className={cn("inline-flex items-center justify-center rounded-lg border bg-white h-8 px-3 text-xs font-medium gap-2 outline-none transition-colors", activeFiltersCount > 0 ? "border-blue-500 text-blue-700 bg-blue-50/50 hover:bg-blue-100" : "border-gray-200 hover:bg-gray-100 text-gray-900")}>
                                <Filter className="w-3.5 h-3.5"/> Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="flex justify-between items-center">
                                        Filter Data
                                        {activeFiltersCount > 0 && (
                                            <button onClick={(e) => { e.stopPropagation(); setFilters({ prodi: [], periode: [], indikator: [], minCount: '', maxCount: '', minSizeMB: '', maxSizeMB: '' }); }} className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold"><RefreshCcw className="w-3 h-3"/> Reset</button>
                                        )}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    
                                    {isAdmin && (
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger className="gap-2"><Building className="w-4 h-4"/> Program Studi {filters.prodi.length > 0 && `(${filters.prodi.length})`}</DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                {accessibleProdis.map(p => (
                                                    <DropdownMenuCheckboxItem key={p.id} checked={filters.prodi.includes(p.id)} onCheckedChange={(c) => toggleFilterArray('prodi', p.id, c)}>{p.abbreviation || p.fullname}</DropdownMenuCheckboxItem>
                                                ))}
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                    )}

                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger className="gap-2"><CalendarDays className="w-4 h-4"/> Periode {filters.periode.length > 0 && `(${filters.periode.length})`}</DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                            {availablePeriodes.map(p => (
                                                <DropdownMenuCheckboxItem key={p} checked={filters.periode.includes(p)} onCheckedChange={(c) => toggleFilterArray('periode', p, c)}>{p}</DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>

                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger className="gap-2"><Filter className="w-4 h-4"/> Indikator / Kriteria {filters.indikator.length > 0 && `(${filters.indikator.length})`}</DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                                            {availableIndikators.map(ind => (
                                                <DropdownMenuCheckboxItem key={ind} checked={filters.indikator.includes(ind)} onCheckedChange={(c) => toggleFilterArray('indikator', ind, c)}>{ind}</DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>

                                    <DropdownMenuSeparator />

                                    <div className="px-2 py-2" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                        <Label className="text-[11px] font-bold text-gray-500 mb-2 uppercase flex items-center gap-2"><FileStack className="w-3.5 h-3.5"/> Rentang Jml Dokumen</Label>
                                        <div className="flex gap-2 items-center">
                                            <Input type="number" placeholder="Min" value={filters.minCount} onChange={e => setFilters({...filters, minCount: e.target.value})} className="h-7 text-xs bg-gray-50" />
                                            <span className="text-gray-400 text-xs">-</span>
                                            <Input type="number" placeholder="Max" value={filters.maxCount} onChange={e => setFilters({...filters, maxCount: e.target.value})} className="h-7 text-xs bg-gray-50" />
                                        </div>
                                    </div>

                                    <DropdownMenuSeparator />

                                    <div className="px-2 py-2" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                        <Label className="text-[11px] font-bold text-gray-500 mb-2 uppercase flex items-center gap-2"><HardDrive className="w-3.5 h-3.5"/> Total Ukuran (MB)</Label>
                                        <div className="flex gap-2 items-center">
                                            <Input type="number" placeholder="Min MB" value={filters.minSizeMB} onChange={e => setFilters({...filters, minSizeMB: e.target.value})} className="h-7 text-xs bg-gray-50" />
                                            <span className="text-gray-400 text-xs">-</span>
                                            <Input type="number" placeholder="Max MB" value={filters.maxSizeMB} onChange={e => setFilters({...filters, maxSizeMB: e.target.value})} className="h-7 text-xs bg-gray-50" />
                                        </div>
                                    </div>

                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="text-xs font-bold text-gray-500 px-6 py-4">Judul Eviden</TableHead>
                            {showProdiColumn && <TableHead className="text-xs font-bold text-gray-500 py-4">Program Studi</TableHead>}
                            <TableHead className="text-xs font-bold text-gray-500 py-4 whitespace-nowrap">Periode</TableHead>
                            <TableHead className="text-xs font-bold text-gray-500 py-4">Dokumen</TableHead>
                            <TableHead className="text-xs font-bold text-gray-500 py-4">Indikator</TableHead>
                            <TableHead className="text-xs font-bold text-gray-500 text-right pr-6 py-4">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isFetching ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-12 text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
                        ) : processedEviden.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-12 text-gray-500">Tidak ada eviden yang sesuai dengan pencarian atau filter.</TableCell></TableRow>
                        ) : (
                            processedEviden.map((eviden) => {
                                return (
                                    <TableRow key={eviden.id} className="hover:bg-gray-50/40">
                                        <TableCell className="px-6 py-4 font-bold text-sm text-gray-900">{eviden.judul}</TableCell>
                                        {showProdiColumn && <TableCell className="py-4 text-sm text-gray-600">{eviden.prodi?.abbreviation || eviden.prodi?.fullname || '-'}</TableCell>}
                                        <TableCell className="py-4 text-sm font-medium text-gray-600 whitespace-nowrap">{eviden.periode || '-'}</TableCell>
                                        <TableCell className="py-4 text-sm text-gray-600">
                                            {eviden.fileCount} File <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded ml-1">{formatBytes(eviden.totalSizeBytes)}</span>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex gap-1.5 flex-wrap">
                                                {eviden.indikator.map((ind: string) => (
                                                    <span key={ind} className="bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">{ind}</span>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 text-right pr-6">
                                            <div className="flex justify-end gap-4">
                                                <button onClick={() => handleAction('view', eviden.id)} className="text-blue-500 hover:text-blue-700 text-[11px] font-bold flex items-center gap-1.5"><Eye className="w-3.5 h-3.5"/> Lihat</button>
                                                {!isAdmin && (
                                                    <>
                                                        <button onClick={() => handleAction('edit', eviden.id)} className="text-emerald-600 hover:text-emerald-800 text-[11px] font-bold flex items-center gap-1.5"><Edit className="w-3.5 h-3.5"/> Edit</button>
                                                        <button disabled={isDeletingId === eviden.id} onClick={() => handleDelete(eviden.id)} className="text-red-500 hover:text-red-700 text-[11px] font-bold flex items-center gap-1.5 disabled:opacity-50">
                                                            {isDeletingId === eviden.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5"/>} Hapus
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}