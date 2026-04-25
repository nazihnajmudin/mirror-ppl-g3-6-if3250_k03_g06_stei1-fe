"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, Download, Trash2, FileText, Image as ImageIcon, FileSpreadsheet, FileArchive, Music, Video, MonitorPlay, Save, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import apiClient from "@/lib/api-client";
import dynamic from 'next/dynamic';

// Import React Quill secara dinamis (karena tidak mendukung SSR)
import 'react-quill-new/dist/quill.snow.css';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const KRITERIA_LIST = [
    { id: "K1", label: "Visi, Misi, Tujuan & Strategi" },
    { id: "K2", label: "Tata Pamong & Kerjasama" },
    { id: "K3", label: "Mahasiswa" },
    { id: "K4", label: "Sumber Daya Manusia" },
    { id: "K5", label: "Keuangan, Sarana & Prasarana" },
    { id: "K6", label: "Pendidikan" },
    { id: "K7", label: "Penelitian" },
    { id: "K8", label: "Pengabdian Masyarakat" },
    { id: "K9", label: "Luaran dan Capaian Tridharma" },
];

const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon className="w-5 h-5 text-emerald-500" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (type.includes('excel') || type.includes('spreadsheet')) return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    if (type.includes('audio')) return <Music className="w-5 h-5 text-purple-500" />;
    if (type.includes('video')) return <Video className="w-5 h-5 text-pink-500" />;
    if (type.includes('powerpoint') || type.includes('presentation')) return <MonitorPlay className="w-5 h-5 text-orange-500" />;
    if (type.includes('zip') || type.includes('rar')) return <FileArchive className="w-5 h-5 text-yellow-600" />;
    return <FileText className="w-5 h-5 text-blue-500" />;
};

const getFileExtension = (filename: string, filetype: string) => {
    const extMatch = filename.match(/\.([^.]+)$/);
    if (extMatch) return extMatch[1].toUpperCase();
    if (filetype) return filetype.split('/')[1]?.toUpperCase() || 'FILE';
    return 'FILE';
};

export default function EvidenFormPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: userLoading } = useUser();
    
    const mode = searchParams.get('mode') as 'add' | 'edit' | 'view' || 'view';
    const isViewOnly = mode === 'view' || user?.role === 'SUPER_ADMIN' || user?.role === 'PIMPINAN';

    const [accessibleProdis, setAccessibleProdis] = useState<any[]>([]);
    const [isProdiLoading, setIsProdiLoading] = useState(true);

    const [formData, setFormData] = useState({
        prodiId: "",
        judul: "",
        deskripsi: "",
        indikator: [] as string[],
        startDate: "",
        endDate: ""
    });
    
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (sessionStorage.getItem('unsavedChanges') === 'true') {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    useEffect(() => {
        const fetchMyProdis = async () => {
            if (!user) return;
            try {
                const res = await apiClient.get('/prodi/my-prodi');
                setAccessibleProdis(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch my prodis", err);
            } finally {
                setIsProdiLoading(false);
            }
        };
        fetchMyProdis();
    }, [user]);

    const markAsUnsaved = () => {
        if (!isViewOnly) sessionStorage.setItem('unsavedChanges', 'true');
    };

    const handleFormChange = (key: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        markAsUnsaved();
    };

    const handleProdiChange = (prodiId: string | null) => {
        if (!prodiId) {
            handleFormChange('prodiId', "");
            handleFormChange('startDate', "");
            handleFormChange('endDate', "");
            return;
        }

        handleFormChange('prodiId', prodiId);
        
        const selectedProdi = accessibleProdis.find(p => p.id === prodiId);
        const accInfo = selectedProdi?.accreditation;

        if (accInfo) {
            handleFormChange('startDate', accInfo.startDate ? accInfo.startDate.split('T')[0] : "");
            handleFormChange('endDate', accInfo.endDate ? accInfo.endDate.split('T')[0] : "");
        } else {
            handleFormChange('startDate', "");
            handleFormChange('endDate', "");
        }
    };

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files).map(f => ({
            name: f.name,
            type: f.type || "unknown",
            size: (f.size / 1024 / 1024).toFixed(2) + " MB",
            raw: f
        }));
        setUploadedFiles(prev => [...prev, ...newFiles]);
        markAsUnsaved();
    };

    const handleSave = () => {
        sessionStorage.removeItem('unsavedChanges');
        alert("Eviden berhasil disimpan!");
        router.push('/eviden');
    };

    const handleCancel = () => {
        if (sessionStorage.getItem('unsavedChanges') === 'true') {
            if (window.confirm("Perubahan belum disimpan. Yakin ingin membatalkan?")) {
                sessionStorage.removeItem('unsavedChanges');
                router.push('/eviden');
            }
        } else {
            router.push('/eviden');
        }
    };

    if (userLoading || isProdiLoading) return <div className="p-8 text-gray-500 font-medium animate-pulse">Memuat form eviden...</div>;
    if (!user) return null;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <header className="flex justify-between items-center mb-8 border-b border-gray-200 pb-6 sticky top-0 bg-gray-50 z-20">
                <div>
                    <Button variant="ghost" onClick={handleCancel} className="text-blue-600 hover:bg-blue-50 px-0 mb-1 gap-2 font-bold text-sm">
                        &larr; Kembali ke Daftar Eviden
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {mode === 'add' ? 'Tambah Eviden Baru' : mode === 'edit' ? 'Edit Eviden' : 'Detail Eviden'}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    {isViewOnly && user.role !== 'SUPER_ADMIN' && user.role !== 'PIMPINAN' ? (
                        <Button onClick={() => router.push(`/eviden/form?mode=edit&id=1`)} className="bg-gray-900 text-white hover:bg-gray-800 gap-2 font-bold shadow-md">
                            <Edit className="w-4 h-4" /> Mulai Edit
                        </Button>
                    ) : !isViewOnly ? (
                        <>
                            <Button variant="outline" onClick={handleCancel} className="font-bold border-gray-300 text-gray-700">
                                Batal / Discard
                            </Button>
                            <Button onClick={handleSave} className="bg-gray-900 text-white hover:bg-gray-800 gap-2 font-bold shadow-md">
                                <Save className="w-4 h-4" /> Simpan Eviden
                            </Button>
                        </>
                    ) : null}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                
                {/* BAGIAN KIRI */}
                <div className="space-y-6 flex flex-col h-full">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
                        
                        <div>
                            <Label className="text-gray-700 font-bold mb-1.5 block">Program Studi</Label>
                            <Select disabled={isViewOnly} value={formData.prodiId} onValueChange={handleProdiChange}>
                                <SelectTrigger className="w-full h-10"><SelectValue placeholder="Pilih Program Studi" /></SelectTrigger>
                                <SelectContent>
                                    {accessibleProdis.map(p => <SelectItem key={p.id} value={p.id}>{p.fullname}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-700 font-bold mb-1.5 block">Tahun Mulai Akreditasi</Label>
                                <Input type="date" disabled={isViewOnly} value={formData.startDate} onChange={(e) => handleFormChange('startDate', e.target.value)} />
                            </div>
                            <div>
                                <Label className="text-gray-700 font-bold mb-1.5 block">Tahun Selesai Akreditasi</Label>
                                <Input type="date" disabled={isViewOnly} value={formData.endDate} onChange={(e) => handleFormChange('endDate', e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <Label className="text-gray-700 font-bold mb-1.5 block">Judul Eviden</Label>
                            <Input disabled={isViewOnly} value={formData.judul} onChange={(e) => handleFormChange('judul', e.target.value)} placeholder="Masukkan judul..." />
                        </div>

                        <div className="react-quill-container [&_.ql-editor]:min-h-[250px] flex-1">
                            <Label className="text-gray-700 font-bold mb-1.5 block">Deskripsi Eviden</Label>
                            <ReactQuill 
                                theme={isViewOnly ? "bubble" : "snow"}
                                readOnly={isViewOnly}
                                value={formData.deskripsi} 
                                onChange={(val) => handleFormChange('deskripsi', val)}
                                className={cn("bg-white", isViewOnly ? "border border-gray-200 rounded-lg bg-gray-50/50 p-2 [&_.ql-editor]:min-h-[100px]" : "rounded-md")}
                            />
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex-1">
                        <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Pilih Kriteria/Indikator</h3>
                        <div className="space-y-3">
                            {KRITERIA_LIST.map((kriteria) => (
                                <div key={kriteria.id} className="flex items-center space-x-3">
                                    <Checkbox 
                                        id={kriteria.id} 
                                        disabled={isViewOnly}
                                        checked={formData.indikator.includes(kriteria.id)}
                                        onCheckedChange={() => {
                                            const newIndikator = formData.indikator.includes(kriteria.id) 
                                                ? formData.indikator.filter(id => id !== kriteria.id) 
                                                : [...formData.indikator, kriteria.id];
                                            handleFormChange('indikator', newIndikator);
                                        }}
                                    />
                                    <label htmlFor={kriteria.id} className={cn("text-sm cursor-pointer select-none", isViewOnly && "cursor-default opacity-80")}>
                                        <span className="font-extrabold text-gray-900">{kriteria.id}</span> <span className="text-gray-700">- {kriteria.label}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* BAGIAN KANAN: Daftar File & Dropzone Terintegrasi */}
                {/* PERBAIKAN: Mengubah h-[calc(...)] dan sticky menjadi h-full agar stretch sejajar dengan box kiri */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4 border-b pb-4 shrink-0">
                        <h3 className="font-bold text-gray-900">Daftar File Diupload</h3>
                        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100">
                            {uploadedFiles.length} File
                        </span>
                    </div>

                    {/* Container Scroll Terintegrasi */}
                    <div className="flex-1 overflow-y-auto pr-3 -mr-3 pb-4 space-y-3 custom-scrollbar relative">
                        {/* 1. File List */}
                        {uploadedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all group">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="p-2.5 bg-gray-50 rounded-lg shrink-0">
                                        {getFileIcon(file.type)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-gray-900 truncate pr-4" title={file.name}>{file.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                {getFileExtension(file.name, file.type)}
                                            </span>
                                            <span className="text-[11px] text-gray-500">{file.size}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="shrink-0 pl-2">
                                    {isViewOnly ? (
                                        <Button size="icon-sm" variant="ghost" className="w-8 h-8 rounded-full text-blue-600 hover:bg-blue-50">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    ) : (
                                        <Button size="icon-sm" variant="ghost" onClick={() => { setUploadedFiles(prev => prev.filter((_, i) => i !== idx)); markAsUnsaved(); }} className="w-8 h-8 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* 2. Dropzone Inline & Sticky */}
                        {!isViewOnly && (
                            <div 
                                className={cn(
                                    "sticky bottom-0 z-10 shrink-0 border-2 border-dashed rounded-xl p-3 flex items-center gap-4 cursor-pointer transition-all shadow-[0_-12px_20px_rgba(255,255,255,0.9)]", 
                                    uploadedFiles.length > 0 ? "mt-3" : "mt-0",
                                    isDragging ? "border-blue-500 bg-blue-50/95 backdrop-blur-sm" : "border-gray-300 bg-gray-50/95 backdrop-blur-sm hover:bg-gray-100"
                                )}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files); }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-10 h-10 bg-white border border-gray-200 shadow-sm rounded-lg flex items-center justify-center shrink-0">
                                    <UploadCloud className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[13px] font-bold text-gray-900">Klik atau drag & drop file {uploadedFiles.length > 0 ? "tambahan " : ""}ke sini</p>
                                    <p className="text-[11px] text-gray-500">PDF, Word, Excel, Gambar, Audio, Video, PPT</p>
                                </div>
                                <input type="file" multiple className="hidden" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files)} />
                            </div>
                        )}
                        
                        {isViewOnly && uploadedFiles.length === 0 && (
                            <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-gray-400">
                                <FileText className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm font-medium">Belum ada file yang diupload.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}