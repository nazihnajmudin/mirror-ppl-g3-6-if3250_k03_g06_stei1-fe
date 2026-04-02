"use client"

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const versions = [
  { id: 3, name: 'Versi 3 (Terbaru)', author: 'Bu Naeni', time: 'Hari Ini, 10:45', latest: true },
  { id: 2, name: 'Versi 2', author: 'Bu Naeni', time: '2 hari yang lalu', latest: false },
  { id: 1, name: 'Versi 1', author: 'Bu Naeni', time: '5 hari yang lalu', latest: false },
];

export default function LKPSPage() {
  const [activeVersion, setActiveVersion] = useState(3);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header Title */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teknik Informatika</h1>
          <p className="text-gray-500 text-sm mt-1">Manajemen Laporan Kinerja Program Studi (LKPS) Periode 2025</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Sidebar (within the page) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Impor Dokumen Baru */}
          <Card className="border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="px-6 py-4 border-b border-gray-100 bg-white">
              <CardTitle className="text-[15px] font-bold text-gray-700">Impor Dokumen Baru</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-4 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">Klik atau drag file Excel ke sini</p>
                  <p className="text-[11px] text-gray-500 mt-1">Maksimal 10MB (.xlsx, .xls)</p>
                </div>
              </div>
              <Button className="w-full mt-6 bg-[#020617] hover:bg-[#020617]/90 text-white font-bold py-6 rounded-xl shadow-md transition-all">
                Upload Revisi LKPS
              </Button>
            </CardContent>
          </Card>

          {/* Riwayat Revisi */}
          <Card className="border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="px-6 py-4 border-b border-gray-100 bg-white">
              <CardTitle className="text-[15px] font-bold text-gray-700">Riwayat Revisi</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {versions.map((v) => (
                  <div 
                    key={v.id}
                    onClick={() => setActiveVersion(v.id)}
                    className={cn(
                      "px-6 py-5 cursor-pointer transition-all border-l-4",
                      activeVersion === v.id 
                        ? "bg-green-50/50 border-green-500" 
                        : "bg-white border-transparent hover:bg-gray-50/50"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[14px] font-bold",
                            activeVersion === v.id ? "text-gray-900" : "text-gray-700"
                          )}>
                            {v.name}
                          </span>
                          {v.latest && activeVersion === v.id && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          )}
                        </div>
                        <p className="text-[12px] text-gray-500 font-medium">Oleh: {v.author} ({v.time})</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Main Preview */}
        <div className="lg:col-span-8 flex flex-col">
          <Card className="border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                  <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900">LKPS_Informatika_V{activeVersion}_Final.xlsx</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[12px] text-gray-500 font-medium">Preview Versi {activeVersion}</span>
                    <span className="text-[12px] text-gray-300">•</span>
                    <span className="text-[12px] text-gray-500 font-medium">Diunggah 10:45 WIB</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="gap-2.5 text-[12px] font-bold border-gray-200 hover:bg-gray-50 rounded-lg px-4 h-10 transition-all">
                <Download className="w-4 h-4" />
                Unduh (.xlsx)
              </Button>
            </div>
            
            <CardContent className="p-0 flex-grow bg-gray-50/40 relative min-h-[500px]">
              <div className="absolute inset-0 p-8 overflow-auto">
                {/* Spreadsheet View Placeholder */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-w-[700px]">
                  <Table>
                    <TableHeader className="bg-gray-50/80">
                      <TableRow className="hover:bg-transparent border-b border-gray-200">
                        <TableHead className="w-14 text-center border-r border-gray-200 font-bold text-[11px] text-gray-400 uppercase tracking-wider">#</TableHead>
                        <TableHead className="border-r border-gray-200 font-bold text-[11px] text-gray-400 uppercase tracking-wider px-6">Elemen Laporan Kinerja Program Studi</TableHead>
                        <TableHead className="w-32 text-center border-r border-gray-200 font-bold text-[11px] text-gray-400 uppercase tracking-wider">Skor</TableHead>
                        <TableHead className="font-bold text-[11px] text-gray-400 uppercase tracking-wider px-6">Keterangan Verifikasi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { id: 1, element: "1. Visi, Misi, Tujuan, dan Strategi", skor: 4.0, ket: "Data lengkap sesuai dokumen Renstra" },
                        { id: 2, element: "2. Tata Pamong, Tata Kelola, dan Kerjasama", skor: 3.8, ket: "MOU kerjasama perlu diperbarui" },
                        { id: 3, element: "3. Mahasiswa", skor: 4.0, ket: "Rasio dosen mahasiswa ideal (1:20)" },
                        { id: 4, element: "4. Sumber Daya Manusia", skor: 3.5, ket: "Jumlah Lektor Kepala perlu ditingkatkan" },
                        { id: 5, element: "5. Keuangan, Sarana, dan Prasarana", skor: 4.0, ket: "Sarana laboratorium sangat memadai" },
                        { id: 6, element: "6. Pendidikan", skor: 3.9, ket: "Kurikulum telah berbasis OBE" },
                        { id: 7, element: "7. Penelitian", skor: 4.0, ket: "Publikasi internasional bereputasi tinggi" },
                        { id: 8, element: "8. Pengabdian kepada Masyarakat", skor: 3.7, ket: "Penerapan teknologi tepat guna" },
                        { id: 9, element: "9. Luaran dan Capaian Tridharma", skor: 4.0, ket: "Waktu tunggu lulusan < 3 bulan" },
                        { id: 10, element: "Indikator Kinerja Tambahan", skor: 4.0, ket: "Melebihi standar nasional pendidikan" },
                      ].map((item) => (
                        <TableRow key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                          <TableCell className="text-center border-r border-gray-100 text-[12px] font-bold text-gray-400 font-mono">{item.id}</TableCell>
                          <TableCell className="border-r border-gray-100 px-6 py-4">
                            <span className="text-[13px] font-bold text-gray-700">{item.element}</span>
                          </TableCell>
                          <TableCell className="text-center border-r border-gray-100">
                            <Badge className={cn(
                              "text-[12px] font-bold px-2.5 py-0.5 rounded-full border-none shadow-sm",
                              item.skor >= 3.8 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            )}>
                              {item.skor.toFixed(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <span className="text-[12px] text-gray-500 font-medium">{item.ket}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
