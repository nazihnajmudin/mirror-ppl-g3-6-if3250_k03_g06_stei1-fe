"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Plus, Eye, Edit, Trash2, ArrowUpDown, Filter, SortAsc, SortDesc, CalendarDays, Building, Loader2 } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import apiClient from "@/lib/api-client";

// FUNGSI BANTUAN UNTUK FORMAT UKURAN FILE
const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals < 0 ? 0 : decimals))} ${sizes[i]}`;
};

export default function EvidenListPage() {
    const router = useRouter();
    const { user, loading } = useUser();
    
    // STATE API
    const [evidenList, setEvidenList] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

    const fetchEviden = async () => {
        setIsFetching(true);
        try {
            const res = await apiClient.get('/eviden');
            setEvidenList(res.data.data || []);
        } catch (error) {
            console.error("Gagal mengambil data eviden", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (user) fetchEviden();
    }, [user]);

    const handleAction = (mode: 'view' | 'edit' | 'add', id?: string) => {
        router.push(`/eviden/form?mode=${mode}${id ? `&id=${id}` : ''}`);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus dokumen eviden ini secara permanen?")) return;
        setIsDeletingId(id);
        try {
            await apiClient.delete(`/eviden/${id}`);
            alert("Eviden berhasil dihapus.");
            fetchEviden();
        } catch (error) {
            alert("Gagal menghapus eviden.");
        } finally {
            setIsDeletingId(null);
        }
    };

    if (loading) return <div className="p-8 text-gray-500">Memuat...</div>;
    if (!user) return null;

    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'PIMPINAN';
    const showProdiColumn = isAdmin || user.role === 'TIM_PRODI';

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dokumen Eviden</h1>
                    <p className="text-sm text-gray-500 mt-1">Manajemen bukti pendukung untuk akreditasi</p>
                </div>
                {!isAdmin && (
                    <Button onClick={() => handleAction('add')} className="bg-gray-900 text-white hover:bg-gray-800 gap-2 font-bold shadow-md">
                        <Plus className="w-4 h-4" /> Tambah Eviden
                    </Button>
                )}
            </header>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {isAdmin ? (
                    <>
                        <Card><CardContent className="p-6 text-center"><p className="text-sm text-gray-500 font-medium">Total Seluruh Eviden</p><p className="text-3xl font-bold text-gray-900 mt-2">{evidenList.length}</p></CardContent></Card>
                        <Card><CardContent className="p-6 text-center"><p className="text-sm text-gray-500 font-medium">Prodi Lengkap Eviden</p><p className="text-3xl font-bold text-emerald-600 mt-2">-</p></CardContent></Card>
                        <Card><CardContent className="p-6 text-center"><p className="text-sm text-gray-500 font-medium">Prodi Belum Lengkap</p><p className="text-3xl font-bold text-red-500 mt-2">-</p></CardContent></Card>
                    </>
                ) : (
                    <>
                        <Card><CardContent className="p-6 text-center"><p className="text-sm text-gray-500 font-medium">Total Eviden</p><p className="text-3xl font-bold text-gray-900 mt-2">{evidenList.length}</p></CardContent></Card>
                        <Card><CardContent className="p-6 text-center"><p className="text-sm text-gray-500 font-medium">Kriteria Tercakup</p><p className="text-3xl font-bold text-gray-900 mt-2">-</p><p className="text-sm text-gray-500 mt-1">dari 9 Kriteria</p></CardContent></Card>
                        <Card><CardContent className="p-6 text-center"><p className="text-sm text-gray-500 font-medium">Kriteria Belum Ada Eviden</p><p className="text-lg font-bold text-red-500 mt-3">-</p></CardContent></Card>
                    </>
                )}
            </div>

            {/* TABEL EVIDEN */}
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <CardHeader className="border-b border-gray-100 bg-white px-6 py-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold text-gray-900">Daftar Eviden</CardTitle>
                    <div className="flex gap-2">
                        {/* DROPDOWN SORT */}
                        <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 h-8 px-3 text-xs font-medium gap-2 outline-none transition-colors">
                                <ArrowUpDown className="w-3.5 h-3.5"/> Urutkan
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Urutkan Berdasarkan</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2 cursor-pointer"><SortAsc className="w-4 h-4"/> A - Z (Judul)</DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer"><SortDesc className="w-4 h-4"/> Z - A (Judul)</DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer"><CalendarDays className="w-4 h-4"/> Terbaru</DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer"><CalendarDays className="w-4 h-4"/> Terlama</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* DROPDOWN FILTER */}
                        <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-900 h-8 px-3 text-xs font-medium gap-2 outline-none transition-colors">
                                <Filter className="w-3.5 h-3.5"/> Filter
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Filter Data</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2 cursor-pointer"><Building className="w-4 h-4"/> Program Studi</DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer"><Filter className="w-4 h-4"/> Indikator / Kriteria</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="text-xs font-bold text-gray-500 px-6 py-4">Judul Eviden</TableHead>
                            {showProdiColumn && <TableHead className="text-xs font-bold text-gray-500 py-4">Program Studi</TableHead>}
                            <TableHead className="text-xs font-bold text-gray-500 py-4 whitespace-nowrap">Masa Akreditasi</TableHead>
                            <TableHead className="text-xs font-bold text-gray-500 py-4">Dokumen</TableHead>
                            <TableHead className="text-xs font-bold text-gray-500 py-4">Indikator</TableHead>
                            <TableHead className="text-xs font-bold text-gray-500 text-right pr-6 py-4">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isFetching ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
                        ) : evidenList.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Belum ada eviden.</TableCell></TableRow>
                        ) : (
                            evidenList.map((eviden) => {
                                // Hitung total ukuran dari metadata file yang dikirim backend
                                const totalSizeBytes = eviden.files.reduce((sum: number, f: any) => sum + f.size, 0);
                                const formatYear = (dateString?: string) => dateString ? new Date(dateString).getFullYear() : '-';

                                return (
                                    <TableRow key={eviden.id} className="hover:bg-gray-50/40">
                                        <TableCell className="px-6 py-4 font-bold text-sm text-gray-900">{eviden.judul}</TableCell>
                                        {showProdiColumn && <TableCell className="py-4 text-sm text-gray-600">{eviden.prodi?.fullname || '-'}</TableCell>}
                                        <TableCell className="py-4 text-sm font-medium text-gray-600 whitespace-nowrap">{formatYear(eviden.startDate)} - {formatYear(eviden.endDate)}</TableCell>
                                        <TableCell className="py-4 text-sm text-gray-600">
                                            {eviden.files.length} File <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded ml-1">{formatBytes(totalSizeBytes)}</span>
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