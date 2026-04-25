"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadCloud, Download, FileText, CheckCircle2, Clock, ChevronLeft, ChevronRight, BookOpen, Eye, Trash2, AlertTriangle, X, PenLine, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import { useUser } from "@/hooks/useUser";
declare module 'docx-preview';

// FUNGSI FORMATTING
const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals < 0 ? 0 : decimals))} ${sizes[i]}`;
};

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};

// ============================================================================
// 1. KOMPONEN TABEL (PIMPINAN & SUPER_ADMIN)
// ============================================================================
function ProdiListView() {
    const router = useRouter();
    const [prodis, setProdis] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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
            <h1 className="text-2xl font-bold text-gray-900">Dokumen LED Institusi</h1>
            <p className="text-sm text-gray-500 mt-1">Pilih Program Studi untuk melihat Laporan Evaluasi Diri.</p>
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
                    onClick={() => router.push(`/led?prodiId=${prodi.id}`)}
                    className="h-8 text-xs font-bold gap-2"
                    >
                    <Eye className="w-4 h-4" /> Lihat LED
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
// 2. KOMPONEN UTAMA (DOKUMEN LED DETAIL)
// ============================================================================
function DocumentView({ targetProdiId, canUpload, isGuest }: { targetProdiId: string, canUpload: boolean, isGuest: boolean }) {
    const router = useRouter();
    const { user } = useUser();
    const [prodiName, setProdiName] = useState<string>("Memuat Nama Prodi...");
    
    // Identifikasi Admin
    const isAdmin = user?.role === 'SUPER_ADMIN';

    // State Periode, History, Preview
    const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
    const [activePeriode, setActivePeriode] = useState<string>("");
    const [history, setHistory] = useState<any[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

    // State Upload
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    // State Delete Modal
    const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, type: 'single' | 'all', doc?: any}>({ isOpen: false, type: 'single' });
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const activeDoc = history.find(d => d.id === activeDocumentId);
    const hasFinalDocument = history.some(d => d.status === 'FINAL');
    const hasDraftDocuments = history.some(d => d.status === 'DRAFT');
    const [selectedTemplate, setSelectedTemplate] = useState<'lam-teknik' | 'lam-infokom'>('lam-teknik');

    // Fetch Nama Prodi
    useEffect(() => {
        const fetchProdiDetail = async () => {
            try {
                if (!isGuest && user?.prodi?.fullname) {
                    setProdiName(user.prodi.fullname);
                } else {
                    const res = await apiClient.get(`/prodi/${targetProdiId}`);
                    setProdiName(res.data.data.fullname);
                }
            } catch (error) {
                setProdiName("Program Studi");
            }
        };
        if (targetProdiId) fetchProdiDetail();
    }, [targetProdiId, user, isGuest]);

    // Fetch Available Periods
    useEffect(() => {
        const fetchPeriods = async () => {
            try {
                const res = await apiClient.get(`/led/periods/${targetProdiId}`);
                let periods: string[] = res.data.data;
                const currentYear = new Date().getFullYear().toString();
                
                if (!periods || periods.length === 0) {
                    periods = [currentYear];
                } else {
                    const lastPeriod = periods[periods.length - 1];
                    if (parseInt(currentYear) > parseInt(lastPeriod)) periods.push(currentYear);
                }

                const uniquePeriods = Array.from(new Set(periods)).sort();
                setAvailablePeriods(uniquePeriods);
                setActivePeriode(uniquePeriods[uniquePeriods.length - 1]);
            } catch (error) {
                const currentYear = new Date().getFullYear().toString();
                setAvailablePeriods([currentYear]);
                setActivePeriode(currentYear);
            }
        };
        if (targetProdiId) fetchPeriods();
    }, [targetProdiId]);

    // Fetch History
    const fetchHistory = async () => {
        setIsHistoryLoading(true);
        try {
            const response = await apiClient.get(`/led/history/${targetProdiId}/${activePeriode}`);
            const data = response.data.data || [];
            setHistory(data);
            if (data.length > 0) {
                setActiveDocumentId(data[0].id);
            } else {
                setActiveDocumentId(null);
                if (previewRef.current) previewRef.current.innerHTML = `<div class="h-full flex items-center justify-center text-gray-400 p-12 text-center">Belum ada dokumen untuk periode ini.</div>`;
            }
        } catch (error) {
            setHistory([]);
            setActiveDocumentId(null);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    useEffect(() => {
        if (targetProdiId && activePeriode) fetchHistory();
    }, [targetProdiId, activePeriode]);

    // Load Preview
    const loadPreview = async (documentId: string) => {
        setIsPreviewLoading(true);
        try {
            const response = await apiClient.get(`/led/export/document/${documentId}`, { responseType: 'blob' });
            if (previewRef.current) {
                previewRef.current.innerHTML = ""; 
                
                const docx = await import("docx-preview");
                
                // Cek kompatibilitas import Next.js
                const renderDocx = docx.renderAsync || docx.default?.renderAsync;
                
                if (!renderDocx) {
                    throw new Error("Fungsi renderAsync tidak ditemukan pada modul docx-preview");
                }
                
                await renderDocx(response.data, previewRef.current, undefined, {
                    className: "docx", inWrapper: true, ignoreWidth: false, ignoreHeight: false, ignoreFonts: false, breakPages: true,
                });
            }
        } catch (error) {
            console.error("ERROR SAAT RENDER PREVIEW:", error);
            
            if (previewRef.current) {
                previewRef.current.innerHTML = `
                    <div class="h-full flex flex-col items-center justify-center text-gray-400 p-12 text-center">
                    <p>Gagal memuat preview dokumen.</p>
                    <p class="text-[10px] mt-2 text-red-400">Silakan cek Console DevTools untuk detail error.</p>
                    </div>
                `;
            }
        } finally {
            setIsPreviewLoading(false);
        }
    };

    useEffect(() => {
        if (activeDocumentId) loadPreview(activeDocumentId);
    }, [activeDocumentId]);

    // Handlers Upload & Download
    const handleFileSelection = (file: File) => {
        if (!['.doc', '.docx'].includes(file.name.substring(file.name.lastIndexOf('.')).toLowerCase())) { 
            alert("Format tidak valid!"); 
            return; 
        }
        if (file.size > 10 * 1024 * 1024) { 
            alert("Ukuran file maksimal 10MB!"); 
            return;
        }
        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile || !targetProdiId || !canUpload) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("prodiId", targetProdiId); 
            formData.append("periode", activePeriode);
            
            await apiClient.post('/led/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            
            alert(`File berhasil diunggah untuk periode ${activePeriode}!`);
            setSelectedFile(null);
            fetchHistory();
        } catch (error: any) {
            alert(error?.response?.data?.message || "Gagal mengunggah file.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = async () => {
        if (!activeDocumentId) return;
        try {
            const response = await apiClient.get(`/led/export/document/${activeDocumentId}`, { responseType: 'blob' });
            let filename = `LED_Document.docx`; 
            const disposition = response.headers['content-disposition'];
            
            if (disposition && disposition.indexOf('filename=') !== -1) {
                const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
                if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            
            link.href = url;
            link.setAttribute('download', filename); 
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert(`Gagal mengunduh dokumen.`);
        }
    };

    // Handler Hapus
    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, type: 'single' });
        setDeleteConfirmText("");
    };

    const executeDelete = async () => {
        setIsDeleting(true);
        try {
            if (deleteModal.type === 'single' && deleteModal.doc) {
                await apiClient.delete(`/led/document/${deleteModal.doc.id}`);
                alert(`Versi ${deleteModal.doc.versi} berhasil dihapus.`);
            } else if (deleteModal.type === 'all') {
                await apiClient.delete(`/led/periode/${targetProdiId}/${activePeriode}`);
                alert(`Semua dokumen DRAFT periode ${activePeriode} berhasil dihapus.`);
            }
            closeDeleteModal();
            fetchHistory();
        } catch (error: any) {
            alert(error?.response?.data?.message || "Terjadi kesalahan saat menghapus data.");
        } finally {
            setIsDeleting(false);
        }
    };

    // Logika disable tombol hapus di Modal
    const isDeleteDisabled = () => {
        if (isDeleting) return true;
        
        if (deleteModal.type === 'all') {
            return deleteConfirmText !== `HAPUS DRAFT ${activePeriode}`;
        }
        
        if (deleteModal.type === 'single' && deleteModal.doc?.status === 'FINAL') {
            return deleteConfirmText !== "SAYA YAKIN HAPUS FINAL";
        }
        
        return false; // Dokumen DRAFT biasa tidak butuh ketik konfirmasi
    };

    if (!activePeriode) return <div className="p-8 text-gray-500">Memuat antarmuka...</div>;

    return (
        <div className="space-y-6 relative">
        
        {/* 1. HEADER */}
        <header className="mb-6 flex items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{prodiName}</h1>
                <p className="text-sm text-gray-500 mt-1">Manajemen arsip Laporan Evaluasi Diri (LED)</p>
            </div>
            {canUpload && (
                <div className="flex items-center gap-2 shrink-0">
                    {/* Template Selector Tabs */}
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
                        <button
                            onClick={() => setSelectedTemplate('lam-teknik')}
                            className={cn("px-3 py-1.5", selectedTemplate === 'lam-teknik' ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50")}
                        >LAM Teknik</button>
                        <button
                            onClick={() => setSelectedTemplate('lam-infokom')}
                            className={cn("px-3 py-1.5 border-l border-gray-200", selectedTemplate === 'lam-infokom' ? "bg-emerald-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50")}
                        >LAM INFOKOM</button>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/led/form?prodiId=${targetProdiId}&template=${selectedTemplate}`)}
                        className="gap-2 text-sm font-semibold"
                    >
                        <PenLine className="w-4 h-4" />
                        Isi Formulir LED
                    </Button>
                </div>
            )}
        </header>

        {/* 2. SELECTION PERIODE & NAVIGASI */}
        <div className="relative flex items-center justify-center py-2 border-b border-gray-200 mb-8 pb-4 min-h-[50px]">
            {isGuest && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
                    <Button variant="ghost" onClick={() => router.push('/led')} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 -ml-3 gap-2 font-semibold text-sm">
                    &larr; Kembali ke Daftar Prodi
                    </Button>
                </div>
            )}
            <div className="flex items-center">
                <button className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 mr-4" onClick={() => { const idx = availablePeriods.indexOf(activePeriode); if (idx > 0) setActivePeriode(availablePeriods[idx - 1]); }}><ChevronLeft className="w-5 h-5" /></button>
                <div className="flex gap-2 overflow-x-auto px-2">
                    {availablePeriods.map((period) => (
                        <button key={period} onClick={() => setActivePeriode(period)} className={cn("px-5 py-1.5 text-sm font-semibold rounded-full", activePeriode === period ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100")}>{period}</button>
                    ))}
                </div>
                <button className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 ml-4" onClick={() => { const idx = availablePeriods.indexOf(activePeriode); if (idx < availablePeriods.length - 1) setActivePeriode(availablePeriods[idx + 1]); }}><ChevronRight className="w-5 h-5" /></button>
            </div>
        </div>

        {/* 3. KONTEN GRID */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-240px)] min-h-[750px]">
            
            {/* KOLOM KIRI */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full min-h-0">
            {canUpload && (
                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm shrink-0">
                    <CardHeader className="px-5 py-4 border-b border-gray-100"><CardTitle className="text-sm font-bold">Impor Dokumen ({activePeriode})</CardTitle></CardHeader>
                    <CardContent className="p-5">
                        <div 
                        className={cn("border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer group", isDragging ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:bg-gray-50")}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.length) handleFileSelection(e.dataTransfer.files[0]); }}
                        onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><UploadCloud className="w-5 h-5 text-blue-600" /></div>
                            {selectedFile ? <div className="text-sm font-medium text-blue-600 truncate px-2">{selectedFile.name}</div> : <><p className="text-[13px] font-medium text-gray-900">Klik atau drag file</p><p className="text-[11px] text-gray-500">Maks 10MB (.docx)</p></>}
                        </div>
                        <input type="file" className="hidden" ref={fileInputRef} accept=".doc,.docx" onChange={(e) => e.target.files && handleFileSelection(e.target.files[0])} />
                        <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-10 text-xs shadow-md">{isUploading ? "Mengunggah..." : "Simpan Dokumen"}</Button>
                    </CardContent>
                </Card>
            )}

            {/* HISTORY CARD */}
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm flex-1 flex flex-col min-h-0">
                <CardHeader className="px-5 py-4 border-b border-gray-100 flex flex-row justify-between items-center shrink-0">
                    <CardTitle className="text-sm font-bold text-gray-900">Riwayat Versi ({activePeriode})</CardTitle>
                    {isAdmin && hasFinalDocument && hasDraftDocuments && (
                        <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => setDeleteModal({ isOpen: true, type: 'all' })} 
                        className="h-7 text-[10px] px-2 gap-1 font-bold animate-in fade-in slide-in-from-right-2"
                        >
                            <Trash2 className="w-3 h-3" /> Hapus Semua Versi Draft
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto flex-1 min-h-0">
                {isHistoryLoading ? <div className="p-5 text-center text-sm text-gray-500 animate-pulse">Memuat riwayat...</div> 
                : history.length === 0 ? <div className="p-5 text-center text-sm text-gray-500">Belum ada dokumen yang diunggah.</div> 
                : history.map((item, index) => {
                    const isLatest = index === 0; 
                    const isSelected = activeDocumentId === item.id;
                    return (
                        <div key={item.id} onClick={() => setActiveDocumentId(item.id)} className={cn("px-5 py-4 border-b border-gray-50 flex items-start gap-3 transition-colors cursor-pointer group", isSelected ? "bg-[#eef2ff] border-l-4 border-l-blue-500" : "bg-white hover:bg-gray-50 opacity-80")}>
                            <div className="mt-0.5">{isLatest ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-gray-400" />}</div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className={cn("text-[13px] font-bold truncate", isLatest ? "text-green-800" : "text-gray-700")}>Versi {item.versi} {isLatest && "(Terbaru)"}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-[11px] font-medium whitespace-nowrap ml-2", isLatest ? "text-green-600" : "text-gray-500")}>{formatDate(item.createdAt)}</span>
                                        {/* Tombol Delete Single (Hanya Admin) */}
                                        {isAdmin && (
                                        <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, type: 'single', doc: item }); }} className="text-gray-300 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-all opacity-0 group-hover:opacity-100">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-[11px] text-gray-600 truncate">Oleh: {item.pengunggah?.name || "Tidak diketahui"}</p>
                                <p className="text-[10px] text-gray-400 mt-1 truncate">{item.name} • {formatBytes(item.ukuran)}</p>
                            </div>
                        </div>
                    );
                    })}
                </CardContent>
            </Card>
            </div>

            {/* KOLOM KANAN (PREVIEW) */}
            <div className="col-span-12 lg:col-span-8 flex flex-col h-full min-h-0">
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col h-full min-h-0">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0"><FileText className="w-5 h-5" /></div>
                        <div className="overflow-hidden">
                            <h2 className="text-[15px] font-bold text-gray-900 leading-tight truncate">{activeDoc?.name || `Preview LED (${activePeriode})`}</h2>
                            <p className="text-[12px] text-gray-500 truncate">{activeDoc ? `Versi ${activeDoc.versi} • ${formatDate(activeDoc.createdAt)}` : 'Live Preview (docx)'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                        {/* BADGE STATUS DOKUMEN */}
                        {activeDoc && (
                        <span className={cn("px-3 py-1.5 text-[11px] font-bold rounded-md border tracking-wide uppercase shadow-sm", activeDoc.status === 'FINAL' ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-700 border-green-200")}>
                            {activeDoc.status}
                        </span>
                        )}
                        <Button variant="outline" onClick={handleDownload} disabled={!activeDocumentId} className="rounded-lg h-9 text-xs font-bold text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm gap-2">
                            <Download className="w-4 h-4 text-gray-500" /> Unduh
                        </Button>
                    </div>
                </div>
                
                <div className="flex-1 bg-gray-100/50 p-6 overflow-y-auto flex justify-center min-h-0">
                    <div className="w-[800px] max-w-full relative">
                        {isPreviewLoading && <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10"><span className="font-bold text-gray-600 animate-pulse">Merender Dokumen...</span></div>}
                        <div ref={previewRef} className="bg-white border shadow-sm min-h-[1000px] pb-12">
                            <div className="h-full flex items-center justify-center text-gray-400 p-12 text-center">{!activeDocumentId ? `Belum ada dokumen aktif untuk periode ${activePeriode}...` : ""}</div>
                        </div>
                    </div>
                </div>
            </Card>
            </div>
        </div>

        {/* MODAL SOFT DELETE */}
        {deleteModal.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center justify-between">
                        <h3 className="text-red-700 font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Peringatan</h3>
                        <button onClick={closeDeleteModal} className="text-red-400 hover:text-red-700"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="p-6">
                        {deleteModal.type === 'single' ? (
                            <>
                            <p className="text-gray-700 text-sm mb-4">Anda akan <strong>MENGHAPUS</strong> dokumen <strong>Versi {deleteModal.doc?.versi}</strong> ({deleteModal.doc?.name}).</p>
                            {deleteModal.doc?.status === 'FINAL' && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                    <p className="text-red-800 text-xs font-bold mb-2">DOKUMEN INI BERSTATUS FINAL!</p>
                                    <p className="text-red-700 text-xs mb-3">Untuk melanjutkan, ketik: <span className="font-mono bg-white px-1 border border-red-200 select-all">SAYA YAKIN HAPUS FINAL</span></p>
                                    <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} className="w-full px-3 py-2 text-sm border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Ketik di sini..." />
                                </div>
                            )}
                            </>
                        ) : (
                            <>
                            <p className="text-gray-700 text-sm mb-4">Anda akan <strong>MENGHAPUS SEMUA VERSI DRAFT</strong> di periode <strong>{activePeriode}</strong>. Tindakan ini tidak memengaruhi dokumen FINAL.</p>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <p className="text-red-700 text-xs mb-3">Untuk melanjutkan, ketik: <span className="font-mono bg-white px-1 border border-red-200 select-all">HAPUS SEMUA {activePeriode}</span></p>
                                <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} className="w-full px-3 py-2 text-sm border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500" placeholder={`HAPUS SEMUA ${activePeriode}`} />
                            </div>
                            </>
                        )}
                    </div>
                    <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
                    <Button variant="outline" onClick={closeDeleteModal}>Batal</Button>
                    <Button variant="destructive" onClick={executeDelete} disabled={isDeleteDisabled()}>
                        {isDeleting ? "Menghapus..." : "Hapus Dokumen"}
                    </Button>
                    </div>
                </div>
            </div>
        )}

        </div>
    );
}

// ============================================================================
// 3. MAIN WRAPPER (ROUTING & RBAC)
// ============================================================================
function LEDPageContent() {
    const { user, loading } = useUser();
    const searchParams = useSearchParams();
    const urlProdiId = searchParams.get("prodiId");
    const [accessibleProdis, setAccessibleProdis] = useState<any[]>([]);
    const [isProdiLoading, setIsProdiLoading] = useState(true);

    useEffect(() => {
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
    const canUpload = user.role === 'KAPRODI' || user.role === 'TIM_PRODI';

    // Jika ada prodiId di URL, tampilkan detail (dengan izin yang sesuai)
    if (urlProdiId) {
        // Cek apakah user berhak akses prodi ini
        const hasAccess = accessibleProdis.some(p => p.id === urlProdiId);
        if (!hasAccess && !isGuestRole) {
            return <div className="p-8 text-red-500 font-bold">Akses ditolak. Anda tidak ditugaskan di program studi ini.</div>;
        }
        
        // Admin/Pimpinan selalu read-only
        const viewOnly = isGuestRole;
        return <DocumentView targetProdiId={urlProdiId} canUpload={!viewOnly} isGuest={isGuestRole} />;
    }

    // Jika tidak ada prodiId di URL:
    // 1. Jika user punya lebih dari 1 prodi akses (atau Admin/Pimpinan), tampilkan LIST
    if (isGuestRole || accessibleProdis.length > 1) {
        return <ProdiListView />;
    }

    // 2. Jika user cuma punya 1 prodi akses, langsung arahkan ke detail prodi itu
    if (accessibleProdis.length === 1) {
        const myProdiId = accessibleProdis[0].id;
        return <DocumentView targetProdiId={myProdiId} canUpload={true} isGuest={false} />;
    }

    return <div className="p-8 text-red-500 font-bold">Program Studi tidak ditemukan atau Anda tidak memiliki akses.</div>;
}

export default function LEDPage() {
    return (
        <Suspense fallback={<div className="p-8">Memuat halaman...</div>}>
            <LEDPageContent />
        </Suspense>
    );
}