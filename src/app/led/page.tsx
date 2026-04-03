"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadCloud, Download, FileText, CheckCircle2, Clock, ChevronLeft, ChevronRight, BookOpen, Eye } from "lucide-react";
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
            
            // Skenario jika prodi benar-benar kosong sama sekali
            if (!periods || periods.length === 0) {
                periods = [currentYear];
            } else {
                // Cari nilai maksimum antara tahun terakhir dari API dan Tahun Saat Ini
                const lastPeriod = periods[periods.length - 1];
                if (parseInt(currentYear) > parseInt(lastPeriod)) {
                    periods.push(currentYear);
                }
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

    if (!activePeriode) return <div className="p-8 text-gray-500">Memuat antarmuka...</div>;

    return (
    <div className="space-y-6">
        {/* 1. HEADER (Judul & Deskripsi) */}
        <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{prodiName}</h1>
            <p className="text-sm text-gray-500 mt-1">Manajemen arsip Laporan Evaluasi Diri (LED)</p>
        </header>

        {/* 2. SELECTION PERIODE & NAVIGASI KEMBALI */}
        <div className="relative flex items-center justify-center py-2 border-b border-gray-200 mb-8 pb-4 min-h-[50px]">
        
        {/* NAVIGASI KEMBALI */}
        {isGuest && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
            <Button 
                variant="ghost" 
                onClick={() => router.push('/led')} 
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 -ml-3 gap-2 font-semibold text-sm"
            >
                &larr; Kembali ke Daftar Prodi
            </Button>
            </div>
        )}

        {/* NAVIGASI PERIODE */}
        <div className="flex items-center">
            <button 
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-900 mr-4 transition-colors"
            onClick={() => { const idx = availablePeriods.indexOf(activePeriode); if (idx > 0) setActivePeriode(availablePeriods[idx - 1]); }}
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide px-2">
            {availablePeriods.map((period) => (
                <button
                key={period}
                onClick={() => setActivePeriode(period)}
                className={cn(
                    "px-5 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 whitespace-nowrap outline-none", 
                    activePeriode === period 
                    ? "bg-gray-900 text-white shadow-sm" 
                    : "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                )}
                >
                {period}
                </button>
            ))}
            </div>

            <button 
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-900 ml-4 transition-colors"
            onClick={() => { const idx = availablePeriods.indexOf(activePeriode); if (idx < availablePeriods.length - 1) setActivePeriode(availablePeriods[idx + 1]); }}
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
        </div>

        {/* 3. KONTEN (GRID) */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-240px)] min-h-[700px]">
        
        {/* KOLOM KIRI (UPLOAD & HISTORY) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full min-h-0">
            
            {canUpload && (
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden shrink-0">
                <CardHeader className="px-5 py-4 border-b border-gray-100 bg-white">
                    <CardTitle className="text-sm font-bold text-gray-900">Impor Dokumen ({activePeriode})</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                    <div 
                        className={cn("border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer group transition-colors", isDragging ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:bg-gray-50")}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFileSelection(e.dataTransfer.files[0]); }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-5 h-5 text-blue-600" />
                        </div>
                        {selectedFile ? <div className="text-sm font-medium text-blue-600 truncate max-w-full px-2">{selectedFile.name}</div> : <><p className="text-[13px] font-medium text-gray-900">Klik atau drag file</p><p className="text-[11px] text-gray-500 mt-1">Maks 10MB (.docx)</p></>}
                    </div>
                    <input type="file" className="hidden" ref={fileInputRef} accept=".doc,.docx" onChange={(e) => e.target.files && handleFileSelection(e.target.files[0])} />
                    <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold shadow-md h-10">
                        {isUploading ? "Mengunggah..." : selectedFile ? `Simpan ke ${activePeriode}` : "Pilih File"}
                    </Button>
                </CardContent>
            </Card>
            )}

            {/* HISTORY CARD */}
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
            <CardHeader className="px-5 py-4 border-b border-gray-100 bg-white shrink-0">
                <CardTitle className="text-sm font-bold text-gray-900">Riwayat Versi ({activePeriode})</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1 min-h-0">
                {isHistoryLoading ? <div className="p-5 text-center text-sm text-gray-500 animate-pulse">Memuat riwayat...</div> 
                : history.length === 0 ? <div className="p-5 text-center text-sm text-gray-500">Belum ada dokumen yang diunggah.</div> 
                : history.map((item, index) => {
                    const isLatest = index === 0; 
                    const isSelected = activeDocumentId === item.id;
                    return (
                        <div key={item.id} onClick={() => setActiveDocumentId(item.id)} className={cn("px-5 py-4 border-b border-gray-50 flex items-start gap-3 transition-colors cursor-pointer", isSelected ? "bg-[#eef2ff] border-l-4 border-l-blue-500" : "bg-white hover:bg-gray-50 opacity-80")}>
                            <div className="mt-0.5">{isLatest ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-gray-400" />}</div>
                            <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                                <span className={cn("text-[13px] font-bold truncate", isLatest ? "text-green-800" : "text-gray-700")}>Versi {item.versi} {isLatest && "(Terbaru)"}</span>
                                <span className={cn("text-[11px] font-medium whitespace-nowrap ml-2", isLatest ? "text-green-600" : "text-gray-500")}>{formatDate(item.createdAt)}</span>
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
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col h-full min-h-0">
                <div className="px-6 py-4 border-b border-gray-100 bg-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0"><FileText className="w-5 h-5" /></div>
                        <div className="overflow-hidden">
                            <h2 className="text-[15px] font-bold text-gray-900 leading-tight truncate">
                                {history.find(d => d.id === activeDocumentId)?.name || `Preview LED (${activePeriode})`}
                            </h2>
                            <p className="text-[12px] text-gray-500 truncate">
                            {activeDocumentId && history.find(d => d.id === activeDocumentId)
                                ? `Versi ${history.find(d => d.id === activeDocumentId).versi} • ${formatDate(history.find(d => d.id === activeDocumentId).createdAt)}`
                                : 'Live Preview (docx)'}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleDownload} disabled={!activeDocumentId} className="rounded-lg h-9 text-xs font-bold text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm gap-2 shrink-0 ml-4">
                    <Download className="w-4 h-4 text-gray-500" /> Unduh (.docx)
                    </Button>
                </div>
                
                <div className="flex-1 bg-gray-100/50 p-6 overflow-y-auto flex justify-center min-h-0">
                    <div className="w-[800px] max-w-full relative">
                        {isPreviewLoading && <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 rounded shadow-sm"><span className="font-bold text-gray-600 animate-pulse">Merender Dokumen...</span></div>}
                        <div ref={previewRef} className="bg-white border border-gray-200 shadow-sm min-h-[1000px] pb-12">
                            <div className="h-full flex items-center justify-center text-gray-400 p-12 text-center">
                                {!activeDocumentId ? `Belum ada dokumen aktif untuk periode ${activePeriode}...` : ""}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
        </div>
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

    if (loading) return <div className="p-8 text-gray-500">Memuat otorisasi...</div>;
    if (!user) return null;

    const isGuestRole = user.role === 'PIMPINAN' || user.role === 'SUPER_ADMIN';
    const canUpload = user.role === 'KAPRODI' || user.role === 'TIM_PRODI';

    // Skenario 1: Pimpinan/Admin melihat halaman awal (/led) -> Tampilkan Tabel Prodi
    if (isGuestRole && !urlProdiId) {
        return <ProdiListView />;
    }

    // Skenario 2: Pimpinan/Admin sudah memilih prodi (/led?prodiId=xyz) -> Tampilkan LED Read-Only
    if (isGuestRole && urlProdiId) {
        return <DocumentView targetProdiId={urlProdiId} canUpload={false} isGuest={true} />;
    }

    // Skenario 3: Kaprodi/Tim Prodi (/led) -> Tampilkan LED Upload Mode
    if (canUpload && user.prodiId) {
        return <DocumentView targetProdiId={user.prodiId} canUpload={true} isGuest={false} />;
    }

    return <div className="p-8 text-red-500 font-bold">Akses ditolak atau Program Studi tidak ditemukan.</div>;
}

export default function LEDPage() {
    return (
        <Suspense fallback={<div className="p-8">Memuat halaman...</div>}>
            <LEDPageContent />
        </Suspense>
    );
}