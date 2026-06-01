"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, Download, FileText, FileSpreadsheet, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import { useUser } from "@/hooks/useUser";

// Card Individual Template
function TemplateCard({ 
    category, 
    type, 
    template, 
    isAdmin, 
    refreshData 
}: { 
    category: string, 
    type: string, 
    template: any, 
    isAdmin: boolean, 
    refreshData: () => void 
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isLED = type === 'LED';
    const IconComponent = isLED ? FileText : FileSpreadsheet;
    const acceptFormat = isLED ? ".doc,.docx" : ".xls,.xlsx";
    const formatName = isLED ? "Word (.docx)" : "Excel (.xlsx)";

    const handleFileSelection = (file: File) => {
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (isLED && !['.doc', '.docx'].includes(ext)) { alert("Hanya menerima file Word!"); return; }
        if (!isLED && !['.xls', '.xlsx'].includes(ext)) { alert("Hanya menerima file Excel!"); return; }
        if (file.size > 10 * 1024 * 1024) { alert("Ukuran file maksimal 10MB!"); return; }
        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("name", `Template ${type} LAM ${category}`);
            formData.append("type", type);
            formData.append("category", category);

            await apiClient.post('/templates/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert(`Template ${type} LAM ${category} berhasil diunggah!`);
            setSelectedFile(null);
            refreshData();
        } catch (error: any) {
            alert(error?.response?.data?.message || "Gagal mengunggah template.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Yakin ingin menghapus Template ${type} LAM ${category}?`)) return;
        setIsDeleting(true);
        try {
            await apiClient.delete(`/templates/${template.id}`);
            alert("Template berhasil dihapus.");
            refreshData();
        } catch (error) {
            alert("Gagal menghapus template.");
        } finally {
            setIsDeleting(false);
        }
    };

const handleDownload = async () => {
        if (!template) return;
        try {
            const response = await apiClient.get(`/templates/download/${template.id}`, { responseType: 'blob' });
            
            const ext = isLED ? '.docx' : '.xlsx';
            let safeFilename = template.name;
            
            // Cek agar tidak terjadi nama file seperti "Template.docx.docx"
            if (!safeFilename.toLowerCase().endsWith(ext)) {
                safeFilename += ext;
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', safeFilename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url); // clean memori browser
        } catch (error) {
            alert(`Gagal mengunduh template.`);
        }
    };

    // Tampilan jika template Kosong
    if (!template) {
        if (isAdmin) {
            return (
                <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm flex flex-col h-full">
                    <div className="font-bold text-sm mb-4 text-gray-800">Template Dokumen {type}</div>
                    <div 
                        className={cn("flex-1 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors mb-4", isDragging ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:bg-gray-50")}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.length) handleFileSelection(e.dataTransfer.files[0]); }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <UploadCloud className="w-8 h-8 text-blue-600 mb-3" />
                        {selectedFile ? (
                            <div className="text-sm font-medium text-blue-600 truncate max-w-full px-2">{selectedFile.name}</div>
                        ) : (
                            <p className="text-xs font-medium text-gray-600">Klik atau drag file {formatName} ke sini</p>
                        )}
                    </div>
                    <input type="file" className="hidden" ref={fileInputRef} accept={acceptFormat} onChange={(e) => e.target.files && handleFileSelection(e.target.files[0])} />
                    <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold h-10">
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Upload Template ${type}`}
                    </Button>
                </div>
            );
        } else {
            return (
                <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 shadow-sm flex flex-col h-full items-center justify-center text-center">
                    <div className="font-bold text-sm mb-2 text-gray-800">Template Dokumen {type}</div>
                    <p className="text-xs text-gray-500 italic">Belum ada template yang diunggah oleh Admin.</p>
                </div>
            );
        }
    }

    // Tampilan jika template Sudah Ada
    return (
        <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm flex flex-col h-full relative">
            <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-sm text-gray-800">Template Dokumen {type}</div>
                {isAdmin && (
                    <button onClick={handleDelete} disabled={isDeleting} className="text-[11px] font-bold text-red-500 hover:text-red-700">
                        {isDeleting ? "Menghapus..." : "Hapus"}
                    </button>
                )}
            </div>
            
            {/* Box Preview Hover */}
            <div className="flex-1 relative group border border-gray-200 rounded-lg flex flex-col items-center justify-center bg-gray-50 overflow-hidden mb-4 min-h-[140px]">
                <IconComponent className={cn("w-12 h-12 mb-2", isLED ? "text-blue-500" : "text-emerald-600")} />
                <span className="text-xs font-bold text-gray-600 px-4 text-center line-clamp-2">{template.name}</span>
                <div className="absolute inset-0 bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center backdrop-blur-[2px]">
                    <Button 
                        onClick={handleDownload} 
                        className="bg-white hover:bg-gray-100 text-gray-900 font-bold shadow-xl border border-gray-200"
                    >
                        <Download className="w-4 h-4 mr-2 text-blue-600" /> Unduh
                    </Button>
                </div>
            </div>

            {isAdmin ? (
                <>
                    {/* Tombol Ubah untuk Admin */}
                    <input type="file" className="hidden" ref={fileInputRef} accept={acceptFormat} onChange={(e) => {
                        if(e.target.files) { handleFileSelection(e.target.files[0]); handleUpload(); } // Trigger langsung
                    }} />
                    <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold h-10">
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Ubah Template ${type}`}
                    </Button>
                </>
            ) : (
                <Button onClick={handleDownload} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold h-10 gap-2">
                    <Download className="w-4 h-4" /> Unduh Template {type}
                </Button>
            )}
        </div>
    );
}

// MAIN PAGE
export default function TemplateDokumenPage() {
    const { user, loading } = useUser();
    const [templates, setTemplates] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(true);

    const fetchTemplates = async () => {
        setIsFetching(true);
        try {
            const res = await apiClient.get('/templates');
            setTemplates(res.data.data || []);
        } catch (error) {
            console.error("Gagal mengambil template", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (user) fetchTemplates();
    }, [user]);

    if (loading || isFetching) return <div className="p-8 text-gray-500 animate-pulse">Memuat repositori template...</div>;
    if (!user) return null;

    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'PIMPINAN';

    // Penentuan Kategori yang Ditampilkan
    // Admin selalu melihat keduanya untuk bisa upload. Kaprodi hanya melihat kategori dari template yang dikembalikan API.
    const displayCategories = isAdmin 
        ? ['INFOKOM', 'TEKNIK'] 
        : Array.from(new Set(templates.map(t => t.category)));

    const getTemplate = (cat: string, typ: string) => templates.find(t => t.category === cat && t.type === typ);

    return (
        <div className="space-y-6 max-w-5xl">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Manajemen Template Dokumen</h1>
                <p className="text-sm text-gray-500 mt-1">Repositori Template Dokumen LKPS dan LED Akreditasi yang Sedang Berlaku</p>
            </header>

            {!isAdmin && displayCategories.length === 0 && (
                <Card className="bg-gray-50 border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-600 font-bold">Belum Ada Template Tersedia</p>
                        <p className="text-sm text-gray-400 mt-1">Super Admin belum mengunggah template dokumen untuk program studi Anda.</p>
                    </CardContent>
                </Card>
            )}

            {displayCategories.map(category => (
                <Card key={category} className="rounded-2xl border-gray-200 shadow-sm bg-gray-50/30 overflow-hidden mb-6">
                    <CardHeader className="border-b border-gray-100 bg-white/50 px-6 py-4">
                        <CardTitle className="text-base font-bold text-gray-800">LAM {category === 'INFOKOM' ? 'Infokom' : 'Teknik'}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TemplateCard category={category} type="LKPS" template={getTemplate(category, 'LKPS')} isAdmin={isAdmin} refreshData={fetchTemplates} />
                            <TemplateCard category={category} type="LED" template={getTemplate(category, 'LED')} isAdmin={isAdmin} refreshData={fetchTemplates} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}