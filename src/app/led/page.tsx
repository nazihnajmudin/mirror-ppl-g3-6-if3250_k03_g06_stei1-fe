"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, Download, FileText, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";

// DUMMY DATA UNTUK RIWAYAT UPLOAD
const mockHistory = [
    { id: "3", version: 3, date: "Hari ini, 10:45", user: "John Michael", filename: "LED_Informatika_V3_Final.docx", size: "2.4 MB", isLatest: true },
    { id: "2", version: 2, date: "12 Feb 2025", user: "Budi Santoso", filename: "LED_Informatika_V2.docx", size: "2.1 MB", isLatest: false },
    { id: "1", version: 1, date: "10 Feb 2025", user: "John Michael", filename: "LED_Informatika_V1_Draft.docx", size: "1.8 MB", isLatest: false },
];

export default function DokumenLEDPage() {
    // State untuk drag & drop file
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Ref untuk hidden input file
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    };

    const handleFileSelection = (file: File) => {
        // Validasi ekstensi
        const validExtensions = ['.doc', '.docx'];
        const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!validExtensions.includes(extension)) {
            alert("Format tidak valid! Harap unggah file .doc atau .docx");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert("Ukuran file maksimal 10MB!");
            return;
        }

        setSelectedFile(file);
    };

    // --- HANDLER UPLOAD (API S-02-32) ---
    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            // Data dummy, nantinya ambil dari institusi yang sedang aktif
            formData.append("prodiId", "dummy-uuid-prodi-123"); 
            formData.append("periode", "2025");

            // Panggil API Client
            // const response = await apiClient.post('/led/import', formData, {
            //   headers: { 'Content-Type': 'multipart/form-data' }
            // });
            
            // Simulasi delay
            await new Promise(res => setTimeout(res, 1500));
            alert("File berhasil diunggah!");
            setSelectedFile(null); // Reset setelah sukses
            
            // TODO: Refresh history data
        } catch (error) {
            console.error(error);
            alert("Gagal mengunggah file.");
        } finally {
            setIsUploading(false);
        }
    };

    // HANDLER DOWNLOAD
    const handleDownload = async (prodiId: string, periode: string) => {
    try {
        // Endpoint download
        // const response = await apiClient.get(`/led/export/${prodiId}/${periode}`, {
        //   responseType: 'blob' // Penting untuk download file
        // });
        // const url = window.URL.createObjectURL(new Blob([response.data]));
        // const link = document.createElement('a');
        // link.href = url;
        // link.setAttribute('download', 'LED_Document.docx');
        // document.body.appendChild(link);
        // link.click();
        
        alert("Fitur unduh dipanggil!");
    } catch (error) {
        console.error("Gagal mengunduh", error);
        alert("Gagal mengunduh dokumen.");
    }
    };

    return (
    <div className="space-y-6">
        {/* HEADER TITLE */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Teknik Informatika</h1>
            <p className="text-sm text-gray-500 mt-1">Manajemen arsip Laporan Evaluasi Diri (LED) - Periode 2025</p>
        </div>
        </header>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-12 gap-6">
        
        {/* MANAJEMEN & RIWAYAT */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            
            {/* CARD UPLOAD */}
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="px-5 py-4 border-b border-gray-100 bg-white">
                <CardTitle className="text-sm font-bold text-gray-900">Impor Dokumen Baru</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
                
                {/* Drag & Drop Area */}
                <div 
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group",
                    isDragging ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:bg-gray-50"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-5 h-5 text-blue-600" />
                </div>
                
                {selectedFile ? (
                    <div className="text-sm font-medium text-blue-600 truncate max-w-full px-2">
                    {selectedFile.name}
                    </div>
                ) : (
                    <>
                    <p className="text-[13px] font-medium text-gray-900">Klik atau drag file Word ke sini</p>
                    <p className="text-[11px] text-gray-500 mt-1">Maksimal 10MB (.docx, .doc)</p>
                    </>
                )}
                </div>
                
                <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                onChange={handleFileChange}
                />

                <Button 
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold shadow-md h-10"
                >
                {isUploading ? "Mengunggah..." : selectedFile ? "Simpan Dokumen" : "Pilih File Terlebih Dahulu"}
                </Button>
            </CardContent>
            </Card>

            {/* CARD Upload History */}
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex-1">
            <CardHeader className="px-5 py-4 border-b border-gray-100 bg-white">
                <CardTitle className="text-sm font-bold text-gray-900">Riwayat Versi</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {mockHistory.map((item) => (
                <div 
                    key={item.id} 
                    className={cn(
                        "px-5 py-4 border-b border-gray-50 transition-colors flex items-start gap-3 cursor-pointer",
                        item.isLatest ? "bg-[#F0FDF4] hover:bg-[#e7fceb]" : "hover:bg-gray-50 opacity-70"
                    )}
                >
                    <div className="mt-0.5">
                    {item.isLatest ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                    )}
                    </div>
                    <div className="flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                        <span className={cn("text-[13px] font-bold", item.isLatest ? "text-green-800" : "text-gray-700")}>
                            Versi {item.version} {item.isLatest && "(Terbaru)"}
                        </span>
                        <span className={cn("text-[11px] font-medium", item.isLatest ? "text-green-600" : "text-gray-500")}>
                            {item.date}
                        </span>
                    </div>
                    <p className="text-[11px] text-gray-600">Oleh: {item.user}</p>
                    {item.isLatest && (
                        <p className="text-[10px] text-gray-400 mt-1">{item.filename} • {item.size}</p>
                    )}
                    </div>
                </div>
                ))}
            </CardContent>
            </Card>

        </div>

        {/* PREVIEW DOKUMEN */}
        <div className="col-span-12 lg:col-span-8 flex flex-col h-[calc(100vh-140px)]">
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col h-full">
            
            {/* HEADER PREVIEW & EXPORT */}
            <div className="px-6 py-4 border-b border-gray-100 bg-white flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-[15px] font-bold text-gray-900 leading-tight">LED_Informatika_V3_Final.docx</h2>
                    <p className="text-[12px] text-gray-500">Preview Versi 3 • Diunggah 10:45 WIB</p>
                </div>
                </div>
                
                <Button 
                variant="outline" 
                onClick={() => handleDownload("dummy-prodiId", "2025")}
                className="rounded-lg h-9 text-xs font-bold text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm gap-2"
                >
                <Download className="w-4 h-4 text-gray-500" />
                    Unduh (.docx)
                </Button>
            </div>

            {/* AREA PREVIEW KONTEN (MOCK) */}
            <div className="flex-1 bg-gray-100/50 p-6 overflow-y-auto flex justify-center">
                
                {/* Kertas A4 Mockup */}
                <div className="bg-white border border-gray-200 shadow-sm w-[800px] max-w-full min-h-[1000px] p-12 relative">
                
                <div className="border-b-2 border-black pb-4 mb-8 text-center">
                    <h1 className="text-xl font-bold uppercase">Laporan Evaluasi Diri (LED)</h1>
                    <h2 className="text-lg font-bold mt-1">Program Studi Teknik Informatika</h2>
                    <p className="text-sm mt-2">Institut Teknologi Bandung</p>
                </div>
                
                <div className="space-y-6 text-[14px] leading-relaxed text-gray-800 text-justify">
                    <div>
                    <h3 className="font-bold text-[15px] mb-2">BAB I. PENDAHULUAN</h3>
                    <p className="mb-3">Laporan Evaluasi Diri (LED) Program Studi Teknik Informatika disusun sebagai bagian dari pemenuhan instrumen akreditasi LAM INFOKOM. Evaluasi diri ini merupakan hasil refleksi yang komprehensif dari seluruh pemangku kepentingan (stakeholders) program studi...</p>
                    <p>Penyusunan dokumen ini dikoordinasikan oleh Tim Akreditasi Program Studi dengan melibatkan dosen, tenaga kependidikan, mahasiswa, alumni, dan mitra industri.</p>
                    </div>
                    
                    <div>
                    <h3 className="font-bold text-[15px] mb-2">A. Kondisi Eksternal</h3>
                    <p>Perkembangan teknologi informasi dan komunikasi yang sangat pesat di era Revolusi Industri 4.0 menuntut Program Studi Teknik Informatika untuk terus beradaptasi. Tingginya permintaan industri terhadap lulusan yang memiliki kompetensi di bidang Artificial Intelligence, Cloud Computing, dan Cybersecurity menjadi tantangan sekaligus peluang...</p>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-200 rounded text-center text-gray-500 italic mt-10 text-xs">
                    -- Preview dokumen disederhanakan. Unduh dokumen fisik untuk membaca isi secara lengkap --
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